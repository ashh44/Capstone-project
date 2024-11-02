package com.example.demo.config
import jakarta.annotation.PostConstruct
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.provisioning.JdbcUserDetailsManager
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.util.*
import javax.sql.DataSource

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig(private val dataSource: DataSource) {

    private val logger = LoggerFactory.getLogger(SecurityConfig::class.java)

    @Value("\${frontend.cors-origin}")
    private lateinit var frontendCorsOrigin: String

    @Value("\${backend.login-url}")
    private lateinit var loginUrl: String

    @Bean
    fun customAuthenticationSuccessHandler(): CustomAuthenticationSuccessHandler {
        return CustomAuthenticationSuccessHandler()
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { } // Enable CORS using the corsConfigurer below
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/login", "/api/check-auth", "/home", "/api/**").permitAll()
                    .requestMatchers("/admin", "/api/users").hasRole("ADMIN")
                    .requestMatchers("/api/consult/**").authenticated()
                    .requestMatchers("/api/deepgram-proxy").permitAll()
                    .anyRequest().authenticated()
            }
            .formLogin { form ->
                form
                    .loginPage(loginUrl)
                    .loginProcessingUrl("/login")
                    .defaultSuccessUrl("/record", true)
                    .successHandler(customAuthenticationSuccessHandler())
                    .failureUrl("$loginUrl?error=true")
                    .permitAll()
            }
            .exceptionHandling {
                it.authenticationEntryPoint { request, response, authException ->
                    logger.debug("Authentication required for: ${request.requestURI}")
                    if (request.requestURI.startsWith("/api/")) {
                        response.apply {
                            setHeader("Access-Control-Allow-Origin", frontendCorsOrigin)
                            setHeader("Access-Control-Allow-Credentials", "true")
                            sendError(HttpServletResponse.SC_UNAUTHORIZED)
                        }
                    } else {
                        response.sendRedirect(loginUrl)
                    }
                }
            }

        return http.build()
    }

    @Bean
    fun corsConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            override fun addCorsMappings(registry: CorsRegistry) {
                registry.addMapping("/**")
                    .allowedOrigins(frontendCorsOrigin)
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600)
            }
        }
    }

    @Bean
    fun userDetailsService(): UserDetailsService {
        logger.debug("Creating JdbcUserDetailsManager")
        val users = JdbcUserDetailsManager(dataSource)

        val userQuery = "select username, password, enabled from users where username=?"
        val authQuery = "select username, authority from authorities where username=?"

        users.setUsersByUsernameQuery(userQuery)
        users.setAuthoritiesByUsernameQuery(authQuery)

        return users
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    @Bean
    fun uuidGenerator(): java.util.function.Supplier<UUID> = java.util.function.Supplier { UUID.randomUUID() }
}