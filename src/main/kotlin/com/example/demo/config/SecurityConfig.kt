package com.example.demo.config
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
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
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.util.*
import javax.sql.DataSource

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig(private val dataSource: DataSource) {

    private val logger = LoggerFactory.getLogger(SecurityConfig::class.java)

    init {
        logger.info("SecurityConfig is initialized")
    }
    //    @PostConstruct
//    fun postConstruct() {
//        logger.info("SecurityConfig has been fully initialized")
//    }
    @Bean
    fun customAuthenticationSuccessHandler(): CustomAuthenticationSuccessHandler {
        return CustomAuthenticationSuccessHandler()
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/login").permitAll()
                    .requestMatchers("/admin", "/api/users").hasRole("ADMIN")
                    .requestMatchers("/api/consult/history").authenticated()
                    .requestMatchers("/api/consult/letter").authenticated()
                    .requestMatchers("/api/consult/summary").authenticated()
                    .requestMatchers("/api/consult/new-session").authenticated()
                    .anyRequest().authenticated()
            }
            .formLogin { form ->
                form
                    .loginPage("/login")
                    .loginProcessingUrl("/login")
                    //.defaultSuccessUrl("/home", true)
                    .successHandler(customAuthenticationSuccessHandler())
                    .failureUrl("/login?error=true")
                    .permitAll()
            }
            .httpBasic { }

        return http.build()
    }

    @Bean
    fun corsConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            override fun addCorsMappings(registry: CorsRegistry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000")  // Allow requests from Next.js app
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
            }
        }
    }

    @Bean
    fun userDetailsService(): UserDetailsService {
        logger.debug("Creating JdbcUserDetailsManager")
        val users = JdbcUserDetailsManager(dataSource)

        val userQuery = "select username, password, enabled from users where username=?"
        val authQuery = "select username, authority from authorities where username=?"

        logger.debug("Setting user query: $userQuery")
        users.setUsersByUsernameQuery(userQuery)

        logger.debug("Setting authorities query: $authQuery")
        users.setAuthoritiesByUsernameQuery(authQuery)

//        // Test the UserDetailsManager
//        try {
//            val testUser = users.loadUserByUsername("admin")
//            logger.debug("Test user loaded successfully: ${testUser.username}")
//        } catch (e: Exception) {
//            logger.error("Failed to load test user", e)
//        }

        return users
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    @Bean
    fun uuidGenerator(): java.util.function.Supplier<UUID> = java.util.function.Supplier { UUID.randomUUID() }


}