package com.example.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.boot.runApplication
import org.springframework.core.io.FileSystemResource
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import java.io.File
import java.util.UUID
import java.nio.file.Path
import java.nio.file.Paths

// This is the main application class
@SpringBootApplication
class AudioConversionApplication

// entry point (function)
fun main(args: Array<String>) {
    runApplication<AudioConversionApplication>(*args)
}
// Service class in order to handle audio conversion
@Service
public class AudioConversionService {
    fun convertBinToWav(uuid: UUID): Pair<File, String> {
        // Here is the input and output file paths (need to mention file path, replace it with your own filepath)
        val inputFile = File("C:/Users/ASFIA/IdeaProjects/demo/audio_files${uuid}.bin")
//        val outputFile = File.createTempFile("output_${uuid}", ".wav")
        val outputFile = File("C:/Users/ASFIA/IdeaProjects/demo/audio_files${uuid}.wav")

        // Construct the FFmpeg command based on description provided
        val command = arrayOf(
            "ffmpeg",
            "-f", "s16le",     // Input format: signed 16-bit little-endian
            "-ar", "44100",    // Sample rate: 44.1kHz
            "-ac", "1",        // Audio channels: 1 (mono)
            "-i", inputFile.absolutePath,  // Input file
            "-acodec", "pcm_s16le",  // Output codec: PCM 16-bit little-endian
            outputFile.absolutePath  // Output file
        )

        // Execution the FFMpeg command
        val process = ProcessBuilder(*command)
            .redirectErrorStream(true)
            .start()

        // Waiting
        process.waitFor()

        //Can remove if needed
        // Check if the conversion was successful
        if (process.exitValue() != 0) {
            throw RuntimeException("The file conversion of FFMpeg has not been successful.")
        }
        // Output a message if the conversion is successful
        val successMessage = "The file conversion of FFMpeg completed successfully. UUID: $uuid"
        return Pair(outputFile, successMessage)
    }
}


@Controller //Adapted from  Geeks4Geeks
class AudioConversionController(private val audioConversionService: AudioConversionService) {

    @GetMapping("/convert/{uuid}")
    fun convertAudio(@PathVariable uuid: UUID): ResponseEntity<Resource> {
        // Convert the .bin file to .wav
        val (convertedFile, successMessage) = audioConversionService.convertBinToWav(uuid)

        // Create a Path from the converted file
        val path = Paths.get(convertedFile.absolutePath)

        // Loading the resources
        val resource = UrlResource(path.toUri())

        // Here we are returning the Response Entity with audio file as a wav
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType("audio/wav"))
            .header("Conversion is successful", successMessage)
            .body(resource)
    }
}