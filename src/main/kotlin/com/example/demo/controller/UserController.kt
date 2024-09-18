package com.example.demo.controller

import com.example.demo.model.User
import com.example.demo.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/users")
class UserController(private val userService: UserService) {

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun createUser(@RequestBody createUserRequest: CreateUserRequest): ResponseEntity<User> {
        val user = userService.createUser(createUserRequest.username, createUserRequest.password, createUserRequest.authorities)
        return ResponseEntity.ok(user)
    }
}

@RestController
@RequestMapping("/api")
class UserController1(private val userService: UserService) {

    @PostMapping("/register")
    fun registerUser(@RequestBody user: User): ResponseEntity<String> {
        // Logic to create user
        return ResponseEntity.ok("User created successfully")
    }
}



data class CreateUserRequest(val username: String, val password: String, val authorities: Set<String>)