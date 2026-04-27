# Backend — SSD Social Login

Backend service for the SSD social login project.

It implements Telegram authentication, local session management, login audit events, and a protected notes feature.

## Tech Stack

- Node.js
- Express
- Prisma
- SQLite
- express-session
- Zod
- Jest + Supertest
- Docker

## Environment Variables

Create `.env` from `.env.example`:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
FRONTEND_ORIGIN="http://localhost:5173"
SESSION_SECRET="change_me"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
```

For local development, `secure: false` is used for cookies because the app runs over HTTP.

In production, cookies should use `secure: true` and the app should run behind HTTPS.

## Local Setup

Install dependencies:

```bash
npm install
```

Create and apply database migrations:

```bash
npx prisma migrate dev --name init
```

Run backend in development mode:

```bash
npm run dev
```

Backend will run on:

```txt
http://localhost:3000
```

Health check:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "ssd-social-login-backend"
}
```

## API Endpoints

### POST /api/auth/telegram

Authenticates user using Telegram Login Widget payload.

Frontend sends the object received from Telegram widget.

Example request:

```json
{
  "id": 123456789,
  "first_name": "Sergey",
  "last_name": "Knyazkin",
  "username": "poeticlama",
  "photo_url": "https://t.me/i/userpic/320/example.jpg",
  "auth_date": 1710000000,
  "hash": "f5cd61a87131fcf51fc745d465a36bdcc58db4175ccac7c5afbf641359f55807"
}
```

Optional fields:

```txt
last_name
username
photo_url
```

Backend checks:

```txt
Telegram hash verification
auth_date freshness
user lookup by verified Telegram ID
login event audit log
HttpOnly session cookie creation
```

Example response:

```json
{
  "user": {
    "id": 1,
    "displayName": "Sergey Knyazkin",
    "username": "poeticlama",
    "avatarUrl": "https://t.me/i/userpic/320/example.jpg",
    "provider": "telegram",
    "providerUserId": "123456789",
    "lastLoginAt": "2026-04-26T12:00:00.000Z"
  },
  "securityChecks": [
    "Telegram hash verified",
    "auth_date checked",
    "User loaded by verified Telegram ID",
    "Login event saved",
    "HttpOnly session cookie created"
  ]
}
```

### GET /api/auth/me

Checks current local session.

Telegram hash is not checked here because it is only verified during login.

This endpoint checks the backend session cookie.

Requires session cookie.

Example response:

```json
{
  "user": {
    "id": 1,
    "displayName": "Sergey Knyazkin",
    "username": "poeticlama",
    "avatarUrl": "https://t.me/i/userpic/320/example.jpg",
    "provider": "telegram",
    "providerUserId": "123456789",
    "lastLoginAt": "2026-04-26T12:00:00.000Z"
  },
  "securityChecks": [
    "Session cookie checked",
    "User loaded from local session"
  ]
}
```

Unauthorized response:

```json
{
  "error": "UNAUTHORIZED"
}
```

### POST /api/auth/logout

Destroys current session and clears session cookie.

Example response:

```json
{
  "message": "Logged out successfully"
}
```

### GET /api/auth/login-events

Returns recent login audit events.

Requires session cookie.

Example response:

```json
{
  "items": [
    {
      "id": 1,
      "provider": "telegram",
      "success": true,
      "reason": "LOGIN_SUCCESS",
      "createdAt": "2026-04-26T12:00:00.000Z"
    },
    {
      "id": 2,
      "provider": "telegram",
      "success": false,
      "reason": "INVALID_TELEGRAM_AUTH",
      "createdAt": "2026-04-26T11:58:00.000Z"
    }
  ]
}
```

## Protected Notes Feature

The notes feature demonstrates that Telegram is used as an identity provider.

After Telegram login, the user can create and read personal notes.

### GET /api/notes

Returns notes of the current authenticated user.

Requires session cookie.

Example response:

```json
{
  "items": [
    {
      "id": 1,
      "title": "Telegram login demo",
      "content": "This note belongs to the authenticated Telegram user.",
      "createdAt": "2026-04-26T12:10:00.000Z",
      "updatedAt": "2026-04-26T12:10:00.000Z"
    }
  ]
}
```

### POST /api/notes

Creates a note for the current authenticated user.

Requires session cookie.

Example request:

```json
{
  "title": "Telegram login demo",
  "content": "This note belongs to the authenticated Telegram user."
}
```

Example response:

```json
{
  "item": {
    "id": 1,
    "title": "Telegram login demo",
    "content": "This note belongs to the authenticated Telegram user.",
    "createdAt": "2026-04-26T12:10:00.000Z",
    "updatedAt": "2026-04-26T12:10:00.000Z"
  }
}
```

### DELETE /api/notes/:id

Deletes only the current user's own note.

Requires session cookie.

Example response:

```json
{
  "message": "Note deleted successfully"
}
```

## Frontend Integration Notes

Frontend must send requests with credentials enabled.

Example:

```js
fetch("http://localhost:3000/api/auth/me", {
  credentials: "include"
});
```

For login:

```js
fetch("http://localhost:3000/api/auth/telegram", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  credentials: "include",
  body: JSON.stringify(telegramUser)
});
```

This is required because backend authentication uses an HttpOnly session cookie.

## Testing

Run tests:

```bash
npm test
```

Current tested areas:

```txt
Telegram hash verification
invalid Telegram hash rejection
auth_date freshness check
display name building
health check endpoint
protected auth endpoint without session
protected notes endpoint without session
```

## Docker

Build backend image:

```bash
docker build -t ssd-social-login-backend .
```

Run backend container:

```bash
docker run --rm -p 3001:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e PORT=3000 \
  -e FRONTEND_ORIGIN="http://localhost:5173" \
  -e SESSION_SECRET="dev_session_secret_change_me" \
  -e TELEGRAM_BOT_TOKEN="replace_with_real_bot_token" \
  ssd-social-login-backend
```

Health check in Docker:

```bash
curl http://localhost:3001/health
```

## Security Practices

Implemented security-related practices:

```txt
Telegram HMAC-SHA256 hash verification
auth_date freshness check
timingSafeEqual for hash comparison
HttpOnly session cookie
server-side session validation
input validation with Zod
login event audit log
user-specific access control for notes
environment variables for secrets
no bot token hardcoded in source code
Docker ignore for local secrets and database files
unit and API tests
```

For production:

```txt
Use HTTPS
Enable secure cookie flag
Use a strong SESSION_SECRET
Use a real TELEGRAM_BOT_TOKEN
Use persistent session storage instead of in-memory sessions
Use PostgreSQL or another production database instead of local SQLite
Run SAST and dependency checks in CI
```
