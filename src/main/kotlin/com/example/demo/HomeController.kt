package com.example.demo
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping

@Controller
class HomeController {

    @GetMapping("/")
    fun home(model: Model): String {
        model.addAttribute("message", "Welcome to the home page!")
        return "home"
    }

    @GetMapping("/login")
    fun login(): String {
        return "login"
    }


    @GetMapping("/admin")
    fun admin(model: Model): String {
        model.addAttribute("message", "Welcome to the admin page!")
        return "admin"
    }
}
