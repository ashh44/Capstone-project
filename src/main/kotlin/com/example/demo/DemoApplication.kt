package com.example.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration
import org.springframework.boot.runApplication
import org.springframework.context.annotation.ComponentScan
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
@SpringBootApplication()

@ComponentScan(basePackages = ["com.example.demo"])
class DemoApplication

fun main(args: Array<String>) {
    runApplication<DemoApplication>(*args)
}

