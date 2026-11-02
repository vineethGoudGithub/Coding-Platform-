# Multi-stage Dockerfile for Spring Boot 3.x Backend (Java 21)

# Stage 1: Build JAR
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper & pom.xml
COPY mvnw pom.xml ./
COPY .mvn .mvn

# Ensure wrapper is executable
RUN chmod +x ./mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build
COPY src src
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add unprivileged user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy built JAR from builder stage
COPY --from=builder /app/target/quiz-backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
