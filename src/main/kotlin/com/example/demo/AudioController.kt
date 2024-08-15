package com.example.demo

import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.util.FileCopyUtils
import org.springframework.web.bind.annotation.*
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException

@RestController
@RequestMapping("/api/consult/{uuid}")
class AudioController(private val audioConversionService: AudioConversionService) {

    private val baseDir = "audio_files/"

    @PostMapping
    fun receiveAudio(
        @PathVariable uuid: String,
        @RequestBody audioData: AudioData
    ): ResponseEntity<String> {
        println("Received audio data: ${audioData.audioData.take(100)}")
        val dir = File(baseDir)
        if (!dir.exists()) {
            dir.mkdirs()
        }

        val file = File("$baseDir$uuid.bin")
        return try {
            FileOutputStream(file, true).use { fos ->
                val audioBytes = audioData.decodedAudioData
                fos.write(audioBytes)
            }
            ResponseEntity("Audio data received", HttpStatus.OK)
        } catch (e: IOException) {
            ResponseEntity("Failed to save audio data", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @PostMapping("/audio-file")
    fun getAudioFile(@PathVariable uuid: String): ResponseEntity<ByteArray> {
        val file = File("$baseDir$uuid.bin")

        if (!file.exists()) {
            return ResponseEntity(HttpStatus.NOT_FOUND)
        }

        val audioBytes = try {
            FileInputStream(file).use { fis ->
                FileCopyUtils.copyToByteArray(fis)
            }
        } catch (e: IOException) {
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }

        val headers = HttpHeaders().apply {
            add("Content-Type", "audio/wav")
            add("Content-Disposition", "attachment; filename=$uuid.wav")
        }

        return ResponseEntity(audioBytes, headers, HttpStatus.OK)
    }
}
