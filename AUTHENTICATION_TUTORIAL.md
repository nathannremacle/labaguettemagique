# Authentication System Tutorial

## Overview

This application uses a simple authentication system with hardcoded credentials. The system is designed to be straightforward and avoid password hashing issues.

## Default Credentials

- **Username:** `admin`
- **Password:** `password`

⚠️ **IMPORTANT:** These are default credentials. Change them in the source code before deploying to production!

## How Authentication Works

### Login Process

1. User navigates to `/admin/login`
2. User enters username and password
3. Server validates credentials (simple string comparison)
4. If valid, a session is created and stored in memory
5. A session cookie (`admin_session`) is set in the browser
6. User is redirected to `/admin` dashboard

### Session Management

- Sessions are stored in memory (cleared on server restart)
- Session duration: 24 hours
- Session ID: Random 32-byte hex string
- Cookie settings:
  - HttpOnly (prevents JavaScript access)
  - Secure (HTTPS only in production)
  - SameSite=strict (CSRF protection)
  - Path: `/` (available site-wide)

### Protected Routes

All admin API routes are protected using the `requireAuth()` middleware:
- `/api/menu/**` - Menu management
- `/api/footer/**` - Footer management
- `/api/upload` - File uploads
- `/api/status` - Status management

If a request is not authenticated, it returns a 401 Unauthorized error.

## How to Change Credentials

### Method: Edit Source Code

1. Open `src/lib/auth.ts`
2. Find these lines at the top:
   ```typescript
   const ADMIN_USERNAME = "admin";
   const ADMIN_PASSWORD = "password";
   ```
3. Change the values to your desired credentials:
   ```typescript
   const ADMIN_USERNAME = "your-username";
   const ADMIN_PASSWORD = "your-password";
   ```
4. Save the file
5. Restart your development server

**Note:** Since credentials are hardcoded, you must restart the server for changes to take effect.

## API Endpoints

### POST `/api/auth/login`

Login endpoint that authenticates the user.

**Request:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

### POST `/api/auth/logout`

Logout endpoint that destroys the session.

**Success Response (200):**
```json
{
  "success": true
}
```

### GET `/api/auth/verify`

Verify if the current session is valid.

**Success Response (200):**
```json
{
  "authenticated": true,
  "username": "admin"
}
```

**Unauthorized Response (401):**
```json
{
  "authenticated": false
}
```

## Security Considerations

### Current Implementation

- **No Password Hashing:** Passwords are stored and compared as plain text. This is intentional to avoid hash-related issues, but is less secure.
- **In-Memory Sessions:** Sessions are lost when the server restarts.
- **Single Admin:** The system is designed for a single administrator.

### Security Notes

⚠️ **This authentication system is suitable for:**
- Development and testing
- Single-admin applications
- Internal tools with limited access

⚠️ **NOT suitable for:**
- Production applications with multiple users
- Public-facing applications
- Applications requiring high security

### Recommendations for Production

If you need a more secure system for production:

1. **Add Password Hashing:** Use bcrypt or similar to hash passwords
2. **Database Storage:** Store sessions and credentials in a database
3. **Rate Limiting:** Add rate limiting to prevent brute force attacks
4. **Password Reset:** Implement secure password reset functionality
5. **Multi-User Support:** Add user management system

## Troubleshooting

### Can't Login

1. **Check credentials:** Make sure you're using `admin` / `password` (or your custom credentials)
2. **Check server:** Ensure the development server is running
3. **Clear cookies:** Clear your browser cookies and try again
4. **Check console:** Look for errors in the browser console and server logs

### Session Expired

Sessions expire after 24 hours. Simply log in again.

### Server Restart

If the server restarts, all sessions are cleared. You'll need to log in again.

## Code Structure

### Authentication Library (`src/lib/auth.ts`)

Contains core authentication functions:
- `authenticate()` - Validate credentials and create session
- `createSession()` - Create a new session
- `verifySession()` - Check if session is valid
- `deleteSession()` - Remove a session
- `getSessionFromCookie()` - Extract session ID from cookie

### Middleware (`src/lib/middleware.ts`)

Provides authentication helpers for API routes:
- `requireAuth()` - Check if request is authenticated
- `authMiddleware()` - Wrapper for protected route handlers

### API Routes (`src/app/api/auth/`)

- `login/route.ts` - Handle login requests
- `logout/route.ts` - Handle logout requests
- `verify/route.ts` - Verify session status

### Admin Pages (`src/app/admin/`)

- `login/page.tsx` - Login form
- `page.tsx` - Admin dashboard (protected)

## Example Usage

### Protecting an API Route

```typescript
import { requireAuth } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // User is authenticated, proceed with request
  // user.username and user.sessionId are available
  return NextResponse.json({ success: true });
}
```

### Using Auth Middleware

```typescript
import { authMiddleware } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";

export const POST = authMiddleware(async (request, user) => {
  // User is guaranteed to be authenticated here
  // user.username and user.sessionId are available
  return NextResponse.json({ success: true, username: user.username });
});
```

## Summary

This authentication system provides a simple, straightforward way to protect your admin panel. While it's not suitable for high-security production environments, it's perfect for development and single-admin use cases where simplicity is more important than advanced security features.

For questions or issues, refer to the code in `src/lib/auth.ts` and `src/lib/middleware.ts`.




