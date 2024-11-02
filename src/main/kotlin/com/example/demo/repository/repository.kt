package com.example.demo.repository

import com.example.demo.model.ConsultHistory
import com.example.demo.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserRepository : JpaRepository<User, String>

//consult history repo
@Repository
interface ConsultHistoryRepository : JpaRepository<ConsultHistory, UUID> {
    fun findByUserName(userName: String): List<ConsultHistory>
}

