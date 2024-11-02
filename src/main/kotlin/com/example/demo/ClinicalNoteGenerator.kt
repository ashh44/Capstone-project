package com.example.demo
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.io.File
import java.io.IOException

fun ClinicalMain() {
    val transcriptionFilePath = "transcribed files/7087_transcription_result.txt"
    val gptApiKey = "passvalidtokenhere"
    val gptApiUrl = "https://api.openai.com/v1/chat/completions"

    val transcriptionText = try {
        File(transcriptionFilePath).readText(Charsets.UTF_8)
    } catch (e: IOException) {
        println("Error reading transcription file: ${e.message}")
        return
    }

    // Generate clinical notes from transcription
    val client = OkHttpClient()

    val requestBody = Gson().toJson(
        mapOf(
            "model" to "gpt-4",
            "messages" to listOf(
                mapOf(
                    "role" to "user",
                    "content" to "Generate clinical notes based on the following transcription:\n\n$transcriptionText"
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
        .addHeader("Content-Type", "application/json")
        .build()

    try {
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Unexpected code $response")
            }

            val responseBody = response.body?.string() ?: ""
            val gson = Gson()
            val mapType = object : TypeToken<Map<String, Any>>() {}.type
            val gptResponse = gson.fromJson<Map<String, Any>>(responseBody, mapType)

            // Safely parse the response
            val choices = gptResponse["choices"] as? List<*>
            val choice = choices?.firstOrNull() as? Map<*, *>
            val content = (choice?.get("message") as? Map<*, *>)?.get("content") as? String
            val clinicalNotes = content ?: "No clinical notes generated."

            println("Generated Clinical Notes:\n$clinicalNotes")
        }
    } catch (e: IOException) {
        println("Error generating clinical notes: ${e.message}")
    }
}