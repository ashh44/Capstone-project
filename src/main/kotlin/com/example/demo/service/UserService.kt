package com.example.demo.service

import com.example.demo.model.User
import com.example.demo.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {
    private val logger = LoggerFactory.getLogger(UserService::class.java)

    @Transactional
    fun createUser(username: String, password: String, authorities: Set<String>): User {
        logger.debug("Attempting to create user: $username")
        val encodedPassword = passwordEncoder.encode(password)
        val user = User(username = username, password = encodedPassword, authorities = authorities.toMutableSet())
        logger.debug("Saving user to repository")
        val savedUser = userRepository.save(user)
        logger.debug("User saved successfully: ${savedUser.username}")
        return savedUser
    }
}