# KRISHX — Technical Documentation

---

## 1. TECHNOLOGY STACK

### 1.1 Full Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE APPLICATION LAYER                     │
│  React Native 0.74.1 · Expo SDK 51 · Android min API 24       │
│  React Navigation 6 · Axios · expo-secure-store                │
├─────────────────────────────────────────────────────────────────┤
│                      API LAYER (Backend)                        │
│  Python 3.11 · Flask 2.3+ · Gunicorn · Flask-CORS             │
│  JWT (PyJWT 2.8+) · bcrypt 4.1+ · Werkzeug 3.0+              │
├─────────────────────────────────────────────────────────────────┤
│                        AI/ML LAYER                              │
│  TensorFlow 2.13+ · Keras 3.11+ · EfficientNetB4              │
│  scikit-learn 1.3+ · Pandas 2.0+ · NumPy 1.24+               │
│  OpenCV 4.8+ · Pillow 10.0+ · joblib 1.3+                    │
├─────────────────────────────────────────────────────────────────┤
│                       DATA LAYER                                │
│  SQLite 3 (development) · PostgreSQL 14+ (production)          │
│  Model files: .h5 (EfficientNetB4) · .pkl (RandomForest)      │
├─────────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                          │
│  Google Cloud Run / App Engine · Docker · GCP Cloud SQL        │
│  EAS Build (Expo Application Services) · SMTP (email)         │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Mobile Application Dependencies

| Package | Version | Purpose |
|---|---|---|
| expo | ~51.0.0 | Managed workflow, build tooling |
| react-native | 0.74.1 | Mobile framework |
| react | 18.2.0 | UI component library |
| @react-navigation/native | 6.x | Navigation container |
| @react-navigation/native-stack | 6.x | Stack navigation |
| @react-navigation/bottom-tabs | 6.x | Tab bar navigation |
| axios | 1.x | HTTP client with interceptors |
| expo-secure-store | ~13.0.0 | Encrypted token storage |
| expo-image-picker | ~15.0.0 | Camera + gallery access |
| expo-print | ~12.0.0 | PDF generation |
| expo-sharing | ~11.0.0 | File sharing |
| expo-linear-gradient | ~13.0.0 | Gradient components |
| @expo/vector-icons | ~14.0.0 | Ionicons icon set |

### 1.3 Backend Dependencies

| Package | Version | Purpose |
|---|---|---|
| flask | ≥2.3.0 | Web framework |
| flask-cors | ≥4.0.0 | Cross-Origin Resource Sharing |
| tensorflow | ≥2.13.0 | Deep learning framework |
| keras | ≥3.11.0 | High-level neural network API |
| scikit-learn | ≥1.3.0 | RandomForest, LabelEncoder |
| pandas | ≥2.0.0 | Dataset loading and processing |
| numpy | ≥1.24.0 | Numerical computation |
| Pillow | ≥10.0.0 | Image processing |
| opencv-python-headless | ≥4.8.0 | Computer vision operations |
| PyJWT | ≥2.8.0 | JWT token encode/decode |
| bcrypt | ≥4.1.0 | Password hashing |
| joblib | ≥1.3.0 | Model serialization |
| Werkzeug | ≥3.0.0 | WSGI utilities |
| gunicorn | ≥21.2.0 | Production WSGI server |
| psycopg2-binary | ≥2.9.0 | PostgreSQL adapter |

---

## 2. API DOCUMENTATION

### 2.1 Base URL

```
Development:  http://10.0.2.2:5000   (Android emulator → host)
Production:   https://api.krishx.com  (GCP Cloud Run / App Engine)
```

### 2.2 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Token lifespan:
- Access token: **24 hours** (auto-refreshed by mobile client)
- Refresh token: **30 days**

### 2.3 Response Format

All endpoints return JSON. Error responses always include an `error` key:
```json
{ "error": "Human-readable message", "code": "MACHINE_CODE" }
```

---

### 2.4 Authentication Endpoints

#### POST /auth/register
Register a new user. Creates a pending account and sends a 6-digit OTP via email.

**Request Body:**
```json
{
  "full_name": "John Smith",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "mypassword123"
}
```

**Success Response (200):**
```json
{
  "status": "otp_sent",
  "email": "john@example.com",
  "message": "OTP sent to your email. Verify to activate your account."
}
```

