package com.example.demo
import org.springframework.stereotype.Service
import java.io.File
import java.util.UUID

@Service
class AudioConversionService {
    private val baseDir = "audio_files/"
    fun convertBinToWav(uuid: UUID): Pair<File, String> {
        // Here is the input and output file paths (make sure the directory exists)
        val inputFile = File("$baseDir$uuid.bin")
        val outputFile = File("$baseDir$uuid.wav")

        // Construct the FFmpeg command
        val command = arrayOf(
            "ffmpeg",
            "-f", "s16le",     // Input format: signed 16-bit little-endian
            "-ar", "44100",    // Sample rate: 44.1kHz
            "-ac", "1",        // Audio channels: 1 (mono)
            "-i", inputFile.absolutePath,  // Input file
            "-acodec", "pcm_s16le",  // Output codec: PCM 16-bit little-endian
            outputFile.absolutePath  // Output file
        )

        // Execute the FFmpeg command
        val process = ProcessBuilder(*command)
            .redirectErrorStream(true)
            .start()

        // Wait for the process to complete
        process.waitFor()

        // Check if the conversion was successful
        if (process.exitValue() != 0) {
            throw RuntimeException("FFmpeg conversion failed.")
        }

        // Output a success message
        val successMessage = "FFmpeg conversion completed successfully. UUID: $uuid"
        return Pair(outputFile, successMessage)
    }
}
