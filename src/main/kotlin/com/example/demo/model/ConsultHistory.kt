package com.example.demo.model

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.ZonedDateTime

@Entity
@Table(name = "consult_history")
data class ConsultHistory(
    @Id
    val sessionId: String,
    val creationTime: ZonedDateTime,
    val summary: String? = null,
    val letter: String? = null,
    val userName: String
)
{
    // No-argument constructor for Hibernate
    constructor() : this("", ZonedDateTime.now(), null, null, "")
}