**Error Responses:**
- `422` — Validation failed (fields in `fields` object)
- `409` — Email already registered (`code: DUPLICATE_EMAIL`)
- `429` — Too many attempts (`code: RATE_LIMITED`)

---

#### POST /auth/verify-otp
Verify the 6-digit OTP sent during registration. Activates the account and returns JWT tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp_code": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified! Account activated.",
  "user": { "id": 1, "full_name": "John Smith", "email": "john@example.com", "is_admin": false },
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 86400
}
```

**Error Responses:**
- `422` — OTP expired or not found (`code: OTP_EXPIRED`)
- `422` — Incorrect OTP, N attempts remaining (`code: OTP_INCORRECT`)
- `429` — Max attempts reached (`code: OTP_MAX_ATTEMPTS`)

---

#### POST /auth/resend-otp
Resend OTP for registration or password reset. Rate-limited: 3 resends per 30 minutes.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp_type": "register"
}
```
`otp_type` is `"register"` or `"reset"`.

**Success Response (200):**
```json
{
  "status": "otp_sent",
  "email": "john@example.com",
  "message": "New OTP sent to your email."
}
```

---

#### POST /auth/login
Authenticate a user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": { "id": 1, "full_name": "John Smith", "email": "john@example.com", "is_admin": false },
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 86400
}
```

**Error Responses:**
- `401` — Invalid credentials
- `403` — Account deactivated
- `429` — Too many login attempts (10 per IP per 15 minutes)

---

#### POST /auth/refresh
Exchange a refresh token for a new access token.

**Request Body:**
```json
{ "refresh_token": "eyJ..." }
```

**Success Response (200):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 86400
}
```

---

#### POST /auth/forgot-password
Request a password reset OTP. Always returns the same response regardless of whether the email exists (prevents enumeration).

**Request Body:**
```json
{ "email": "john@example.com" }
```

**Success Response (200):**
```json
{
  "status": "otp_sent",
  "email": "john@example.com",
  "message": "If an account exists for this email, an OTP has been sent."
}
```

---

