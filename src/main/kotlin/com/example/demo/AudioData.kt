package com.example.demo

import com.fasterxml.jackson.annotation.JsonIgnore
import java.util.*

data class AudioData(
    val audioData: String,
    val sampleRate: Int,
    val sampleDepth: Int,
    val sampleLength: Int,
    val pseudoTimestamp: Long
) {
    @get:JsonIgnore
    val decodedAudioData: ByteArray
        get() {
            if (!audioData.matches(Regex("^[A-Za-z0-9+/=]+$"))) {
                throw IllegalArgumentException("Invalid characters found in Base64 string")
            }
            return Base64.getDecoder().decode(audioData)
        }
}
