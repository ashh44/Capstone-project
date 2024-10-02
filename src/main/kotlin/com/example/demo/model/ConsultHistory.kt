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

//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    var id: Long? = null,  // Using 'id' as primary key
//
//    @Column(columnDefinition = "UUID", nullable = false)
//    var sessionId: UUID,

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