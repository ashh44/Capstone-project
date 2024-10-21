package com.example.demo.service
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import org.springframework.stereotype.Service
import java.io.File
import java.io.IOException
@Service
class ClinicalNoteService {
    fun generateClinicalNotes(transcriptionText: String): String {
        val gptApiKey = "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"
        val gptApiUrl = "https://api.openai.com/v1/chat/completions"

        val client = OkHttpClient()

        val requestBody = Gson().toJson(
            mapOf(
                "model" to "gpt-4",
                "messages" to listOf(
                    mapOf(
                        "role" to "user",
                        "content" to "Generate clinical notes based on the following transcription :\n\n$transcriptionText"
                    )
                ),
                "max_tokens" to 150,
                "temperature" to 0.7
            )
        )

        val request = Request.Builder()
            .url(gptApiUrl)
            .post(requestBody.toRequestBody("application/json".toMediaType()))
            .addHeader("Authorization", "Bearer $gptApiKey")
            .build()

        return client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Failed to generate clinical notes")
            }

            val responseBody = response.body?.string() ?: ""
            val gptResponse = Gson().fromJson(responseBody, Map::class.java)
            val choices = (gptResponse["choices"] as List<*>)
            val choice = choices.first() as Map<*, *>
            val content = (choice["message"] as Map<*, *>)["content"] as String
            content
        }
    }
}
