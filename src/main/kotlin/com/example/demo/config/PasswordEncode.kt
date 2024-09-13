package com.example.demo.config

import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

//@Configuration
//class PasswordEncoderConfig {
//
//    @Bean
//    fun passwordEncoder(): PasswordEncoder {
//        return BCryptPasswordEncoder()
//    }
//}
@Configuration
class DatabaseConnectionTest(private val jdbcTemplate: JdbcTemplate) {

    private val logger = LoggerFactory.getLogger(DatabaseConnectionTest::class.java)

    @Bean
    fun testDatabaseConnection() = CommandLineRunner {
        try {
            val result = jdbcTemplate.queryForObject("SELECT 1", Int::class.java)
            logger.info("Database connection test successful. Result: $result")

            // Test querying the users table
            val userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Int::class.java)
            logger.info("Number of users in the database: $userCount")

            // Test querying a specific user
            val adminUser = jdbcTemplate.queryForMap("SELECT * FROM users WHERE username = 'admin'")
            logger.info("Admin user details: $adminUser")

        } catch (e: Exception) {
            logger.error("Database connection test failed", e)
        }
    }
}
@Component
class PasswordEncoderUtil {

    private val encoder = BCryptPasswordEncoder()

    fun encode(rawPassword: String): String {
        return encoder.encode(rawPassword)
    }

    fun matches(rawPassword: String, encodedPassword: String): Boolean {
        return encoder.matches(rawPassword, encodedPassword)
    }
}
//@Configuration
//class PasswordUpdateUtil(
//    private val jdbcTemplate: JdbcTemplate,
//    private val passwordEncoder: PasswordEncoder
//) {
//    private val logger = LoggerFactory.getLogger(PasswordUpdateUtil::class.java)
//
//    @Bean
//    fun updatePasswords() = CommandLineRunner {
//        val users = mapOf(
//            "admin" to "admin",
//            "newuser" to "password123" // replace with actual password
//        )
//
//        users.forEach { (username, rawPassword) ->
//            val encodedPassword = passwordEncoder.encode(rawPassword)
//            jdbcTemplate.update(
//                "UPDATE users SET password = ? WHERE username = ?",
//                encodedPassword,
//                username
//            )
//            logger.info("Updated password for user: $username")
//        }
//
//        logger.info("All passwords have been updated and properly encoded.")
//    }
//}
//@Configuration
//class PasswordVerificationTest(
//    private val jdbcTemplate: JdbcTemplate,
//    private val passwordEncoderUtil: PasswordEncoderUtil
//) {
//    private val logger = LoggerFactory.getLogger(PasswordVerificationTest::class.java)
//
//    @Bean
//    fun verifyPasswords() = CommandLineRunner {
//        val users = jdbcTemplate.queryForList("SELECT username, password FROM users")
//
//        users.forEach { user ->
//            val username = user["username"] as String
//            val storedPassword = user["password"] as String
//
//            // Use a map to store known passwords for each user
//            val knownPasswords = mapOf(
//                "admin" to "admin",
//                "newuser" to "password123" // replace with actual password
//            )
//
//            val rawPassword = knownPasswords[username] ?: "defaultPassword"
//
//            val matches = passwordEncoderUtil.matches(rawPassword, storedPassword)
//
//            if (matches) {
//                logger.info("Password for user $username is correctly encoded")
//            } else {
//                logger.warn("Password for user $username might not be correctly encoded")
//                logger.info("Stored encoded password for $username: $storedPassword")
//                logger.info("Raw password being tested for $username: $rawPassword")
//            }
//        }
//    }
//}