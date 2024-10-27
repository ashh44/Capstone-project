package com.example.demo

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.*

@Controller
class HomeController(
    @Value("\${REACT_APP_FRONTEND_URL}") val frontendUrl: String
) {


    @GetMapping("/home")
    fun home(model: Model): String {
        model.addAttribute("message", "Welcome to the home page!")
        return "home"
    }

    @GetMapping("/login")
    fun loginPage(): String {
        return "login"
    }

    @PostMapping("/login")
    fun loginSubmit(): String {
        println("Login POST received")
        return "redirect:/home"
    }

    @GetMapping("/admin")
    fun registrationPage(): String {
        return "redirect:$frontendUrl/admin"
    }

    @GetMapping("/record")
    fun recordPage(): String {
        return "redirect:$frontendUrl/record"
    }

    @GetMapping("/api/check-auth")
    fun checkAuth(authentication: Authentication?): ResponseEntity<Map<String, Boolean>> {
        val isAuthenticated = authentication != null && authentication.isAuthenticated
        return ResponseEntity.ok(mapOf("authenticated" to isAuthenticated))
    }

    @GetMapping("/transcribe")
    fun transcribePage(): String {
        return "redirect:http://$frontendUrl/transcribe"
    }

//@RestController
//class TestController {
//
//    @GetMapping("/test")
//    fun test() = "Test successful"
//
//    @GetMapping("/admin/test")
//    fun adminTest() = "Admin test successful"
//}
}