package com.example.demo
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController

@Controller
class HomeController {

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
        return "redirect:/usershistory" //changed from home to usershistory
    }

    //@GetMapping("/admin")
    //fun admin(model: Model): String {
    //  model.addAttribute("message", "Welcome to the admin page!")
    //  return "admin"
    // }
    @GetMapping("/admin")
    fun registrationPage(): String {
        return "http://localhost:3000/admin" // Ensure this maps to the registration page (e.g., registration.html)
    }

    @GetMapping("/record")
    fun recordPage(): String {
        return "http://localhost:3000/record" // Ensure this maps to the record page (e.g., record.html)
    }

    @GetMapping("/context")
    fun usercontext(): String {
        return "http://localhost:3000/context" // Ensure this maps to the user context page (e.g., usercontext.tsx)
    }

    @GetMapping("/consultshistory")  //
    fun usersHistoryPage(): String {
        return "http://localhost:3000/consulthistory"  //
    }
}

class TestController {

    @GetMapping("/test")
    fun test() = "Test successful"

    @GetMapping("/admin/test")
    fun adminTest() = "Admin test successful"
}
