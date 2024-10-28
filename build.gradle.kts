plugins {
	kotlin("jvm") version "1.9.24"
	kotlin("plugin.spring") version "1.9.24"
	id("org.springframework.boot") version "3.3.2"
	id("org.liquibase.gradle") version "2.2.0"
	id("io.spring.dependency-management") version "1.1.6"
	// kotlin("plugin.jpa") version "1.9.24"
}

val kotlinVersion = "1.9.24"

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion.set(JavaLanguageVersion.of(18))
	}
}

repositories {
	mavenCentral()
}

liquibase {
	activities {
		register("main") {
			this.arguments = mapOf(
				"changeLogFile" to "src/main/resources/db/changelog/master.sql",
				"url" to "jdbc:postgresql://postgres:5432/postgres",
				"username" to "postgres",
				"password" to "MyAsh1122"
			)
		}
	}
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-security")
	// implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
	// implementation("org.springframework.security:spring-security-oauth2-jose")
	// implementation("org.springframework.security:spring-security-oauth2-authorization-server")
	// implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
	implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")


	testImplementation("io.mockk:mockk:1.12.0")
	testImplementation("org.testcontainers:postgresql:1.17.3")

	testImplementation("com.ninja-squad:springmockk:3.0.1")


	implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
	implementation("org.springframework.boot:spring-boot-starter-jdbc")
	implementation("org.liquibase:liquibase-core")
	implementation("org.springframework.boot:spring-boot-starter-websocket")
	implementation("org.java-websocket:Java-WebSocket:1.5.3")
	runtimeOnly("org.postgresql:postgresql")
	implementation("jakarta.websocket:jakarta.websocket-api:2.0.0")
	implementation("org.springframework.boot:spring-boot-starter-reactor-netty")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("org.jetbrains.kotlin:kotlin-stdlib:$kotlinVersion")
	developmentOnly("org.springframework.boot:spring-boot-devtools")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
	testImplementation("org.springframework.security:spring-security-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
        implementation( "org.apache.pdfbox:pdfbox:2.0.27")
	implementation("com.squareup.okhttp3:okhttp:4.9.3")
	implementation("org.json:json:20211205")
	implementation("com.google.code.gson:gson:2.10.1")
}

tasks.withType<Test> {
	useJUnitPlatform()
}

kotlin {
	jvmToolchain(18)
}

