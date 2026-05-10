# Auth API Documentation

Base URL:

```text
http://localhost:5000/api/auth
```

## Register User

Creates a new user account with name, email, and password.

```http
POST /register
```

Full URL:

```text
http://localhost:5000/api/auth/register
```

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response

Status code: `201 Created`

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Error Responses

Status code: `400 Bad Request`

```json
{
  "message": "Name, email, and password are required"
}
```

Status code: `409 Conflict`

```json
{
  "message": "User already exists with this email"
}
```

Status code: `500 Internal Server Error`

```json
{
  "message": "Failed to register user",
  "error": "error message here"
}
```

## Login User

Logs in an existing user with email and password.

```http
POST /login
```

Full URL:

```text
http://localhost:5000/api/auth/login
```

### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response

Status code: `200 OK`

```json
{
  "message": "User logged in successfully",
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "session": {
    "token": "session_token_here",
    "expiresAt": "2026-05-11T06:00:00.000Z"
  }
}
```

### Error Responses

Status code: `400 Bad Request`

```json
{
  "message": "Email and password are required"
}
```

Status code: `401 Unauthorized`

```json
{
  "message": "Invalid email or password"
}
```

Status code: `500 Internal Server Error`

```json
{
  "message": "Failed to login user",
  "error": "error message here"
}
```

## Logout User

Logs out a user by clearing their active session token.

```http
POST /logout
```

Full URL:

```text
http://localhost:5000/api/auth/logout
```

### Request Header

```http
Authorization: Bearer session_token_here
```

You can also send the token in the request body:

```json
{
  "sessionToken": "session_token_here"
}
```

### Success Response

Status code: `200 OK`

```json
{
  "message": "User logged out successfully"
}
```

### Error Responses

Status code: `400 Bad Request`

```json
{
  "message": "Session token is required"
}
```

Status code: `401 Unauthorized`

```json
{
  "message": "Invalid or expired session"
}
```

Status code: `500 Internal Server Error`

```json
{
  "message": "Failed to logout user",
  "error": "error message here"
}
```

## Notes

- Passwords are hashed with bcrypt before being saved in MongoDB.
- API responses do not return the password.
- Login creates a session token that expires after 24 hours.
- MongoDB must be connected before using these APIs.
