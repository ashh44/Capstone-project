package com.example.demo.config

import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component
import java.io.IOException

@Component
class CustomAuthenticationSuccessHandler : AuthenticationSuccessHandler {

    @Value("\${frontend.cors-origin}")
    private lateinit var frontendUrl: String

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        response.addHeader("Access-Control-Allow-Origin", frontendUrl)
        response.addHeader("Access-Control-Allow-Credentials", "true")

        when {
            authentication.authorities.any { it.authority == "ROLE_ADMIN" } ->
                response.sendRedirect("$frontendUrl/admin")
            else ->
                response.sendRedirect("$frontendUrl/record")
        }
    }
}