package com.example.demo.controller

import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.pdmodel.PDPage
import org.apache.pdfbox.pdmodel.PDPageContentStream
import org.apache.pdfbox.pdmodel.font.PDType1Font

import org.springframework.core.io.InputStreamResource
import org.springframework.http.MediaType
import com.example.demo.service.ConsultHistoryService
import org.apache.pdfbox.pdmodel.common.PDRectangle
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.bind.annotation.*
import java.awt.SystemColor.text
//import java.awt.SystemColor.text

import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
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
        val dtos = history.map { ConsultHistoryDTO(it.sessionId, it.creationTime, it.summary, it.letter, it.userName )}
        return ResponseEntity.ok(dtos)
    }


    @GetMapping("/{sessionId}/download-summary")
    fun downloadSummary(@PathVariable sessionId: UUID): ResponseEntity<ByteArray> {

        val consultHistory = service.getHistoryBySessionId(sessionId)


        val summaryPdf = PdfDocument("Summary", consultHistory.summary ?: "No Summary Available")



        val headers = HttpHeaders()
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=summary_$sessionId.pdf")
        headers.contentType = MediaType.APPLICATION_PDF

        return ResponseEntity(summaryPdf, headers, HttpStatus.OK)
    }

    @GetMapping("/{sessionId}/download-letter")
    fun downloadLetter(@PathVariable sessionId: UUID): ResponseEntity<ByteArray> {
        // Fetch the ConsultHistory for the given sessionId
        val consultHistory = service.getHistoryBySessionId(sessionId)


        val letterPdf = PdfDocument("Letter", consultHistory.letter ?: "No Summary Available")

        // Create headers
        val headers = HttpHeaders()
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=letter_$sessionId.pdf")
        headers.contentType = MediaType.APPLICATION_PDF

        return ResponseEntity(letterPdf, headers, HttpStatus.OK)
    }


    private fun PdfDocument(title: String, content: String): ByteArray {
        PDDocument().use { document ->
            val page = PDPage(PDRectangle.A4)
            document.addPage(page)

            PDPageContentStream(document, page).use { contentStream ->
                val font = PDType1Font.HELVETICA
                val fontBold = PDType1Font.HELVETICA_BOLD
                val fontSize = 12f
                val leading = 1.5f * fontSize
                val margin = 50f
                val startX = margin
                var startY = page.mediaBox.height - margin

                // Set up the content stream for the title
                contentStream.beginText()
                contentStream.setFont(fontBold, 20f)
                contentStream.newLineAtOffset(startX, startY)
                contentStream.showText(title)
                contentStream.endText()

                // Adjust starting position for content
                startY -= 40f

                contentStream.beginText()
                contentStream.setFont(font, fontSize)
                contentStream.newLineAtOffset(startX, startY)

                // Split content by new lines
                val lines = content.split("\n")

                for (line in lines) {
                    val wrappedLines = wrapText(line, font, fontSize, page.mediaBox.width - 2 * margin)

                    for (wrappedLine in wrappedLines) {
                        if (startY < margin) {
                            // If we run out of space on the current page, create a new page
                            contentStream.endText()
                            contentStream.close()

                            val newPage = PDPage(PDRectangle.A4)
                            document.addPage(newPage)
                            startY = newPage.mediaBox.height - margin
                            PDPageContentStream(document, newPage).use { newContentStream ->
                                newContentStream.beginText()
                                newContentStream.setFont(font, fontSize)
                                newContentStream.newLineAtOffset(startX, startY)
                                newContentStream.showText(wrappedLine)
                                newContentStream.newLineAtOffset(0f, -leading)
                            }
                        } else {
                            contentStream.showText(wrappedLine)
                            contentStream.newLineAtOffset(0f, -leading)
                            startY -= leading
                        }
                    }
                }

                contentStream.endText()
            }

            // Save to ByteArrayOutputStream
            ByteArrayOutputStream().use { outputStream ->
                document.save(outputStream)
                return outputStream.toByteArray()
            }
        }
    }

    // Helper method to wrap text based on available width
    private fun wrapText(text: String, font: PDType1Font, fontSize: Float, maxWidth: Float): List<String> {
        val words = text.split(" ")
        val lines = mutableListOf<String>()
        var currentLine = ""

        for (word in words) {
            val testLine = if (currentLine.isEmpty()) word else "$currentLine $word"
            val textWidth = font.getStringWidth(testLine) / 1000 * fontSize

            if (textWidth < maxWidth) {
                currentLine = testLine
            } else {
                lines.add(currentLine)
                currentLine = word
            }
        }

        if (currentLine.isNotEmpty()) {
            lines.add(currentLine)
        }

        return lines
    }
}

data class ConsultHistoryDTO(
    val sessionId: UUID,
    val creationTime: ZonedDateTime,
    val summary: String?,
    val letter: String?,
    val userName: String?
)
