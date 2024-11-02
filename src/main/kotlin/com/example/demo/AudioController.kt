package com.example.demo

import com.example.demo.repository.ConsultHistoryRepository
import com.example.demo.model.ConsultHistory
import com.example.demo.model.GenerateSummaryRequest
import com.example.demo.model.SaveRecordingRequest
import com.example.demo.service.ConsultHistoryService
import com.example.demo.service.TranscriptionService
import com.example.demo.service.ClinicalNoteService
import com.example.demo.service.LetterService
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
import java.util.UUID


@RestController
@RequestMapping("/api/consult/{uuid}")
class AudioController(
    private val audioConversionService: AudioConversionService,
    private val consultHistoryRepository: ConsultHistoryRepository,
    private val consultHistoryService: ConsultHistoryService,
    private val transcriptionService: TranscriptionService,
    private val clinicalNoteService: ClinicalNoteService,
    private val letterService: LetterService,
    //private val consultService: ConsultService


) {
    private val baseDir = "audio_files/"

    @PostMapping
    fun receiveAudio(
        @PathVariable uuid: UUID,  // Changed to UUID
        @RequestBody audioData: AudioData
    ): ResponseEntity<String> {
        println("Received audio data: ${audioData.audioData.take(100)}")
        val dir = File(baseDir)
        if (!dir.exists()) {
            dir.mkdirs()
        }

        val file = File("$baseDir$uuid.bin")
        val authentication = SecurityContextHolder.getContext().authentication
        return try {
            // Extract user details
            var username: String? = null
            if (authentication != null && authentication.principal is UserDetails) {
                username = (authentication.principal as UserDetails).username
            }

            // Use ConsultHistoryService to create a new session or get existing one
            if (!consultHistoryRepository.existsById(uuid)) {
                consultHistoryService.createNewSession(uuid, username ?: "")
            } else {
                println("UUID already exists")
            }

            FileOutputStream(file, true).use { fos ->
                val audioBytes = audioData.decodedAudioData
                fos.write(audioBytes)
            }

            ResponseEntity("Audio data received", HttpStatus.OK)
        } catch (e: IOException) {
            ResponseEntity("Failed to save audio data", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @PostMapping("/save")
    fun saveRecording(
        @PathVariable uuid: UUID,
        @RequestBody request: SaveRecordingRequest
    ): ResponseEntity<String> {
        val dir = File(baseDir)
        if (!dir.exists()) {
            dir.mkdirs()
        }
        val binFile = File("$baseDir$uuid.bin")

        return try {
            // Save the .bin file
            audioConversionService.saveBinFile(uuid, request.audioData)

            //  Create new ConsultHistory if not exists
            val authentication = SecurityContextHolder.getContext().authentication
            val username = if (authentication.principal is UserDetails) {
                (authentication.principal as UserDetails).username
            } else {
                request.userName // Fallback to the passed username
            }

            consultHistoryService.createNewSession(uuid, username)

            ResponseEntity.ok("Recording saved successfully.")
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save recording: ${e.message}")
        }
    }

    @PostMapping("/generate-summary")
    fun generateSummaryAndLetter(
        @PathVariable ("uuid") sessionId: UUID,
        @RequestBody request: GenerateSummaryRequest
    ): ResponseEntity<String> {
        return try {


            // Step 1: Convert .bin to .wav
            val wavFile = audioConversionService.getOrCreateWavFile(sessionId)
            println("wav file generated: $wavFile")
            // Step 2: Transcribe the audio file
            val transcriptionText = transcriptionService.transcribeAudio(wavFile)
            println("Transcription text: $transcriptionText")
            // Step 3: Generate the clinical notes (summary)
            println("transcription text completed ")
            val summary = clinicalNoteService.generateClinicalNotes(transcriptionText)
            println("clinical notes completed ")
            // Step 4: Generate the consult letter
            val consultLetter = letterService.generateConsultLetter(transcriptionText)

            println("pre save consulthistory ")
            //  Update ConsultHistory with the summary and letter
            consultHistoryService.updateSummary(sessionId, summary)
            println(" consulthistory update summary done")
            consultHistoryService.updateLetter(sessionId, consultLetter)
            println(" consulthistory update letter done")
            ResponseEntity.ok("Summary and letter generated successfully.")
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to generate summary and letter: ${e.message}")
        }
    }
}
/*
    @GetMapping("/audio-file")
    fun getAudioFile(@PathVariable uuid: UUID): ResponseEntity<ByteArray> {  // Changed to UUID
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
}*/
