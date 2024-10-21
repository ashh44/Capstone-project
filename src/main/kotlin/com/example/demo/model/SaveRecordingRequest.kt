package com.example.demo.model

import java.util.UUID

data class SaveRecordingRequest(
    val audioData: String,  // Base64 encoded audio data
    val userName: String

)
