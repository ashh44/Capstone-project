FROM gradle:7.6-jdk AS build
WORKDIR /app
COPY src/main /app/src/main
COPY build.gradle.kts /app
COPY audio_files /app/audio_files
COPY src/main ./support/src/main
COPY build.gradle.kts ./support

COPY build.gradle.kts  /app
COPY settings.gradle.kts /app

RUN gradle clean build

FROM openjdk:17.0.1-jdk-slim AS run

RUN adduser --system --group app-user
WORKDIR /app
COPY --from=build --chown=app-user:app-user /app/build/libs/demo-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 8080
USER app-user

CMD ["java", "-jar", "app.jar"]
