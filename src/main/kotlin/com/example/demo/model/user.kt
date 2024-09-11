package com.example.demo.model

import jakarta.persistence.*
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

@Entity
@Table(name = "users")
class User : UserDetails {
    @Id
    @Column(length = 50)
    private var username: String = ""

    @Column(length = 100, nullable = false)
    private var password: String = ""

    @Column(nullable = false)
    private var enabled: Boolean = true

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "authorities", joinColumns = [JoinColumn(name = "username")])
    @Column(name = "authority")
    private var authorities: MutableSet<String> = mutableSetOf()

    // No-arg constructor required by JPA
    constructor() : super()

    // Secondary constructor
    constructor(username: String, password: String, authorities: MutableSet<String> = mutableSetOf(), enabled: Boolean = true) : this() {
        this.username = username
        this.password = password
        this.authorities = authorities
        this.enabled = enabled
    }

    override fun getAuthorities(): Collection<GrantedAuthority> =
        authorities.map { SimpleGrantedAuthority(it) }

    override fun getPassword(): String = password

    override fun getUsername(): String = username

    override fun isAccountNonExpired(): Boolean = true

    override fun isAccountNonLocked(): Boolean = true

    override fun isCredentialsNonExpired(): Boolean = true

    override fun isEnabled(): Boolean = enabled

    // Add setters if needed
    fun setPassword(password: String) {
        this.password = password
    }

    fun setAuthorities(authorities: MutableSet<String>) {
        this.authorities = authorities
    }

    fun setEnabled(enabled: Boolean) {
        this.enabled = enabled
    }
}