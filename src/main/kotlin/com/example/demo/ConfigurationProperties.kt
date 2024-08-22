package com.example.demo

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
// This class holds configuration properties that can be injected into other classes
// where these properties are needed.
@Component
class ConfigurationProperties {
    @Value("\${api.key:default_value_if_not_set}")
    lateinit var apiKey: String //setting value to apikey from application properties using the @value annotation
    @Value("\${openapi.key:default_value_if_not_set}")
    lateinit var openapiKey: String

}