package com.example.demo.service
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.*
import okhttp3.RequestBody.Companion.asRequestBody
import org.json.JSONObject
import org.springframework.stereotype.Service
import java.io.File
import java.io.IOException
import java.io.PrintWriter


@Service
class TranscriptionService {
    fun transcribeAudio(wavFile: File): String {
        val apiKey = "f4e5ae7c485385f78b03c165bb199e5dc4f08377"
        val client = OkHttpClient()
        val mediaType = "audio/wav".toMediaType()
        val requestBody = wavFile.asRequestBody(mediaType)

        val request = Request.Builder()
            .url("https://api.deepgram.com/v1/listen")
            .post(requestBody)
            .addHeader("Authorization", "Token $apiKey")
            .addHeader("Content-Type", "audio/wav")
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Failed to transcribe audio")
            }

            val responseBody = response.body?.string() ?: ""
            val jsonResponse = JSONObject(responseBody)
            val transcriptionText = try {
                // Extract the transcription text from the response
                val results = jsonResponse.getJSONObject("results")
                val channels = results.getJSONArray("channels")
                val alternatives = channels.getJSONObject(0)
                    .getJSONArray("alternatives")
                alternatives.getJSONObject(0).getString("transcript")
            } catch (e: Exception) {
                "Error extracting transcript: ${e.message}"
            }

            return transcriptionText
        }
    }
}
