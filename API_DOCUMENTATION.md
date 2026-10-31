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
        API->>DB: Save user (isVerified: false, 4-digit verification code)
        API->>Mail: Send 4-digit verification code email
        API-->>User: 201 Created ("Account registered successfully. A verification code has been sent to your email.")
        User->>API: POST /auth/verify-otp { email, otp }
        API->>DB: Mark isVerified: true, clear OTP
        API-->>User: 200 OK ("Account verified successfully.")
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
Creates a new account, generates a **4-digit verification code**, and emails it to the user.

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
    "message": "Account registered successfully. A verification code has been sent to your email."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `An account with this email address already exists.`

---

### 2. Verify Account OTP
Validates the 4-digit verification code and activates the account.

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
    "message": "Account verified successfully."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `Invalid verification code.` or `Verification code has expired. Please request a new one.`
  - `404 Not Found`: `Account not found with the provided email.`

---

### 3. Resend Account OTP
Generates a new 4-digit code if the previous one expired or was not received.

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
    "message": "A new verification code has been sent to your email."
  }
  ```
- **Error Responses:**
  - `404 Not Found`: `Account not found with the provided email.`

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
    "message": "Google authentication successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6724391ab...",
      "name": "Ali Elsese",
      "email": "info.alwadih@gmail.com",
      "avatar": "https://lh3.googleusercontent.com/...",
      "isVerified": true
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `Google authentication token is required.`
  - `401 Unauthorized`: `Google authentication failed: token is invalid or expired.`

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
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: `Invalid email or password.`
  - `401 Unauthorized`: `Account is not verified. Please verify your email before logging in.`
  - `401 Unauthorized`: `This account was registered using Google. Please sign in with Google or reset your password.`

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
    API-->>User: 200 OK ("Password reset code has been sent to your email.")
    User->>API: POST /auth/verify-reset-otp { email, otp }
    API->>DB: Verify OTP, issue 15-min resetToken
    API-->>User: 200 OK { resetToken }
    User->>API: POST /auth/reset-password { email, newPassword, resetToken }
    API->>DB: Hash new password, clear reset tokens
    API-->>User: 200 OK ("Password has been reset successfully. You can now log in with your new password.")
```

### 1. Request Reset OTP (Forgot Password)
Sends a 4-digit reset code to the user's email.

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
    "message": "Password reset code has been sent to your email."
  }
  ```
- **Error Responses:**
  - `404 Not Found`: `No account found with this email address.`

---

### 2. Resend Reset OTP
Resends a new 4-digit code for password reset.

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
    "message": "A new password reset code has been sent to your email."
  }
  ```
- **Error Responses:**
  - `404 Not Found`: `No account found with this email address.`

---

### 3. Verify Reset OTP
Verifies the 4-digit code and returns a temporary `resetToken` valid for 15 minutes.

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
    "message": "Verification code verified successfully. You may now reset your password.",
    "resetToken": "5f8a29b4e1c390..."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `Invalid verification code.` or `Verification code has expired. Please request a new one.`
  - `404 Not Found`: `No account found with this email address.`

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
    "message": "Password has been reset successfully. You can now log in with your new password."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `Password reset session has expired or is invalid. Please request a new verification code.`
  - `400 Bad Request`: `Invalid or expired reset token.`
  - `404 Not Found`: `No account found with this email address.`
