package com.example.demo.model

import jakarta.persistence.*
import java.time.ZonedDateTime
import java.util.UUID

@Entity
@Table(name = "consult_history")
data class ConsultHistory(
    @Id
    @Column(columnDefinition = "UUID")
    var sessionId: UUID,  // Changed to UUID

    @Column(nullable = false)
    var creationTime: ZonedDateTime,

    @Column(name = "username", nullable = false)  // This line is crucial
    var userName: String,

    @Column
    var summary: String? = null,

    @Column
    var letter: String? = null
) {
    // No-argument constructor required by JPA
    constructor() : this(UUID.randomUUID(), ZonedDateTime.now(), "", null, null)
}