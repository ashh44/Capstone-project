package com.example.demo.config

import com.example.demo.websocket.AudioWebsocketHandler
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean

@Configuration
@EnableWebSocket
class WebSocketConfig : WebSocketConfigurer {
    private val logger = LoggerFactory.getLogger(WebSocketConfig::class.java)
    init {
        logger.info("WebSocketConfig is initialized")
    }
    @Bean
    fun audioWebsocketHandler(): AudioWebsocketHandler {
        return AudioWebsocketHandler()
    }

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry.addHandler(audioWebsocketHandler(), "/deepgram-proxy")
            .setAllowedOrigins("*")
    }

    @Bean
    fun createWebSocketContainer(): ServletServerContainerFactoryBean {
        val container = ServletServerContainerFactoryBean()
        container.maxTextMessageBufferSize = 8192 // 8KB
        container.maxBinaryMessageBufferSize = 64 * 1024 // 64KB
        container.maxSessionIdleTimeout = 15 * 60 * 1000L // 15 minutes
        return container
    }
}