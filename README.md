# SSD Social Login (Telegram Authentication)

## Overview

This project implements a secure social login system using **Telegram as an identity provider**.

Instead of traditional username/password authentication, users log in via Telegram. The backend verifies the authenticity of the Telegram payload using cryptographic checks and then creates a local session.

The project also demonstrates:

* secure session management
* login audit logging
* authorization via a protected notes feature

---

## Tech Stack

**Backend:**

* Node.js
* Express
* Prisma ORM
* SQLite (development)
* express-session
* Zod (input validation)

**Frontend:**

* Vue 3
* Vite
* Axios

**Other:**

* Docker / Docker Compose
* Jest + Supertest (testing)
* CI (tests, linting, SAST)

---

## How Authentication Works

This project does NOT use OAuth 2.0.

Telegram Login Widget returns **signed user data**, which must be verified on the backend.

### Flow:

1. User clicks Telegram login button
2. Telegram returns user data (id, username, auth_date, hash)
3. Frontend sends payload to backend (`POST /api/auth/telegram`)
4. Backend:

   * validates payload with Zod
   * verifies HMAC-SHA256 hash using bot token
   * checks `auth_date` freshness
5. If valid:

   * user is created or updated in DB
   * login event is saved
   * session is created (HttpOnly cookie)

---

## ⚙️ Setup

### 1. Create Telegram Bot

* Open Telegram → @BotFather
* Create a new bot
* Copy **bot token**
* Set domain for Telegram Login Widget

---

### 2. Backend Configuration

Create `.env`:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
FRONTEND_ORIGIN="http://localhost:5173"
SESSION_SECRET="change_me"
TELEGRAM_BOT_TOKEN="your_bot_token_here"
```

---

### 3. Frontend Configuration

Create `.env`:

```env
VITE_TELEGRAM_BOT_USERNAME="your_bot_username"
VITE_API_URL="http://localhost:3000"
```

⚠️ IMPORTANT:

* Frontend uses **bot username**
* Backend uses **bot token**
* Never expose bot token in frontend

---

### 4. Run with Docker Compose

```bash
docker-compose up --build
```

This will start:

* backend service
* frontend service

---

## 🔐 Security Practices

The project implements multiple security measures:

* Telegram HMAC-SHA256 hash verification
* `auth_date` freshness check (replay attack prevention)
* `crypto.timingSafeEqual` (timing attack mitigation)
* HttpOnly session cookies
* server-side session validation
* input validation with Zod
* login audit logging
* user-specific access control
* environment variables for secrets
* no hardcoded credentials

---

## 📡 API Endpoints

### Authentication

* `POST /api/auth/telegram` — login
* `GET /api/auth/me` — get current user
* `POST /api/auth/logout` — logout
* `GET /api/auth/login-events` — login history

---

## 📝 Notes Feature (Authorization Demo)

Authenticated users can:

* view their notes
* create notes
* delete their own notes

Each note is linked to a specific user ID. Users cannot access other users’ notes.

---

## 🧪 Testing & CI

* Unit and API tests (Jest + Supertest)
* CI includes:

  * tests
  * linting
  * SAST tools

---

## 🚀 Production Recommendations

For production deployment:

* use HTTPS
* set `secure: true` for cookies
* use PostgreSQL instead of SQLite
* use persistent session storage (e.g., Redis)
* enable dependency scanning
* deploy behind reverse proxy (e.g., Nginx)

---

## 📌 Summary

This project demonstrates how to securely integrate Telegram-based authentication into a web application and how to properly handle identity verification, session management, and authorization.
