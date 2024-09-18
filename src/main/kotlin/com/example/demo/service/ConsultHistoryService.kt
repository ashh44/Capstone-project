package com.example.demo.service

import com.example.demo.model.ConsultHistory
import com.example.demo.repository.ConsultHistoryRepository
import org.springframework.stereotype.Service
import java.time.ZonedDateTime
import java.util.UUID

@Service
class ConsultHistoryService(private val repository: ConsultHistoryRepository) {

    fun createNewSession(sessionId: UUID, username: String) {
        val consultHistory = ConsultHistory(
            sessionId = sessionId,  // No need to convert to String
            creationTime = ZonedDateTime.now(),
            userName = username
        )
        repository.save(consultHistory)
    }

    fun updateSummary(sessionId: UUID, summary: String) {
        val consultHistory = repository.findById(sessionId).orElseThrow()
        consultHistory.summary = summary
        repository.save(consultHistory)
    }

    fun updateLetter(sessionId: UUID, letter: String) {
        val consultHistory = repository.findById(sessionId).orElseThrow()
        consultHistory.letter = letter
        repository.save(consultHistory)
    }

    fun getHistoryForUser(username: String): List<ConsultHistory> {
        return repository.findByUserName(username)
    }
}