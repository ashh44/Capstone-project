package com.example.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
//import java.io.File
//import java.io.IOException

@SpringBootApplication
class DemoApplication

fun main(args: Array<String>) {
    runApplication<DemoApplication>(*args)
}

//fun readTranscriptionFromFile(filePath: String): String {
//    return try {
//        File(filePath).readText(Charsets.UTF_8)
//    } catch (e: IOException) {
//        println("Error reading transcription file: ${e.message}")
//        ""
//    }
//}