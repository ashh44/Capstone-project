package com.example.demo.controller

import com.example.demo.service.ConsultHistoryService
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import java.nio.file.Files
import java.nio.file.Paths
import java.time.ZonedDateTime
import java.util.UUID

@RestController
@RequestMapping("/api/consult")
class ConsultHistoryController(private val service: ConsultHistoryService) {

    @PostMapping("/new-session")
    fun newSession(@RequestParam sessionId: UUID, @AuthenticationPrincipal user: UserDetails): ResponseEntity<String> {
        service.createNewSession(sessionId, user.username)
        return ResponseEntity.ok("Session created")
    }

    @PostMapping("/summary")
    fun updateSummary(@RequestParam sessionId: UUID, @RequestBody summary: String): ResponseEntity<String> {
        service.updateSummary(sessionId, summary)
        return ResponseEntity.ok("Summary updated")
    }

    @PostMapping("/letter")
    fun updateLetter(@RequestParam sessionId: UUID, @RequestBody letter: String): ResponseEntity<String> {
        service.updateLetter(sessionId, letter)
        return ResponseEntity.ok("Letter updated")
    }

    @GetMapping("/history")
    fun getHistory(@AuthenticationPrincipal user: UserDetails): ResponseEntity<List<ConsultHistoryDTO>> {
        val history = service.getHistoryForUser(user.username)
        val dtos = history.map { ConsultHistoryDTO(it.sessionId, it.creationTime, it.summary, it.letter) }
        return ResponseEntity.ok(dtos)
    }

    // New endpoint for downloading session data as text file
    @GetMapping("/{sessionId}/download")
    fun downloadSessionData(@PathVariable sessionId: UUID): ResponseEntity<ByteArray> {
        // Fetch the ConsultHistory for the given sessionId
        val consultHistory = service.getHistoryBySessionId(sessionId)

        // Construct the content of the text file
        val fileContent = """
            Session ID: ${consultHistory.sessionId}
            Timestamp: ${consultHistory.creationTime}
            Summary: ${consultHistory.summary ?: "N/A"}
            Letter: ${consultHistory.letter ?: "N/A"}
        """.trimIndent()

        // Create headers
        val headers = HttpHeaders()
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=session_$sessionId.txt")

        // Return the text file as a byte array
        return ResponseEntity(fileContent.toByteArray(), headers, HttpStatus.OK)
    }
}

data class ConsultHistoryDTO(
    val sessionId: UUID,
    val creationTime: ZonedDateTime,
    val summary: String?,
    val letter: String?
)
