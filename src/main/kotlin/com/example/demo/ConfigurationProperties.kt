package com.example.demo

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
// This class holds configuration properties that can be injected into other classes
// where these properties are needed.
@Component
class ConfigurationProperties {
    @Value("\${dgapi.key:default_value_if_not_set}")
    lateinit var dgApiKey: String  //pass value from docker-compose thru @Value
    @Value("\${openaiapi.key:default_value_if_not_set}")
    lateinit var openaiApikey: String
}