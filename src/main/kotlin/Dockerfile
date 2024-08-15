# Use an official OpenJDK runtime as a parent image
FROM openjdk:17-jdk-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the build.gradle.kts, settings.gradle.kts, and gradle directory into the container
COPY build.gradle.kts settings.gradle.kts gradle/ /app/

# Copy the source code into the container
COPY src /app/src

# Build the application using Gradle
RUN ./gradlew build

# Copy the generated JAR file to the container
COPY build/libs/demo.jar /app/demo.jar

# Expose the port that your application will run on
EXPOSE 8080

# Run the JAR file
ENTRYPOINT ["java", "-jar", "/app/demo.jar"]