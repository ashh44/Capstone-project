package com.example.demo.config

import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component
import java.io.IOException

@Component
class CustomAuthenticationSuccessHandler : AuthenticationSuccessHandler {

    @Throws(IOException::class, ServletException::class)
    override fun onAuthenticationSuccess(
        request: HttpServletRequest?,
        response: HttpServletResponse?,
        authentication: Authentication?
    ) {
        when {
            authentication?.authorities?.contains(SimpleGrantedAuthority("ROLE_ADMIN")) == true -> {
                response?.sendRedirect("http://localhost:3000/admin")
            }
            authentication?.authorities?.contains(SimpleGrantedAuthority("ROLE_USER")) == true -> {
                response?.sendRedirect("http://localhost:3000/consultshistory")  // Changed to match the exact endpoint
            }
            else -> {
                response?.sendRedirect("http://localhost:8080/login")
            }
        }
    }
}