#### POST /auth/verify-reset-otp
Verify the reset OTP and receive a short-lived reset token (15 minutes).

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp_code": "654321"
}
```

**Success Response (200):**
```json
{
  "message": "OTP verified. Use the reset_token to set a new password.",
  "reset_token": "eyJ..."
}
```

---

#### POST /auth/reset-password
Set a new password using the reset token received from verify-reset-otp.

**Request Body:**
```json
{
  "reset_token": "eyJ...",
  "new_password": "newSecurePassword123"
}
```

**Success Response (200):**
```json
{ "message": "Password reset successfully." }
```

---

### 2.5 Prediction Endpoints

#### POST /predict
🔒 Requires: Optional JWT (anonymous predictions supported for guest users)

Perform soil analysis and get crop + fertilizer recommendations.

**Request Body:**
```json
{
  "temperature": 25.5,
  "humidity": 65.0,
  "moisture": 45.0,
  "nitrogen": 80,
  "phosphorous": 40,
  "potassium": 60
}
```

**Success Response (200):**
```json
{
  "Soil Type": "Loamy",
  "Recommended Crops": ["Wheat", "Rice", "Maize", "Soybean", "Chickpea"],
  "Crop Confidence": "87.3%",
  "Recommended Fertilizer": "NPK 20-10-10",
  "Pests": [
    { "name": "Grasshopper", "description": "...", "treatment": "..." }
  ],
  "soil_note": "Loamy soil retains moisture well...",
  "disclaimer": "Please consult a qualified agricultural professional..."
}
```

---

#### POST /pest-detect
🔒 Requires: JWT (authenticated users only)

Upload an image for AI-powered pest identification.

**Request:** `multipart/form-data` with `image` field (JPEG or PNG).

**Success Response (200):**
```json
{
  "insect_name": "Grasshopper",
  "scientific_name": "Acrididae",
  "confidence": 0.9245,
  "risk_level": "High",
  "symptoms": ["Leaf skeletonization", "Complete defoliation"],
  "pesticide": "Malathion 50EC — apply 1.5ml/L",
  "organic_control": "Neem oil spray, pyrethrin",
  "prevention": "Monitor field edges, crop rotation",
  "disclaimer": "Consult an agricultural professional before applying any chemical."
}
```

**Error Responses:**
- `400` — No image provided
- `422` — Invalid image format
- `500` — Model prediction error

---

### 2.6 History Endpoints

#### GET /history
🔒 Requires: JWT

Fetch user's prediction history.

**Query Parameters:**
- `page` (int, default: 1)
- `per_page` (int, default: 20, max: 50)

**Success Response (200):**
```json
{
  "predictions": [ { ...prediction record... } ],
  "total": 45,
  "page": 1,
  "per_page": 20,
  "pages": 3
}
```

#### GET /history/:id
🔒 Requires: JWT — Get a single prediction record.

#### DELETE /history/:id
🔒 Requires: JWT — Delete a prediction record (user's own only).

#### GET /pest-history
🔒 Requires: JWT — Fetch user's pest detection history.

#### DELETE /pest-history/:id
🔒 Requires: JWT — Delete a pest detection record.

---

### 2.7 User Endpoints

#### GET /user/profile
🔒 Requires: JWT — Get the authenticated user's profile.

**Success Response (200):**
```json
{
  "id": 1,
  "full_name": "John Smith",
  "email": "john@example.com",
  "phone": "+1234567890",
  "is_admin": false,
  "created_at": "2025-01-15T10:30:00",
  "last_login": "2025-06-01T08:15:00"
}
```

#### PUT /user/profile
🔒 Requires: JWT — Update name, phone, profile image.

**Request Body:**
```json
{
  "full_name": "John A. Smith",
  "phone": "+1987654321"
}
```

#### PUT /user/password
🔒 Requires: JWT — Change password.

**Request Body:**
```json
{
  "current_password": "oldpass123",
  "new_password": "newpass456"
}
```

#### GET /user/stats
🔒 Requires: JWT — Get prediction statistics.

**Success Response (200):**
```json
{
  "total_predictions": 23,
  "total_pest_detections": 8,
  "member_since": "2025-01-15"
}
```

---

### 2.8 Admin Endpoints

All admin endpoints require `is_admin: true` in the JWT payload.

#### GET /admin/dashboard
🔒 Requires: Admin JWT

```json
{
  "total_users": 150,
  "active_users": 142,
  "total_predictions": 1834,
  "total_pest_detections": 367,
  "new_users_today": 5,
  "predictions_today": 48
}
```

#### GET /admin/users?page=1
🔒 Requires: Admin JWT — Paginated list of all users.

#### PUT /admin/users/:id/status
🔒 Requires: Admin JWT — Toggle user active/inactive.

**Request Body:** `{ "is_active": true }`

#### GET /admin/predictions?page=1
🔒 Requires: Admin JWT — View all predictions platform-wide.

#### DELETE /admin/predictions/:id
🔒 Requires: Admin JWT — Delete any prediction.

---

### 2.9 Health Endpoint

#### GET /health
Public. Returns API status.

```json
{
  "status": "healthy",
  "message": "KRISHX Agricultural API v3",
  "timestamp": "2025-06-01T12:00:00Z"
}
```

---

## 3. DATABASE DOCUMENTATION

### 3.1 Schema Overview

```
users ─────────────────────────────────────────────
  id              INTEGER PK AUTOINCREMENT
  full_name       TEXT NOT NULL
  email           TEXT NOT NULL UNIQUE
  phone           TEXT
  password_hash   TEXT NOT NULL          ← bcrypt hash
  is_admin        INTEGER DEFAULT 0
  profile_image   TEXT
  created_at      TEXT NOT NULL          ← ISO 8601 UTC
  last_login      TEXT
  is_active       INTEGER DEFAULT 1
  email_verified  INTEGER DEFAULT 1

predictions ───────────────────────────────────────
  id                     INTEGER PK
  user_id                INTEGER → users(id) ON DELETE SET NULL
  temperature            REAL
  humidity               REAL
  moisture               REAL
  nitrogen               REAL
  phosphorous            REAL
  potassium              REAL
  predicted_soil_type    TEXT
  recommended_crop       TEXT
  all_crops              TEXT           ← JSON array string
  crop_confidence        TEXT
  possible_pests         TEXT           ← JSON array string
  recommended_fertilizer TEXT
  soil_note              TEXT
  timestamp              TEXT NOT NULL

