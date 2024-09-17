package com.example.demo

import com.example.demo.model.ConsultHistory
import com.example.demo.repository.ConsultHistoryRepository
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.util.FileCopyUtils
import org.springframework.web.bind.annotation.*
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.time.ZoneId
import java.time.ZonedDateTime


@RestController
@RequestMapping("/api/consult/{uuid}")
class AudioController(private val audioConversionService: AudioConversionService,
                      private val consultHistoryRepository: ConsultHistoryRepository) {

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
        var consultHistory: ConsultHistory? = null
        val authentication = SecurityContextHolder.getContext().authentication
        return try {

            // Extract user details
            var username: String? = null
            if (authentication != null && authentication.getPrincipal() is UserDetails) {
                username = (authentication.getPrincipal() as UserDetails).username
            }
            // Check if consultHistory record exists for this uuid
            if (!consultHistoryRepository.existsById(uuid)) {

                // If not, create a new record
                consultHistory = ConsultHistory(
                    sessionId = uuid,
                    creationTime = ZonedDateTime.now(ZoneId.of("Australia/Sydney")),
                    userName = username.toString()
                )
                consultHistoryRepository.save(consultHistory)
            }
            else{println("UUID already exist")}
            FileOutputStream(file, true).use { fos ->
                val audioBytes = audioData.decodedAudioData
                fos.write(audioBytes)
            }

            ResponseEntity("Audio data received", HttpStatus.OK)
        } catch (e: IOException) {
            consultHistory?.let {
                // If there is an error and a consultHistory record was added, delete it
                consultHistoryRepository.delete(it)
            }
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