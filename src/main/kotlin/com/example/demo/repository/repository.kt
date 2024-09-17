package com.example.demo.repository

import com.example.demo.model.User
import com.example.demo.model.ConsultHistory
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<User, String>

//consult history repo
@Repository
interface ConsultHistoryRepository : JpaRepository<ConsultHistory, String>