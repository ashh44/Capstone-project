FROM openjdk:18-jdk-slim
WORKDIR /app
COPY /Users/ASFIA/IdeaProjects/demo/build/libs/demo-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]