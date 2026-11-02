# KRISHX Agriculture — System Architecture Diagrams

---

## 1. HIGH-LEVEL SYSTEM ARCHITECTURE

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        KRISHX SYSTEM ARCHITECTURE                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐   ║
║  │                  PRESENTATION TIER (CLIENT)                          │   ║
║  │                                                                       │   ║
║  │  ┌─────────────────────────────────────────────────────────────┐    │   ║
║  │  │            KRISHX Android Application                        │    │   ║
║  │  │            React Native + Expo SDK 51                        │    │   ║
║  │  │                                                               │    │   ║
║  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │    │   ║
║  │  │  │  Auth    │ │  Soil    │ │  Pest    │ │  History /   │  │    │   ║
║  │  │  │ Screens  │ │Analysis  │ │Detection │ │    PDF       │  │    │   ║
║  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │    │   ║
║  │  │         ↕ React Navigation          ↕ Axios HTTP Client    │    │   ║
║  │  └─────────────────────────────────────────────────────────────┘    │   ║
║  └──────────────────────────────┬──────────────────────────────────────┘   ║
║                                  │ HTTPS / REST API                         ║
║  ┌───────────────────────────────▼──────────────────────────────────────┐  ║
║  │                  APPLICATION TIER (BACKEND)                          │  ║
║  │                                                                       │  ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │  ║
║  │  │           Flask Python API  (Gunicorn WSGI)                    │ │  ║
║  │  │           Google Cloud Run / App Engine                        │ │  ║
║  │  │                                                                 │ │  ║
║  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │ │  ║
║  │  │  │  Auth    │  │ Predict  │  │  Pest    │  │   Admin      │ │ │  ║
║  │  │  │  (auth.py│  │Endpoint  │  │ Detect   │  │  Endpoints   │ │ │  ║
║  │  │  │  JWT+bcry│  │/predict  │  │/pest-det │  │  /admin/*    │ │ │  ║
║  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │ │  ║
║  │  │        Security Layer: CORS + Rate Limiting + Headers         │ │  ║
║  │  └────────────────────────────────────────────────────────────────┘ │  ║
║  └──────────────────────────────┬──────────────────────────────────────┘  ║
║                                  │                                          ║
║  ┌───────────────────────────────▼──────────────────────────────────────┐  ║
║  │                      DATA TIER                                       │  ║
║  │                                                                       │  ║
║  │   ┌──────────────────────┐     ┌────────────────────────────────┐   │  ║
║  │   │   AI MODELS          │     │   DATABASE                     │   │  ║
║  │   │                      │     │                                │   │  ║
║  │   │  EfficientNetB4      │     │  SQLite (dev/small scale)      │   │  ║
║  │   │  .h5 ~75MB           │     │  PostgreSQL (prod scale)       │   │  ║
║  │   │  Pest: 12 classes    │     │                                │   │  ║
║  │   │                      │     │  Tables:                       │   │  ║
║  │   │  RandomForest        │     │  • users                       │   │  ║
║  │   │  .pkl ~1.6MB         │     │  • predictions                 │   │  ║
║  │   │  Soil + Crops        │     │  • pest_detections             │   │  ║
║  │   │                      │     │  • otp_codes                   │   │  ║
║  │   └──────────────────────┘     │  • admin_audit_log             │   │  ║
║  │                                └────────────────────────────────┘   │  ║
║  └──────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. DATA FLOW DIAGRAM — LEVEL 0 (CONTEXT DIAGRAM)

```
                        ┌───────────────────────────────┐
                        │                               │
   ┌──────────┐  soil   │                               │  crop recs
   │          │────────►│                               │──────────►┌──────────┐
   │  FARMER  │  params │                               │           │  FARMER  │
   │  (User)  │         │    KRISHX AGRICULTURE         │  pest     │  (User)  │
   │          │  pest   │    AI ADVISORY PLATFORM       │  report   │          │
   │          │ photo   │                               │──────────►│          │
   │          │────────►│                               │           └──────────┘
   └──────────┘         │                               │
                        │                               │  usage
   ┌──────────┐  admin  │                               │  stats    ┌──────────┐
   │  ADMIN   │ request │                               │──────────►│  ADMIN   │
   │  (Mgmt)  │────────►│                               │           │  (Mgmt)  │
   └──────────┘         └───────────────────────────────┘           └──────────┘
                                       │
                              email    │
                             delivery  │
                                       ▼
                               ┌───────────┐
                               │  FARMER'S │
                               │   EMAIL   │
                               │ (OTP/Notif│
                               └───────────┘
```

---

## 3. DATA FLOW DIAGRAM — LEVEL 1 (DETAILED)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KRISHX DATA FLOW (LEVEL 1)                          │
└─────────────────────────────────────────────────────────────────────────────┘

FARMER                  MOBILE APP              BACKEND             DATABASE
  │                         │                      │                    │
  │  [Register]             │                      │                    │
  │────────────────────────►│                      │                    │
  │                         │─POST /auth/register─►│                    │
  │                         │                      │──INSERT users─────►│
  │                         │                      │  (unverified)      │
  │                         │                      │──INSERT otp_codes─►│
  │                         │                      │──SMTP send email──►│ (email)
  │                         │◄──── OTP sent ───────│                    │
  │  [Enter OTP]            │                      │                    │
  │────────────────────────►│                      │                    │
  │                         │─POST /auth/verify-otp►                    │
  │                         │                      │──SELECT otp_codes─►│
  │                         │                      │◄──── OTP record ───│
  │                         │                      │──UPDATE users──────►│
  │                         │                      │  (verified=true)    │
  │                         │                      │──UPDATE otp_codes──►│
  │                         │                      │  (used=true)        │
  │                         │◄─ access+refresh tok─│                    │
  │  [Soil Analysis]        │                      │                    │
  │  Enter N,P,K,T,H,M     │                      │                    │
  │────────────────────────►│                      │                    │
  │                         │─POST /predict ───────►│                    │
  │                         │  {N,P,K,temp,hum,moi}│──load RF model────►│(pkl)
  │                         │                      │  predict soil type  │
  │                         │                      │  predict top-5 crop │
  │                         │                      │──INSERT predictions►│
  │                         │◄─{soil,crops,conf}───│                    │
  │  [Pest Photo]           │                      │                    │
  │  Capture/Select        │                      │                    │
  │────────────────────────►│                      │                    │
  │                         │─POST /pest-detect ───►│                    │
  │                         │  {image: base64}     │──load EfficientNet►│(.h5)
  │                         │                      │  preprocess image   │
  │                         │                      │  model.predict()    │
  │                         │                      │──INSERT pest_det───►│
  │                         │◄─{pest,confidence,   │                    │
  │                         │   pesticide,organic}─│                    │
  │  [View History]         │                      │                    │
  │────────────────────────►│                      │                    │
  │                         │─GET /history─────────►│                    │
  │                         │                      │──SELECT predictions►│
  │                         │                      │──SELECT pest_det───►│
  │                         │◄─{history array}─────│                    │
```

---

## 4. USE CASE DIAGRAM

```
╔══════════════════════════════════════════════════════════════════════╗
║                       KRISHX USE CASES                              ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ACTORS:                                                             ║
║  👩‍🌾 Farmer (Registered User)                                        ║
║  👨‍💼 Administrator (Admin User)                                       ║
║  📧 Email System (External)                                          ║
║                                                                      ║
╠══════════════════════════════════╦═══════════════════════════════════╣
║   FARMER USE CASES               ║   ADMIN USE CASES                ║
║                                  ║                                   ║
║  UC01: Register Account          ║  UC10: Login as Admin            ║
║        ├─ UC02: Verify OTP       ║  UC11: View All Users            ║
║                                  ║  UC12: Activate/Deactivate User  ║
║  UC03: Login                     ║  UC13: View All Predictions      ║
║        ├─ extends: UC07          ║  UC14: View Pest Detections      ║
║              (Token Refresh)     ║  UC15: View System Analytics     ║
║                                  ║  UC16: Export Data               ║
║  UC04: Analyse Soil & Get Crops  ║  UC17: View Audit Log            ║
║        ├─ includes: UC04a        ║                                   ║
║        │   (Get Fertilizer Rec)  ║                                   ║
║        └─ includes: UC08         ║                                   ║
║            (Save to History)     ║                                   ║
║                                  ║                                   ║
║  UC05: Detect Pest               ║  SHARED USE CASES                ║
║        └─ includes: UC08         ║                                   ║
║            (Save to History)     ║  UC07: Auto-Refresh JWT Token    ║
║                                  ║  UC08: Save Prediction           ║
║  UC06: View Prediction History   ║                                   ║
║  UC09: Export History as PDF     ║                                   ║
║  UC10: Reset Password            ║                                   ║
║        └─ UC02: Verify OTP       ║                                   ║
║  UC11: Update Profile            ║                                   ║
╚══════════════════════════════════╩═══════════════════════════════════╝
```

---

## 5. SEQUENCE DIAGRAM — PEST DETECTION FLOW

```
FARMER   MOBILE APP    AXIOS    FLASK API   EfficientNet   DATABASE
  │          │           │          │             │              │
  │ tap      │           │          │             │              │
  │ Detect ──►           │          │             │              │
  │          │ pickImage │          │             │              │
  │          │──────────►│          │             │              │
  │   gallery│           │          │             │              │
  │ select ──►           │          │             │              │
  │          │ base64    │          │             │              │
  │          │ encode ───►          │             │              │
  │          │           │ POST     │             │              │
  │          │           │/pest-det─►             │              │
  │          │           │  {image} │ check JWT   │              │
  │          │           │          │─────────────────────────►  │
  │          │           │          │ decode B64  │              │
  │          │           │          │ PIL.open()  │              │
  │          │           │          │ resize 224²  │              │
  │          │           │          │ normalize    │              │
  │          │           │          │ expand_dims  │              │
  │          │           │          │─predict()───►              │
  │          │           │          │             │ forward pass  │
  │          │           │          │             │ softmax output│
  │          │           │          │◄─probabilities             │
  │          │           │          │ argmax →     │              │
  │          │           │          │ pest_name    │              │
  │          │           │          │ confidence   │              │
  │          │           │          │ risk_level   │              │
  │          │           │          │ pesticide    │              │
  │          │           │          │─────────────────────────►  │
  │          │           │          │             │  INSERT       │
  │          │           │          │             │ pest_detections│
  │          │           │◄─ JSON ──│             │              │
  │          │           │ {pest,   │             │              │
  │          │           │  conf,   │             │              │
  │          │           │  risk,   │             │              │
  │          │           │  meds}   │             │              │
  │          │ render    │          │             │              │
  │          │ results ──►          │             │              │
  │◄─────────│ display   │          │             │              │
  │  result  │           │          │             │              │
```

---

## 6. SEQUENCE DIAGRAM — AUTHENTICATION FLOW (JWT + OTP)

```
FARMER   MOBILE APP   AXIOS   FLASK API   bcrypt   DB   SMTP
  │          │          │         │           │      │     │
  │ Register │          │         │           │      │     │
  │─────────►│          │         │           │      │     │
  │          │─POST ────►         │           │      │     │
  │          │ /register │        │           │      │     │
  │          │           │        │─hash pw──►│      │     │
  │          │           │        │◄─hash─────│      │     │
  │          │           │        │─INSERT ──────────►     │
  │          │           │        │  users (unverified)    │
  │          │           │        │─INSERT ──────────►     │
  │          │           │        │  otp_codes             │
  │          │           │        │─send OTP ─────────────►│
  │          │           │◄─200───│           │      │     │
  │ check    │           │         │           │      │     │
  │ email   ─┐           │         │           │      │     │
  │ OTP code │           │         │           │      │     │
  │          │ enter OTP│         │           │      │     │
  │─────────►│          │         │           │      │     │
  │          │─POST ────►         │           │      │     │
  │          │ /verify-otp│       │           │      │     │
  │          │           │        │─SELECT ──────────►     │
  │          │           │        │ otp_codes              │
  │          │           │        │◄─OTP record───────     │
  │          │           │        │ check expiry           │
  │          │           │        │ check attempts         │
  │          │           │        │ verify code            │
  │          │           │        │─UPDATE users ────►     │
  │          │           │        │  (verified=true)       │
  │          │           │        │─UPDATE otp_codes──►    │
  │          │           │        │  (used=true)           │
  │          │           │        │─sign JWT              │
  │          │           │◄─JWT───│ access_token           │
  │          │           │  tokens│ refresh_token          │
  │          │ store     │        │           │      │     │
  │          │ tokens    │        │           │      │     │
  │◄─────────│ home screen        │           │      │     │
  │          │           │        │           │      │     │
  │ [later - API call]            │           │      │     │
  │          │─request ─►│        │           │      │     │
  │          │           │─API ───► (401 expired)   │     │
  │          │           │◄─401───│           │      │     │
  │          │ interceptor         │           │      │     │
  │          │─POST ────►          │           │      │     │
  │          │ /auth/refresh       │           │      │     │
  │          │           │         │─verify refresh token  │
  │          │           │◄─new ───│ sign new access token │
  │          │           │  token  │           │      │     │
  │          │─retry ───►│         │           │      │     │
  │          │ original  │         │           │      │     │
  │◄─────────│ response  │         │           │      │     │
```

---

## 7. CLASS DIAGRAM (BACKEND)

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND CLASS STRUCTURE                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐    ┌─────────────────┐
│  app.py          │     │  auth.py          │    │  database.py    │
│  (Flask App)     │     │  (Auth Service)   │    │  (DB Layer)     │
│─────────────────-│     │──────────────────│    │─────────────────│
│ app: Flask       │     │ SECRET_KEY: str   │    │ DB_PATH: str    │
│ _login_attempts  │────►│ ALGORITHM: str   │    │                 │
│ _login_lock      │     │─────────────────-│    │+ get_db_conn()  │
│─────────────────-│     │+ generate_tokens │    │+ init_db()      │
│+ health()        │     │  (user_id,email  │    └─────────────────┘
│+ login()         │     │   role) → dict   │             │
│+ register()      │     │+ verify_jwt      │             │
│+ verify_otp()    │     │  (token) → dict  │             │
│+ refresh()       │     │+ require_auth()  │      ┌──────▼────────┐
│+ predict()       │     │  decorator       │      │  Database     │
│+ pest_detect()   │     │+ require_admin() │      │  Tables       │
│+ history()       │     │  decorator       │      │───────────────│
│+ admin_users()   │     └──────────────────┘      │ users         │
│+ toggle_user()   │                               │ predictions   │
│+ admin_stats()   │     ┌──────────────────┐      │ pest_det.     │
└──────────────────┘     │ email_service.py  │      │ otp_codes     │
         │               │──────────────────│      │ admin_audit   │
         │               │ RESEND_LIMIT: 3  │      └───────────────┘
         ▼               │ RESEND_WINDOW:   │
┌──────────────────┐     │  1800            │
│  ML Models       │     │──────────────────│
│──────────────────│     │+ send_email()    │
│ pest_model: Model│     │+ can_resend_otp()│
│ rf_soil: Forest  │     │+ send_otp_email()│
│ rf_crop: Forest  │     └──────────────────┘
│──────────────────│
│+ load_pest_model │
│+ load_rf_models  │
│+ predict_soil()  │
│+ predict_crops() │
│+ detect_pest()   │
└──────────────────┘
```

---

## 8. CLASS DIAGRAM (MOBILE — KEY COMPONENTS)

```
┌─────────────────────────────────────────────────────────────────┐
│                   MOBILE CLASS STRUCTURE                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────────┐
│   config.js     │         │      api.js           │
│─────────────────│         │──────────────────────│
│ API_BASE_URL    │────────►│ axiosInstance         │
│ APP_VERSION     │         │  baseURL              │
│ APP_NAME        │         │  interceptors:        │
│ DEVELOPER_EMAIL │         │  • request: add JWT   │
└─────────────────┘         │  • response: 401      │
                            │    → auto refresh     │
                            │──────────────────────│
                            │+ post(url, data)      │
                            │+ get(url)             │
                            └──────────┬────────────┘
                                       │
          ┌────────────────────────────┼────────────────────────┐
          │                            │                         │
┌─────────▼─────────┐    ┌────────────▼────────┐   ┌──────────▼──────────┐
│  AuthContext.js   │    │  useApi.js (hooks)  │   │  AppNavigator.js    │
│───────────────────│    │─────────────────────│   │─────────────────────│
│ user: object|null │    │+ usePestDetect()    │   │ AuthStack           │
│ token: string     │    │+ useSoilPredict()   │   │  Login              │
│───────────────────│    │+ useHistory()       │   │  Register           │
│+ login(token,user)│    └─────────────────────┘   │  OtpVerification    │
│+ logout()         │                               │  ResetPassword      │
│+ isAuthenticated  │    ┌─────────────────────┐   │  PrivacyPolicy      │
└───────────────────┘    │  Screens            │   │  Terms              │
                         │─────────────────────│   │  Disclaimer         │
                         │ LoginScreen         │   │ AppTabs             │
                         │ RegisterScreen      │   │  HomeScreen         │
                         │ HomeScreen          │   │  PestDetectScreen   │
                         │ SoilAnalysisScreen  │   │  HistoryScreen      │
                         │ PestDetectScreen    │   │  ProfileStack       │
                         │ HistoryScreen       │   │    ProfileScreen    │
                         │ ProfileScreen       │   │    SettingsScreen   │
                         │ SettingsScreen      │   │    AboutScreen      │
                         │ AboutScreen         │   └─────────────────────┘
                         │ PrivacyPolicyScreen │
                         │ TermsScreen         │
                         │ DisclaimerScreen    │
                         └─────────────────────┘
```

---

## 9. DEPLOYMENT ARCHITECTURE DIAGRAM

```
╔══════════════════════════════════════════════════════════════════╗
║                   PRODUCTION DEPLOYMENT                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ┌────────────┐                                                  ║
║  │  FARMER    │  Android Device (API 24+)                        ║
║  │  DEVICE    │  KRISHX App v1.0                                 ║
║  └─────┬──────┘                                                  ║
║        │ HTTPS                                                    ║
║        ▼                                                          ║
║  ┌─────────────────────────────────────────────────────────┐    ║
║  │              GOOGLE CLOUD PLATFORM                      │    ║
║  │                                                          │    ║
║  │  ┌─────────────────────────────────────────────────┐   │    ║
║  │  │   Cloud Run (us-central1)                        │   │    ║
║  │  │                                                   │   │    ║
║  │  │   ┌─────────────┐  ┌─────────────┐              │   │    ║
║  │  │   │  Instance 1 │  │  Instance 2 │  (autoscale) │   │    ║
║  │  │   │  Flask +    │  │  Flask +    │  1–5 max     │   │    ║
║  │  │   │  Gunicorn   │  │  Gunicorn   │              │   │    ║
║  │  │   └──────┬──────┘  └──────┬──────┘              │   │    ║
║  │  │          └────────┬────────┘                     │   │    ║
║  │  └──────────────────-┼────────────────────────────--┘   │    ║
║  │                       │                                   │    ║
║  │    ┌──────────────────┼──────────────────────────┐       │    ║
║  │    │                  ▼                           │       │    ║
║  │    │  ┌─────────────────────────┐                │       │    ║
║  │    │  │  Cloud Storage Volume  │                │       │    ║
║  │    │  │  /data/krishx.db       │                │       │    ║
║  │    │  │  (SQLite persistence)  │                │       │    ║
║  │    │  └─────────────────────────┘                │       │    ║
║  │    │           OR (for scale)                     │       │    ║
║  │    │  ┌─────────────────────────┐                │       │    ║
║  │    │  │  Cloud SQL (PostgreSQL) │                │       │    ║
║  │    │  │  krishx-db instance    │                │       │    ║
║  │    │  │  db-f1-micro → n1-std  │                │       │    ║
║  │    │  └─────────────────────────┘                │       │    ║
║  │    │                                              │       │    ║
║  │    │  ┌─────────────────────────┐                │       │    ║
║  │    │  │  Container Registry    │                │       │    ║
║  │    │  │  gcr.io/krishx-prod/   │                │       │    ║
║  │    │  │  krishx-backend:v1.0   │                │       │    ║
║  │    │  └─────────────────────────┘                │       │    ║
║  │    └──────────────────────────────────────────────┘       │    ║
║  └─────────────────────────────────────────────────────────--┘    ║
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐   ║
║  │               EXTERNAL SERVICES                          │   ║
║  │   ┌──────────────────┐  ┌────────────────────────────┐  │   ║
║  │   │  Gmail SMTP      │  │  Expo EAS Build Service    │  │   ║
║  │   │  smtp.gmail.com  │  │  (APK/AAB generation)      │  │   ║
║  │   │  OTP delivery    │  │  expo.dev/accounts/...     │  │   ║
║  │   └──────────────────┘  └────────────────────────────┘  │   ║
║  │   ┌────────────────────────────────────────────────────┐ │   ║
║  │   │  Google Play Store                                 │ │   ║
║  │   │  (APK/AAB distribution to end users)               │ │   ║
║  │   └────────────────────────────────────────────────────┘ │   ║
║  └──────────────────────────────────────────────────────────┘   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 10. DATABASE ENTITY-RELATIONSHIP DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────┐
│                     KRISHX DATABASE SCHEMA (ER)                     │
└──────────────────────────────────────────────────────────────────────┘

┌────────────────────────────┐
│          USERS             │
│────────────────────────────│
│ PK  id: INTEGER            │
│     full_name: TEXT        │
│ UQ  email: TEXT            │
│     password_hash: TEXT    │
│     role: TEXT             │  ← 'farmer' | 'admin'
│     is_active: BOOLEAN     │
│     is_verified: BOOLEAN   │
│     created_at: TIMESTAMP  │
└────────────┬───────────────┘
             │ 1
             │
             │ has many
             │
     ┌───────▼──────┬───────────────────────┐
     │              │                       │
     │ N            │ N                     │ N
┌────▼──────────────┐ ┌─────────────────────┐ ┌──────────────────────┐
│  PREDICTIONS      │ │  PEST_DETECTIONS     │ │  OTP_CODES           │
│───────────────────│ │─────────────────────│ │──────────────────────│
│PK id: INTEGER     │ │PK id: INTEGER        │ │PK id: INTEGER        │
│FK user_id: INT    │ │FK user_id: INT       │ │FK user_id: INT       │
│   nitrogen: REAL  │ │   pest_name: TEXT    │ │   email: TEXT        │
│   phosphorous:REAL│ │   confidence: REAL   │ │   otp_code: TEXT     │
│   potassium: REAL │ │   risk_level: TEXT   │ │   type: TEXT         │
│   temperature:REAL│ │   pesticide: TEXT    │ │   expires_at: TS     │
│   humidity: REAL  │ │   organic_alt: TEXT  │ │   is_used: BOOLEAN   │
│   moisture: REAL  │ │   image_path: TEXT   │ │   attempts: INTEGER  │
│   soil_type: TEXT │ │   created_at: TS     │ │   created_at: TS     │
│   crop_recs: TEXT │ └─────────────────────┘ └──────────────────────┘
│   fertilizer:TEXT │
│   created_at: TS  │
└───────────────────┘

┌──────────────────────────────────────────────────────┐
│  ADMIN_AUDIT_LOG                                     │
│──────────────────────────────────────────────────────│
│PK id: INTEGER                                        │
│   admin_email: TEXT                                  │
│   action: TEXT      ← ACTIVATE_USER, VIEW_USER, etc. │
│   target_type: TEXT ← 'user', 'prediction', etc.     │
│   target_id: INTEGER                                 │
│   details: TEXT                                      │
│   created_at: TIMESTAMP                              │
└──────────────────────────────────────────────────────┘
```

---

## 11. SECURITY ARCHITECTURE DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────┐
│                    KRISHX SECURITY LAYERS                           │
└──────────────────────────────────────────────────────────────────────┘

  INCOMING REQUEST
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 1: TRANSPORT SECURITY                                        │
│  • HTTPS enforced (TLS 1.2+)                                        │
│  • Cloud Run: HTTPS-only by default                                 │
│  • App Engine: secure: always in app.yaml                           │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 2: CORS POLICY                                               │
│  • ALLOWED_ORIGINS env var controls permitted origins               │
│  • Production: restrict to specific domains                         │
│  • Development: * (all origins — DEV ONLY)                          │
│  • Prevents cross-site request forgery from unknown domains         │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 3: RATE LIMITING                                             │
│  • Login: 10 attempts per IP per 15 minutes                         │
│  • OTP resend: 3 per email per 30 minutes                           │
│  • OTP verify: 3 attempts per code                                  │
│  • Prevents brute-force and enumeration attacks                     │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 4: JWT AUTHENTICATION                                        │
│  • Protected endpoints require valid Bearer token                   │
│  • Access tokens: 24-hour expiry                                    │
│  • Refresh tokens: 30-day expiry, stored in database                │
│  • KRISHX_SECRET: HS256 signing (must be 32+ random chars)          │
│  • Admin endpoints: require role='admin' in token claims            │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 5: INPUT VALIDATION                                          │
│  • All inputs validated before processing                           │
│  • Numeric range checks for soil parameters                         │
│  • Email format validation                                          │
│  • Password strength requirements enforced                          │
│  • Image size/type validation for pest detection                    │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 6: PASSWORD SECURITY                                         │
│  • bcrypt with cost factor 12                                       │
│  • Passwords never stored in plain text                             │
│  • Account enumeration prevention:                                  │
│    same response whether email exists or not                        │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 7: RESPONSE SECURITY HEADERS (@after_request)               │
│  • X-Content-Type-Options: nosniff                                  │
│  • X-Frame-Options: DENY                                            │
│  • X-XSS-Protection: 1; mode=block                                  │
│  • Referrer-Policy: strict-origin-when-cross-origin                 │
│  • Cache-Control: no-store (API responses)                          │
└─────────────────────────────────────────────────────────────────────┘
       │
       ▼
  RESPONSE RETURNED
```

---

## 12. AI MODEL PIPELINE DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────┐
│                    AI INFERENCE PIPELINE                             │
└──────────────────────────────────────────────────────────────────────┘

PEST DETECTION PIPELINE:
━━━━━━━━━━━━━━━━━━━━━━━

  Raw Image                Processing               Inference
  (JPEG/PNG)         ──────────────────────►    EfficientNetB4
  base64 string       1. base64 decode             18.7M params
                      2. PIL.Image.open()          Pre-trained
  ┌─────────────┐     3. resize → 224×224          on ImageNet
  │  Any photo  │     4. normalize [0,1]           Fine-tuned on
  │  from phone │────►5. expand_dims(0)    ──────► 5,494 pest images
  └─────────────┘        batch(1,224,224,3)         ↓
                                                12-class softmax
                                                     ↓
                                             argmax → pest_idx
                                             confidence %
                                                     ↓
                                             PEST_CLASSES dict
                                                     ↓
                                             ┌──────────────┐
                                             │ pest_name    │
                                             │ confidence   │
                                             │ risk_level   │
                                             │ pesticide    │
                                             │ organic_alt  │
                                             └──────────────┘

SOIL/CROP RECOMMENDATION PIPELINE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  6 Numeric Params        Processing              Inference
  N, P, K,          ───────────────────────►   RandomForest
  Temperature,        1. Validate ranges          100 trees
  Humidity,           2. Feature array:           Gini criterion
  Moisture            [N,P,K,T,H,M]              Full depth
                       ↓                           ↓
                  load_model():               predict_proba()
                  check CSV MD5                top-5 classes
                  load pkl cache              confidence %
                  (< 100ms warm)                   ↓
                                             ┌──────────────┐
                                             │ soil_type    │
                                             │ crop_recs[5] │
                                             │ confidence[] │
                                             └──────────────┘
                                                     ↓
                                         NPK distance matching
                                                     ↓
                                             ┌──────────────┐
                                             │ fertilizer   │
                                             │ product name │
                                             │ application  │
                                             │ guidance     │
                                             └──────────────┘
```

---

*System Architecture Document v1.0 | KRISHX Agriculture | 2025*
