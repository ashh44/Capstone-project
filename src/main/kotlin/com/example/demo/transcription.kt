package com.example.demo
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.*
import okhttp3.RequestBody.Companion.asRequestBody
import org.json.JSONObject
import java.io.File
import java.io.IOException
import java.io.PrintWriter

fun main() {
    val apiKey = "f4e5ae7c485385f78b03c165bb199e5dc4f08377"
    val audioFilePath = "audio_files/7087.wav"
    val outputFilePath = "transcribed files/7087_transcription_result.txt"

    val client = OkHttpClient()

    val mediaType = "audio/wav".toMediaType()
    val file = File(audioFilePath)
    val requestBody = file.asRequestBody(mediaType)

    val request = Request.Builder()
        .url("https://api.deepgram.com/v1/listen")
        .post(requestBody)
        .addHeader("Authorization", "Token $apiKey")
        .addHeader("Content-Type", "audio/wav")
        .build()

    client.newCall(request).execute().use { response ->
        if (!response.isSuccessful) {
            throw IOException("Unexpected code $response")
        }

        val responseBody = response.body?.string() ?: ""
        println("Response Body: $responseBody")
        val jsonResponse = JSONObject(responseBody)

        // Extracting the transcript field
        val transcriptionText = try {
            // Navigating the JSON response to fetch the transcript string which actually has all the text
            val results = jsonResponse.getJSONObject("results")
            val channels = results.getJSONArray("channels")
            val alternatives = channels.getJSONObject(0)
                .getJSONArray("alternatives")
            alternatives.getJSONObject(0).getString("transcript")
        } catch (e: Exception) {
            println("Error extracting transcript: ${e.message}")
            "Error extracting transcript."
        }

        // The transcription script is converted on a text file with only the transcript string
        PrintWriter(outputFilePath).use { out ->
            out.println(transcriptionText)
        }

        println("Transcription saved to $outputFilePath")
    }
}