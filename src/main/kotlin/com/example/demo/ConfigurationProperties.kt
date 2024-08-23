package com.example.demo

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
// This class holds configuration properties that can be injected into other classes
// where these properties are needed.
@Component
class ConfigurationProperties {
    @Value("\${api.deepgramKey:}")
    lateinit var apiKey: String 
    @Value("\${api.openaiKey:}")
    lateinit var openapiKey: String

}