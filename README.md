# Online Java Coding & MCQ Assessment Platform

A production-grade, full-stack assessment platform designed for educational institutions and technical recruitment. Supports up to 50+ concurrent candidates with server-enforced countdown timers, isolated Java code execution via Judge0, debounced autosave, and comprehensive analytics for instructors.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          React SPA (Vite)              │
                      │   - Monaco Editor (Java Dark Theme)    │
                      │   - Question Navigator (1..10)         │
                      │   - Dynamic Server-Synced Timer        │
                      └──────────────────┬─────────────────────┘
                                         │ REST APIs (Bearer JWT)
                                         ▼
                      ┌────────────────────────────────────────┐
                      │     Spring Boot 3.3.x (Java 21)        │
                      │   - Spring Security + Stateless JWT    │
                      │   - REST Controllers & DTO Validation  │
                      │   - Scoring Engine (Backend Authority) │
                      │   - Output Normalization (CRLF/LF)     │
                      │   - Rate-Limited Execution Queue       │
                      │   - HikariCP Connection Pool (20 max)  │
                      └──────────────┬───────────────────┬─────┘
                                     │                   │
                  JDBC / Flyway (SSL)│                   │ HTTPS REST
                                     ▼                   ▼
                     ┌──────────────────┐    ┌─────────────────────────┐
                     │   MySQL 8.x      │    │      Judge0 Engine      │
                     │  (JavaResults /  │    │  (Sandbox Container /   │
                     │   Aiven Cloud)   │    │   Isolated Java Runtime)│
                     └──────────────────┘    └─────────────────────────┘
```

---

## Initial Assessment: "Java Programming Assessment"

The platform automatically seeds the following assessment:
* **Duration:** 45 minutes (configurable by Admin)
* **Total Marks:** 10 Marks
* **Part A (8 MCQs × 1 Mark = 8 Marks):**
  1. Primitive Data Types in Java (`String` is NOT a primitive type)
  2. If-Else Execution logic (executes when condition is `false`)
  3. Java OOP Purity (Primitive data types prevent it from being 100% pure OOP)
  4. Java Constructor requirements (Must have same name as class)
  5. The `this` Keyword (Refers to current object)
  6. Method Overriding definition (Child class provides its own version)
  7. Array sizing in Java (Fixed once created)
  8. Array length property (`a.length`)
* **Part B (2 Coding Questions × 1 Mark = 2 Marks):**
  1. **Even or Odd:** Read an integer via `Scanner` and print `Even` or `Odd`. Evaluated against 5 hidden test cases (`10`, `7`, `0`, `-5`, `24`).
  2. **Search an Element in an Array:** Read `n`, `n` integers into an array, and a target number. Output the 0-based index or `Not found`. Evaluated against hidden test cases.

> **Security Rule:** Hidden test cases and correct MCQ option flags are strictly withheld on the backend and never exposed to candidate network responses.

---

## Default Development Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **ADMIN** | `admin@assessment.com` | `Admin@123` | Full dashboard access, test creation, grade analytics, CSV export |
| **STUDENT** | `student@assessment.com` | `Student@123` | Pre-registered candidate: Rahul Kumar (Roll: 12345, Sec: CSE-A) |

*(Admins and students can also register new accounts directly from the login page).*

---

## Prerequisites

* **Java:** JDK 21 (Eclipse Temurin recommended)
* **Maven:** 3.8+ (or use the included `./mvnw` / `mvnw.cmd`)
* **Node.js:** v18+ or v22+
* **npm:** v9+ or v10+
* **MySQL:** MySQL 8.0+ (Local or Aiven Cloud instance)
* **Docker & Docker Compose:** (Optional, for containerized deployments)

---

## Local Development Setup

### 1. Database Setup (Local MySQL)
Start your local MySQL service on port `3306`:
```sql
CREATE DATABASE IF NOT EXISTS JavaResults CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Ensure your credentials match `application.properties` (defaults: username `root`, password `root`).

### 2. Configure Backend Environment
Edit `backend/src/main/resources/application.properties` or set environment variables:
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/JavaResults?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=root

# Security
app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
```

### 3. Run Backend (Spring Boot 3.3.4)
In PowerShell or terminal:
```powershell
cd backend
./mvnw spring-boot:run
```
*(On Windows cmd: `mvnw.cmd spring-boot:run` or `mvn spring-boot:run`).*

The backend will start at `http://localhost:8080`. Flyway will automatically run migrations `V1__create_schema.sql` and `V2__seed_initial_assessment.sql`.

### Deploying the Backend to Render

The repository includes a Render Blueprint in `render.yaml`. For the existing `quiz-5d43` service, sync this Blueprint or set the equivalent Render settings (Docker runtime, root directory `backend`, Dockerfile `./Dockerfile`, health check path `/api/health`). Keep the existing service name so the frontend's API proxy continues to use the same URL. Render's assigned `PORT` is used automatically. Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and a strong `JWT_SECRET` in the Render service environment. Do not commit these values.

