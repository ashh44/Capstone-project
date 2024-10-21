
package com.example.demo
import org.springframework.stereotype.Service
import java.io.File
import java.util.UUID
import java.util.Base64

@Service
class AudioConversionService {

    private val baseDir = "audio_files/"

    fun saveBinFile(uuid: UUID, base64Audio: String) {
        val binFile = File("$baseDir$uuid.bin")
        val decodedBytes = Base64.getDecoder().decode(base64Audio)
        binFile.writeBytes(decodedBytes)
        println("Saved .bin file for session ID: $uuid")
    }

    fun getOrCreateWavFile(uuid: UUID): File {
        val wavFile = File("$baseDir$uuid.wav")

        if (wavFile.exists()) {
            println("Cached .wav file found for session ID: $uuid")
            return wavFile
        }

        val binFile = File("$baseDir$uuid.bin")
        if (!binFile.exists()) {
            throw RuntimeException("Input .bin file does not exist: ${binFile.absolutePath}")
        }

        val command = arrayOf(
            "ffmpeg",
            "-f", "s16le",
            "-ar", "44100",
            "-ac", "1",
            "-i", binFile.absolutePath,
            wavFile.absolutePath
        )

        val process = ProcessBuilder(*command).redirectErrorStream(true).start()
        process.waitFor()

        if (process.exitValue() != 0) {
            throw RuntimeException("FFmpeg conversion failed")
        }

        println("Successfully created .wav file for session ID: $uuid")
        return wavFile
    }
}
