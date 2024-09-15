/*package com.example.demo.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.http.ResponseEntity

@RestController
class AuthController {

    @GetMapping("/api/check-auth")
    fun checkAuth(): ResponseEntity<Map<String, Boolean>> {
        val auth = SecurityContextHolder.getContext().authentication
        val isAuthenticated = auth != null && auth.isAuthenticated && !auth.authorities.any { it.authority == "ROLE_ANONYMOUS" }
        return ResponseEntity.ok(mapOf("authenticated" to isAuthenticated))
    }
}

 */