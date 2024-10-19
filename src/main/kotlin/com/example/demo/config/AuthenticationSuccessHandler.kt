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

    @Value("\${frontend.admin-url}")
    private lateinit var adminUrl: String

    @Value("\${frontend.user-url}")
    private lateinit var userUrl: String

    @Value("\${backend.login-url}")
    private lateinit var loginUrl: String

    @Throws(IOException::class, ServletException::class)
    override fun onAuthenticationSuccess(
        request: HttpServletRequest?,
        response: HttpServletResponse?,
        authentication: Authentication?
    ) {
        when {
            authentication?.authorities?.contains(SimpleGrantedAuthority("ROLE_ADMIN")) == true -> {
                response?.sendRedirect(adminUrl)
            }
            authentication?.authorities?.contains(SimpleGrantedAuthority("ROLE_USER")) == true -> {
                response?.sendRedirect(userUrl)
            }
            else -> {
                response?.sendRedirect(loginUrl)
            }
        }
    }
}