pest_detections ───────────────────────────────────
  id               INTEGER PK
  user_id          INTEGER → users(id) ON DELETE SET NULL
  insect_name      TEXT
  scientific_name  TEXT
  confidence       REAL
  risk_level       TEXT
  symptoms         TEXT              ← JSON array string
  pesticide        TEXT
  organic_control  TEXT
  prevention       TEXT
  timestamp        TEXT NOT NULL

otp_codes ─────────────────────────────────────────
  id          INTEGER PK
  email       TEXT NOT NULL
  otp_type    TEXT NOT NULL          ← 'register' | 'reset'
  otp_code    TEXT NOT NULL          ← 6 digits
  created_at  TEXT NOT NULL
  expires_at  TEXT NOT NULL          ← created_at + 300s
  is_used     INTEGER DEFAULT 0
  attempts    INTEGER DEFAULT 0      ← max 3 before lockout

admin_logs ────────────────────────────────────────
  id         INTEGER PK
  admin_id   INTEGER → users(id)
  action     TEXT
  target     TEXT
  details    TEXT
  created_at TEXT NOT NULL
```

### 3.2 Key Indexes

```sql
CREATE INDEX idx_otp_email ON otp_codes(email, otp_type);
-- Additional implicit indexes on UNIQUE email in users
```

### 3.3 Data Types Note

All timestamps are stored as ISO 8601 UTC strings (`TEXT`) for portability between SQLite and PostgreSQL. JSON arrays (crops, pests, symptoms) are stored as JSON strings and parsed in the API layer.

### 3.4 Admin Account Seed

The `init_db()` function seeds a default admin account on first run:
```
Email:    admin@krishx.com
Password: Admin@123  (bcrypt hashed)
Role:     is_admin = 1
```
**Change this password immediately after first deployment.**

---

## 4. AUTHENTICATION FLOW DOCUMENTATION

### 4.1 Registration Flow

```
Client                              Server                    Email
  │                                    │                        │
  ├─── POST /auth/register ───────────►│                        │
  │    {full_name, email, phone, pass} │                        │
  │                                    ├── Validate input       │
  │                                    ├── Hash password (bcrypt)
  │                                    ├── Create pending user  │
  │                                    │   (is_active=0)        │
  │                                    ├── Generate 6-digit OTP │
  │                                    ├── Store OTP in DB      │
  │                                    │   (expires in 5 min)   │
  │                                    ├─────────────────────────►
  │                                    │      Send OTP email    │
  │◄─── 200 {status: "otp_sent"} ──────┤                        │
  │                                    │                        │
  ├─── POST /auth/verify-otp ─────────►│                        │
  │    {email, otp_code}               │                        │
  │                                    ├── Find active OTP      │
  │                                    ├── Check expiry (5 min) │
  │                                    ├── Check attempts (≤3)  │
  │                                    ├── Compare OTP          │
  │                                    ├── Mark OTP used        │
  │                                    ├── Activate user        │
  │                                    │   (is_active=1)        │
  │                                    ├── Generate JWT tokens  │
  │◄─── 200 {user, access_token,       │                        │
  │          refresh_token} ───────────┤                        │
  │                                    │                        │
  │  [Store tokens in SecureStore]     │                        │
```

### 4.2 Login Flow

```
Client                              Server
  │                                    │
  ├─── POST /auth/login ──────────────►│
  │    {email, password}               │
  │                                    ├── Check IP rate limit (10/15min)
  │                                    ├── Fetch user by email
  │                                    ├── Verify password (bcrypt)
  │                                    ├── Check is_active
  │                                    ├── Update last_login
  │                                    ├── Generate JWT pair
  │◄─── 200 {user, access_token,       │
  │          refresh_token} ───────────┤
  │                                    │
  │  [Store in expo-secure-store]      │
  │  [Attach to all future requests]   │
```

### 4.3 Token Auto-Refresh Flow (Axios Interceptor)

```
Client                              Server
  │                                    │
  ├─── GET /user/profile ─────────────►│
  │    Authorization: Bearer <expired> │
  │◄─── 401 {code: "TOKEN_EXPIRED"} ───┤
  │                                    │
  │  [api.js response interceptor]     │
  │  [Queue all pending requests]      │
  │                                    │
  ├─── POST /auth/refresh ────────────►│
  │    {refresh_token}                 │
  │◄─── 200 {access_token, ...} ───────┤
  │                                    │
  │  [Update SecureStore]              │
  │  [Retry all queued requests]       │
  ├─── GET /user/profile ─────────────►│
  │    Authorization: Bearer <new>     │
  │◄─── 200 {profile data} ────────────┤
