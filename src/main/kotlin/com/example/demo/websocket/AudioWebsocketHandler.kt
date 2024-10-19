package com.example.demo.websocket

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.socket.*
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.net.URI
import org.java_websocket.client.WebSocketClient
import org.java_websocket.handshake.ServerHandshake
import com.fasterxml.jackson.databind.ObjectMapper
import java.util.concurrent.TimeUnit

@Component
class AudioWebsocketHandler : TextWebSocketHandler() {

    private val logger = LoggerFactory.getLogger(AudioWebsocketHandler::class.java)
    private val deepgramApiKey = "f4e5ae7c485385f78b03c165bb199e5dc4f08377"
    private val deepgramUrl = "wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=44100&channels=1&punctuate=true&language=en-US&interim_results=true"

    private val sessions = mutableMapOf<WebSocketSession, DeepgramWebSocketClient>()
    private val objectMapper = ObjectMapper()

    override fun afterConnectionEstablished(session: WebSocketSession) {
        logger.info("Frontend WebSocket connection established with session: ${session.id}")

    }

    override fun handleBinaryMessage(session: WebSocketSession, message: BinaryMessage) {
        var deepgramClient = sessions[session]

        // Check if Deepgram WebSocket is connected, otherwise establish the connection
        if (deepgramClient == null || !deepgramClient.isOpen) {
            logger.info("Deepgram client is not connected. Establishing connection now...")
            deepgramClient = DeepgramWebSocketClient(URI(deepgramUrl), session)
            try {
                deepgramClient.connectBlocking(10, TimeUnit.SECONDS)
                sessions[session] = deepgramClient
            } catch (e: InterruptedException) {
                logger.error("Error connecting to Deepgram: ${e.message}")
                return
            }
        }

        // Send the received binary raw PCM audio data to Deepgram
        val data = message.payload.array()
        logger.info("Received ${data.size} bytes of raw PCM audio data from frontend")
        deepgramClient.send(data)
        logger.debug("Sent ${data.size} bytes to Deepgram")
    }


    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        logger.info("Frontend WebSocket connection closed: ${session.id}, status: $status")
        sessions[session]?.close()
        sessions.remove(session)
    }

    private fun reconnectDeepgramClient(session: WebSocketSession) {
        sessions[session]?.close()
        val newClient = DeepgramWebSocketClient(URI(deepgramUrl), session)
        try {
            newClient.connectBlocking(10, TimeUnit.SECONDS)
            sessions[session] = newClient
        } catch (e: InterruptedException) {
            logger.error("Failed to reconnect to Deepgram: ${e.message}")
        }
    }

    inner class DeepgramWebSocketClient(serverUri: URI, private val frontendSession: WebSocketSession) : WebSocketClient(serverUri) {

        init {
            this.addHeader("Authorization", "Token $deepgramApiKey")
        }

        override fun onOpen(handshakedata: ServerHandshake?) {
            logger.info("Connected to Deepgram successfully.")
        }

        override fun onMessage(message: String?) {
            try {
                val jsonNode = objectMapper.readTree(message)
                val transcript = jsonNode.path("channel").path("alternatives").firstOrNull()?.path("transcript")?.asText()
                if (!transcript.isNullOrBlank()) {
                    val jsonResponse = objectMapper.writeValueAsString(mapOf("transcript" to transcript))
                    if (frontendSession.isOpen) {
                        frontendSession.sendMessage(TextMessage(jsonResponse))
                        logger.debug("Sent transcription back to frontend: $transcript")
                    }
                }
            } catch (e: Exception) {
                logger.error("Error processing Deepgram message: ${e.message}", e)
            }
        }

        override fun onClose(code: Int, reason: String?, remote: Boolean) {
            logger.warn("Deepgram WebSocket closed: code=$code, reason=$reason, remote=$remote")
        }

        override fun onError(ex: Exception?) {
            logger.error("Error with Deepgram connection: ${ex?.message}", ex)
        }
    }
}
