# 🚀 Alwadih Backend API Documentation

Welcome to the **Alwadih Backend API** documentation. This document covers all endpoints for Authentication, Google Sign-in / Sign-up, Account Verification, and Password Reset.

You can import the included Postman collection directly:
📁 **File:** [`postman_collection.json`](./postman_collection.json)

---

## ⚙️ Base URL & Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `{{base_url}}` | `http://localhost:8000` | Base URL of the API server |
| `{{jwt_token}}` | Auto-set on login / google auth | Bearer token for authorized requests |
| `{{reset_token}}` | Auto-set on OTP verify | Temporary token used to complete password reset |

---

## 📋 Table of Contents

- [General](#1-general)
  - [Health Check](#health-check)
- [Authentication Flow](#2-authentication-flow)
  - [1. User Registration (Signup)](#1-user-registration-signup)
  - [2. Verify Account OTP](#2-verify-account-otp)
  - [3. Resend Account OTP](#3-resend-account-otp)
  - [4. Register or Login with Google](#4-register-or-login-with-google)
  - [5. Login](#5-login)
- [Password Reset Flow](#3-password-reset-flow)
  - [1. Request Reset OTP (Forgot Password)](#1-request-reset-otp-forgot-password)
  - [2. Resend Reset OTP](#2-resend-reset-otp)
  - [3. Verify Reset OTP](#3-verify-reset-otp)
  - [4. Change Password](#4-change-password)

---

## 1. General

### Health Check
Check if the API server is online.

- **Method:** `GET`
- **URL:** `{{base_url}}/`
- **Response `200 OK`:**
  ```text
  Hello World!
  ```

---

## 2. Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant API as Alwadih API
    participant Google as Google Identity
    participant Mail as Nodemailer / SMTP
    participant DB as MongoDB

    alt Standard Registration
        User->>API: POST /auth/signup { name, email, password }
        API->>DB: Save user (isVerified: false, 4-digit OTP)
        API->>Mail: Send 4-digit OTP email
        API-->>User: 201 Created ("Registered successfully! Please check your email")
        User->>API: POST /auth/verify-otp { email, otp }
        API->>DB: Mark isVerified: true, clear OTP
        API-->>User: 200 OK ("Account verified successfully!")
        User->>API: POST /auth/login { email, password }
        API-->>User: 200 OK { token }
    else Google Sign-in / Sign-up
        User->>Google: Authenticate & receive token
        User->>API: POST /auth/google { idToken }
        API->>Google: Verify token
        API->>DB: Register or Login user (isVerified: true)
        API-->>User: 200 OK { token, user }
    end
```

### 1. User Registration (Signup)
Creates a new account, generates a **4-digit OTP**, and emails it to the user.

- **Method:** `POST`
- **URL:** `{{base_url}}/auth/signup`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "SecretPass123!"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "message": "Registered successfully! Please check your email for the OTP verification code."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Email already registered or invalid fields.

---

### 2. Verify Account OTP
Validates the 4-digit OTP and activates the account.

- **Method:** `POST`
- **URL:** `{{base_url}}/auth/verify-otp`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "4829"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "message": "Account verified successfully..!"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Invalid OTP or OTP expired (valid for 10 minutes).

---

### 3. Resend Account OTP
Generates a new 4-digit OTP if the previous one expired or was not received.

- **Method:** `POST`
- **URL:** `{{base_url}}/auth/resend-otp`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "message": "A new OTP code has been sent to your email."
  }
  ```

---

### 4. Register or Login with Google
Authenticates a user via Google/Gmail. If the user does not exist, registers them automatically and marks their account as verified. If they already exist, logs them in.

- **Method:** `POST`
- **URL:** `{{base_url}}/auth/google`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "idToken": "<GOOGLE_ID_TOKEN_OR_ACCESS_TOKEN>"
  }
  ```
  *(Accepts `idToken`, `token`, or `credential`)*
- **Response `200 OK`:**
  ```json
  {
    "message": "Google authentication successful..!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6724391ab...",
      "name": "Ali Elsese",
      "email": "ali@gmail.com",
      "avatar": "https://lh3.googleusercontent.com/...",
      "isVerified": true
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Missing token.
  - `401 Unauthorized`: Invalid or expired Google token.

---

### 5. Login
Authenticates user credentials and returns a JWT token.  
*(Note: Requires the account to be verified via `/auth/verify-otp` first).*

- **Method:** `POST`
- **URL:** `{{base_url}}/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecretPass123!"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "message": "Loggedin Successfully..!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Wrong credentials, account not verified, or account registered via Google without a password.

---

## 3. Password Reset Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant API as Alwadih API
    participant Mail as Nodemailer / SMTP
    participant DB as MongoDB

    User->>API: POST /auth/forgot-password { email }
    API->>DB: Set resetOtp (4 digits, 10 min expiry)
    API->>Mail: Send Password Reset OTP email
    API-->>User: 200 OK ("Password reset OTP has been sent")
    User->>API: POST /auth/verify-reset-otp { email, otp }
    API->>DB: Verify OTP, issue 15-min resetToken
    API-->>User: 200 OK { resetToken }
    User->>API: POST /auth/reset-password { email, newPassword, resetToken }
    API->>DB: Hash new password, clear reset tokens
    API-->>User: 200 OK ("Password has been reset successfully!")
```

### 1. Request Reset OTP (Forgot Password)
Sends a 4-digit reset OTP to the user's email.

- **Method:** `POST`
- **URL:** `{{base_url}}/auth/forgot-password`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "message": "Password reset OTP has been sent to your email."
  }
  ```
- **Error Responses:**
  - `404 Not Found`: No account found with this email.

---

### 2. Resend Reset OTP
Resends a new 4-digit OTP for password reset.

- **Method:** `POST`
- **URL:** `{{base_url}}/auth/resend-reset-otp`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "message": "A new password reset OTP has been sent to your email."
  }
  ```

---

### 3. Verify Reset OTP
Verifies the 4-digit OTP and returns a temporary `resetToken` valid for 15 minutes.

- **Method:** `POST`
- **URL:** `{{base_url}}/auth/verify-reset-otp`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "8392"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "message": "OTP verified successfully. You can now reset your password.",
    "resetToken": "5f8a29b4e1c390..."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Invalid OTP or OTP expired.

---

### 4. Change Password
Resets the password to `newPassword` using the `resetToken`.

- **Method:** `POST`
- **URL:** `{{base_url}}/auth/reset-password`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "newPassword": "BrandNewPassword123!",
    "resetToken": "5f8a29b4e1c390..."
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "message": "Password has been reset successfully! You can now log in with your new password."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Password reset session expired, invalid token, or password shorter than 6 characters.
