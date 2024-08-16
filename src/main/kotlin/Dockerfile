FROM gradle:7.6-jdk AS build

COPY Capstone-project-master1/src/main ./Capstone-project-master1/src/main
COPY Capstone-project-master1/build.gradle.kts ./Capstone-project-master1

COPY Capstone-project-master1/src/main ./support/src/main
COPY Capstone-project-master1/build.gradle.kts ./support

COPY build.gradle.kts settings.gradle.kts  ./

RUN gradle clean build

FROM openjdk:17.0.1-jdk-slim AS run

RUN adduser --system --group app-user

COPY --from=build --chown=app-user:app-user /Capstone-project-master1/build/libs/demo-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
USER app-user

CMD ["java", "-jar", "app.jar"]