```

### 4.4 Password Reset Flow

```
Client                              Server                    Email
  │                                    │                        │
  ├─── POST /auth/forgot-password ────►│                        │
  │    {email}                         │                        │
  │                                    ├── Validate email       │
  │                                    ├── Look up user (silent)│
  │                                    ├─────────────────────────►
  │                                    │   Send reset OTP       │
  │◄─── 200 (same regardless) ─────────┤  (if user exists)      │
  │                                    │                        │
  ├─── POST /auth/verify-reset-otp ───►│                        │
  │    {email, otp_code}               │                        │
  │                                    ├── Verify OTP           │
  │                                    ├── Generate reset JWT   │
  │                                    │   (15 min expiry)      │
  │◄─── 200 {reset_token} ─────────────┤                        │
  │                                    │                        │
  ├─── POST /auth/reset-password ─────►│                        │
  │    {reset_token, new_password}     │                        │
  │                                    ├── Decode reset JWT     │
  │                                    ├── Hash new password    │
  │                                    ├── Update users table   │
  │◄─── 200 {message: "Password reset"}┤                        │
```

---

## 5. ADMIN SYSTEM DOCUMENTATION

### 5.1 Admin Access Control

Admin users are identified by `is_admin = 1` in the users table. The JWT payload carries `is_admin: true`, and all admin routes are protected by the `@admin_required` decorator in `auth.py`.

**RBAC Matrix:**

| Resource | Regular User | Admin |
|---|---|---|
| Own profile | Read/Write | Read/Write |
| Own predictions | Read/Delete | Read/Delete |
| All users | ❌ | Read (paginated) |
| User active status | ❌ | Toggle |
| All predictions | ❌ | Read/Delete |
| Admin dashboard stats | ❌ | Read |
| Admin logs | ❌ | Written automatically |

### 5.2 Admin Action Logging

Every admin action (toggle user, delete prediction) is automatically logged to `admin_logs`:

```sql
INSERT INTO admin_logs (admin_id, action, target, details, created_at)
VALUES (1, 'TOGGLE_USER', 'user_id:42', 'Set is_active=0', '2025-06-01T10:00:00')
```

### 5.3 Admin Dashboard Statistics

The `/admin/dashboard` endpoint queries:
- COUNT all users / active users
- COUNT all predictions / pest detections
- COUNT new users and predictions in the last 24 hours

### 5.4 Default Admin Credentials

```
Email:    admin@krishx.com
Password: Admin@123
```
⚠️ **Change immediately after deployment.**

---

## 6. DEPLOYMENT DOCUMENTATION

*(See docs/08_DEPLOYMENT_GUIDE.md for full step-by-step instructions)*

### 6.1 Local Development

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
python app.py                   # http://localhost:5000

# Mobile (separate terminal)
cd mobile
npm install
npx expo start                  # Scan QR code with Expo Go
```

### 6.2 Production Deployment Summary

| Component | Method | Service |
|---|---|---|
| Backend API | Docker container | GCP Cloud Run |
| Alternative | Python app | GCP App Engine |
| Database | Cloud SQL PostgreSQL | GCP Cloud SQL |
| Mobile App | EAS Build | APK / AAB |
| SMTP Email | App Password | Gmail SMTP |

### 6.3 Required Environment Variables

| Variable | Description | Default |
|---|---|---|
| `KRISHX_SECRET` | JWT signing key (≥32 chars) | ⚠️ Insecure default |
| `DB_PATH` | SQLite file path | `./krishx.db` |
| `DATABASE_URL` | PostgreSQL connection string | None (uses SQLite) |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email address | None (DEV_MODE) |
| `SMTP_PASS` | Email app password | None (DEV_MODE) |
| `ALLOWED_ORIGINS` | CORS allowed origins (CSV) | `*` (all) |

---

*Technical Documentation v1.0 | KRISHX Agriculture Platform*
