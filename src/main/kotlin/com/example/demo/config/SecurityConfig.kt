import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.provisioning.JdbcUserDetailsManager
import org.springframework.security.web.SecurityFilterChain
import javax.sql.DataSource

@Configuration
@EnableWebSecurity
class SecurityConfig(private val dataSource: DataSource) {

    init {
        println("SecurityConfig is being loaded!")
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        println("Security filter chain is being configured")
        http
            .authorizeHttpRequests { requests ->
                requests
                    .requestMatchers("/login").permitAll()
                    .requestMatchers("/admin").hasRole("ADMIN")
                    .requestMatchers("/record").authenticated()
                    .anyRequest().authenticated()
            }
            .formLogin { formLogin ->
                formLogin
                    .loginPage("/login")
                    .defaultSuccessUrl("/record", true)
                    .permitAll()
            }
            .userDetailsService(jdbcUserDetailsManager())

        return http.build()
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        val encoder = BCryptPasswordEncoder()
        println("Password encoder created: $encoder")
        return encoder
    }

    @Bean
    fun jdbcUserDetailsManager(): JdbcUserDetailsManager {
        val jdbcUserDetailsManager = JdbcUserDetailsManager(dataSource)
        jdbcUserDetailsManager.setUsersByUsernameQuery("SELECT username, password, enabled FROM users WHERE username=?")
        jdbcUserDetailsManager.setAuthoritiesByUsernameQuery("SELECT username, authority FROM authorities WHERE username=?")
        return jdbcUserDetailsManager
    }

    companion object {
        @JvmStatic
        fun generateBcryptHash(password: String): String {
            val encoder = BCryptPasswordEncoder()
            return encoder.encode(password)
        }

    }
    object PasswordHashGenerator {
        @JvmStatic
        fun main(args: Array<String>) {
            val encoder = BCryptPasswordEncoder()
            val rawPassword = "admin"
            val encodedPassword = encoder.encode(rawPassword)
            println("Use this hash in your Liquibase changelog: $encodedPassword")
        }
    }
}