The root URL (`/`) and `/api/health` return `{"status":"UP"}` without requiring authentication. Once the service is deployed, verify `https://<service-name>.onrender.com/api/health` returns HTTP 200.

### 4. Run Frontend (React Vite)
In a second terminal window:
```powershell
cd frontend
npm install
npm run dev
```
The React development server will start at `http://localhost:5173`. Open your browser and navigate to `http://localhost:5173`.

---

## Running with Docker Compose

### Option A: Complete Local Stack with MySQL
If you do not have local MySQL installed, spin up the entire stack (MySQL container, Spring Boot backend, and React Nginx frontend) in one command:
```powershell
docker compose -f docker-compose.dev.yml up --build -d
```
Access the application at `http://localhost`.

### Option B: Production Setup with External / Aiven MySQL
1. Copy `.env.example` to `.env`:
   ```powershell
   copy .env.example .env
   ```
2. Update `.env` with your Aiven MySQL credentials:
   ```env
   DB_URL=jdbc:mysql://<aiven-host>:<port>/<dbname>?sslMode=REQUIRED
   DB_USERNAME=<aiven-username>
   DB_PASSWORD=<aiven-password>
   JWT_SECRET=<strong-random-256-bit-key>
   JUDGE0_URL=https://ce.judge0.com
   JUDGE0_API_KEY=<your-key-if-using-rapidapi>
   ```
3. Launch with Docker Compose:
   ```powershell
   docker compose up --build -d
   ```

---

## Production Security & Concurrency Considerations

1. **Backend Scoring Authority:** Scores are NEVER trusted from the frontend. All grading happens server-side.
2. **Deterministic Output Normalization:** Output from candidate Java programs handles trailing whitespace, CRLF vs LF line separators, and leading/trailing newlines cleanly.
3. **Server-Enforced Timer:** Timer calculation uses `endTime` stored in the database. Client-side timers cannot be manipulated by freezing browser JavaScript or refreshing.
4. **Isolated Code Execution:** Code execution requests are proxied to an isolated Judge0 sandbox. Arbitrary student Java code is never executed directly inside the Spring Boot JVM.
5. **Rate Limiting:** `/api/code/run` implements a sliding-window rate limit (15 runs/min per student) to prevent denial-of-service abuse.
6. **50 Concurrent User Optimization:**
   * HikariCP connection pool sized to 20 connections with `minimum-idle: 5` and `connection-timeout: 20000`.
   * Database indexes applied to `student_id`, `test_id`, `attempt_id`, `question_id`, and `created_at`.
   * Debounced answer autosaving to avoid spamming the database with every keystroke.

---

## REST API Reference

### Authentication
* `POST /api/auth/login` - Authenticate student or admin; returns JWT token.
* `POST /api/auth/register` - Register a new student candidate (Name, Roll No, Section).
* `GET /api/auth/me` - Retrieve current authenticated profile.

### Candidate Assessment
* `GET /api/tests` - List published active assessments.
* `GET /api/tests/{id}` - Retrieve test metadata (questions with sample test cases only; no hidden cases or correct answers).
* `POST /api/tests/{id}/start` - Begin timed assessment session; returns attempt with server `endTime`.
* `GET /api/attempts/{id}` - Fetch attempt state, answers, and remaining time.
* `POST /api/attempts/{id}/answers` - Debounced autosave for MCQ or code draft.
* `POST /api/attempts/{id}/submit` - Final test submission; evaluates MCQs and hidden coding test cases.
* `POST /api/attempts/{id}/audit` - Record candidate events (tab switches, copy/paste, fullscreen exit).
* `GET /api/results/{attemptId}` - Retrieve final candidate scorecard.

### Code Execution (Judge0)
* `POST /api/code/run` - Execute Java code against sample or custom stdin.
* `POST /api/code/submit` - Execute Java code against all hidden test cases and compute problem score.

### Admin Management (`ROLE_ADMIN` required)
* `GET /api/admin/dashboard` - Cohort metrics (Total Students, Tests, Completed Attempts, Average Score).
* `GET /api/admin/tests` - List all tests with question counts.
* `POST /api/admin/tests` - Create test with MCQs, coding questions, and test cases.
* `PUT /api/admin/tests/{id}` - Update test details and marks.
* `DELETE /api/admin/tests/{id}` - Delete test and associated attempts.
* `POST /api/admin/tests/{id}/duplicate` - Duplicate test as a new draft.
* `PATCH /api/admin/tests/{id}/publish` - Toggle active/inactive status.
* `GET /api/admin/results` - Paginated candidate results with search, section filter, and sorting.
* `GET /api/admin/results/export` - Export all results as CSV.
* `GET /api/admin/students` - View candidate directory.
