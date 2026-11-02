# KRISHX Agriculture — Deployment Guide

**Version 1.0 | Full Stack Deployment Reference**

---

## TABLE OF CONTENTS

1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Backend Docker Build](#3-backend-docker-build)
4. [GCP Cloud Run Deployment](#4-gcp-cloud-run-deployment)
5. [GCP App Engine Deployment](#5-gcp-app-engine-deployment)
6. [PostgreSQL Migration (Cloud SQL)](#6-postgresql-migration-cloud-sql)
7. [Mobile App Configuration](#7-mobile-app-configuration)
8. [EAS Build — APK & AAB Generation](#8-eas-build--apk--aab-generation)
9. [Environment Variables Reference](#9-environment-variables-reference)
10. [Health Checks & Verification](#10-health-checks--verification)
11. [Rollback Procedures](#11-rollback-procedures)
12. [Cost Estimation](#12-cost-estimation)

---

## 1. PREREQUISITES

### Local Machine Requirements

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | [python.org](https://python.org) |
| Node.js | 18+ LTS | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Included with Node.js |
| Docker | 20+ | [docker.com](https://docker.com) |
| Google Cloud CLI | Latest | `curl https://sdk.cloud.google.com | bash` |
| EAS CLI | Latest | `npm install -g eas-cli` |
| Git | Any | [git-scm.com](https://git-scm.com) |

### Accounts Required

- **Google Cloud Platform** account with billing enabled
- **Expo** account (free) — for EAS builds
- **Gmail** account — for SMTP email delivery (or any SMTP provider)
- **Google Play Console** account (USD 25 one-time) — for Play Store publishing

### File Structure Overview

```
AI_AGRI-master/
├── backend/                 ← Flask Python backend
│   ├── app.py
│   ├── auth.py
│   ├── database.py
│   ├── email_service.py
│   ├── Dockerfile           ← Docker container definition
│   ├── app.yaml             ← GCP App Engine config
│   ├── gunicorn.conf.py     ← Production WSGI config
│   ├── requirements.txt     ← Development dependencies
│   ├── requirements-prod.txt← Production dependencies
│   ├── .env.example         ← Environment variables template
│   ├── migrate_to_postgres.py
│   └── pest_model/
│       └── krishx_pest_model.h5
├── mobile/                  ← React Native Expo app
│   ├── app.json             ← Expo configuration
│   ├── eas.json             ← EAS build profiles
│   ├── src/
│   │   ├── config.js        ← API URL configuration
│   │   └── services/api.js
│   └── package.json
└── docs/                    ← Documentation
```

---

## 2. LOCAL DEVELOPMENT SETUP

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/AI_AGRI-master.git
cd AI_AGRI-master
```

### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your values (see Section 9)
```

**Configure minimum required environment variables in `.env`:**

```env
FLASK_ENV=development
KRISHX_SECRET=dev-secret-change-in-production-minimum-32-chars
DB_PATH=./krishx.db
# Leave SMTP_USER blank to use DEV_MODE (OTPs print to console)
```

### Step 3: Initialize the Database

```bash
# This creates krishx.db and seeds it with sample data
python seed_db.py

# Expected output:
# Database initialized successfully.
# Admin account created: admin@krishx.com
# Sample farmer accounts created.
```

### Step 4: Verify ML Models are Present

```bash
# Check EfficientNetB4 model
ls -lh pest_model/krishx_pest_model.h5
# Expected: approximately 75MB

# Check crop recommendation data
ls -lh crop_recommendation.csv
# Expected: approximately 2.3MB
```

If model files are missing, they must be obtained from the project repository or retrained using the training scripts.

### Step 5: Start the Backend

```bash
python app.py

# Expected output:
# * Running on http://0.0.0.0:5000
# * Debug mode: on
```

### Step 6: Mobile App Setup

```bash
# In a new terminal, navigate to mobile directory
cd mobile

# Install Node.js dependencies
npm install

# Start Expo development server
npx expo start
```

### Step 7: Test on Android Emulator or Device

**Android Emulator:**
- In Android Studio, start an AVD (Android Virtual Device)
- Press `a` in the Expo terminal to open on Android emulator

**Physical Device:**
- Install Expo Go from Play Store on your Android device
- Scan the QR code shown in the Expo terminal

**Verify Connection:**
The mobile app uses `http://10.0.2.2:5000` when in development mode to reach the backend running on your host machine from the Android emulator.

### Step 8: Verify Full Stack

1. Register a new user in the app
2. Check Flask console for OTP (DEV_MODE if SMTP not configured)
3. Enter OTP → login
4. Run a soil analysis: N=90, P=42, K=43, Temp=20, Humidity=82, Moisture=42
5. Confirm results appear → setup is working

---

## 3. BACKEND DOCKER BUILD

### Build the Docker Image

```bash
cd backend

# Build image
docker build -t krishx-backend:latest .

# Expected build time: 3–5 minutes
# Expected image size: approximately 2.1 GB (TensorFlow included)
```

### Run Locally in Docker

```bash
docker run -p 8080:8080 \
  -e FLASK_ENV=production \
  -e KRISHX_SECRET=your-secret-key-here \
  -e SMTP_USER=your-email@gmail.com \
  -e SMTP_PASS=your-app-password \
  -v $(pwd)/data:/data \
  krishx-backend:latest
```

### Test Docker Container

```bash
# Health check
curl http://localhost:8080/health

# Test login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@krishx.com","password":"Admin@123"}'
```

### Multi-Stage Build Details

The Dockerfile uses a two-stage build:

1. **Builder stage**: Installs Python packages (including compile-time deps)
2. **Runtime stage**: Copies only needed files — reduces final image size

Key Dockerfile features:
- Non-root user (`appuser`) for security
- `/data` directory for SQLite persistence via volume mount
- `DB_PATH=/data/krishx.db` pre-configured
- Headless OpenCV (`opencv-python-headless`) to avoid GUI dependencies

---

## 4. GCP CLOUD RUN DEPLOYMENT

Cloud Run is the recommended deployment method — serverless, auto-scaling, and cost-efficient.

### Step 1: Set Up GCP Project

```bash
# Login to GCP
gcloud auth login

# Create new project (or use existing)
gcloud projects create krishx-production --name="KRISHX Production"
gcloud config set project krishx-production

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Step 2: Build and Push Container to GCR

```bash
cd backend

# Configure Docker to use GCR
gcloud auth configure-docker

# Build and tag for GCR
docker build -t gcr.io/krishx-production/krishx-backend:v1.0 .

# Push to Container Registry
docker push gcr.io/krishx-production/krishx-backend:v1.0
```

### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy krishx-backend \
  --image=gcr.io/krishx-production/krishx-backend:v1.0 \
  --platform=managed \
  --region=us-central1 \
  --memory=2Gi \
  --cpu=1 \
  --timeout=120 \
  --concurrency=10 \
  --min-instances=1 \
  --max-instances=5 \
  --port=8080 \
  --allow-unauthenticated \
  --set-env-vars="FLASK_ENV=production" \
  --set-env-vars="KRISHX_SECRET=YOUR_32_CHAR_SECRET_HERE" \
  --set-env-vars="SMTP_USER=noreply@yourorg.com" \
  --set-env-vars="SMTP_PASS=your_gmail_app_password" \
  --set-env-vars="ALLOWED_ORIGINS=https://your-domain.com"
```

### Step 4: Mount Persistent Storage (SQLite)

Cloud Run containers are stateless — use a volume for SQLite persistence:

```bash
# Create a Cloud Storage bucket for the database
gsutil mb gs://krishx-db-storage

# Add volume mount to Cloud Run service
gcloud run services update krishx-backend \
  --add-volume=name=db-storage,type=cloud-storage,bucket=krishx-db-storage \
  --add-volume-mount=volume=db-storage,mount-path=/data \
  --set-env-vars="DB_PATH=/data/krishx.db"
```

### Step 5: Get the Deployment URL

```bash
gcloud run services describe krishx-backend \
  --platform=managed \
  --region=us-central1 \
  --format='value(status.url)'

# Output: https://krishx-backend-xxxx-uc.a.run.app
```

### Step 6: Update Mobile App API URL

Edit `mobile/src/config.js`:

```js
const PRODUCTION_API_URL = 'https://krishx-backend-xxxx-uc.a.run.app';
```

### Subsequent Deployments

For future code updates:

```bash
# Build new image with version tag
docker build -t gcr.io/krishx-production/krishx-backend:v1.1 .
docker push gcr.io/krishx-production/krishx-backend:v1.1

# Deploy new version
gcloud run deploy krishx-backend \
  --image=gcr.io/krishx-production/krishx-backend:v1.1 \
  --region=us-central1
```

Cloud Run performs zero-downtime rolling deployment automatically.

---

## 5. GCP APP ENGINE DEPLOYMENT

App Engine is an alternative to Cloud Run with built-in HTTPS and custom domain support.

### Step 1: Verify app.yaml

The `backend/app.yaml` is pre-configured:

```yaml
runtime: python311
env: standard
entrypoint: gunicorn --config gunicorn.conf.py app:app

instance_class: F2
automatic_scaling:
  min_instances: 1
  max_instances: 5
  target_cpu_utilization: 0.6

env_variables:
  FLASK_ENV: "production"
  # Set sensitive vars via Secret Manager (see below)
```

### Step 2: Configure Secret Manager for Sensitive Vars

```bash
# Enable Secret Manager
gcloud services enable secretmanager.googleapis.com

# Create secrets
echo -n "your-secret-key" | gcloud secrets create KRISHX_SECRET --data-file=-
echo -n "noreply@email.com" | gcloud secrets create SMTP_USER --data-file=-
echo -n "your-app-password" | gcloud secrets create SMTP_PASS --data-file=-
```

### Step 3: Deploy

```bash
cd backend
gcloud app deploy app.yaml --project=krishx-production
```

### Step 4: View Deployed URL

```bash
gcloud app browse
# Opens: https://krishx-production.appspot.com
```

---

## 6. POSTGRESQL MIGRATION (CLOUD SQL)

### Step 1: Create Cloud SQL PostgreSQL Instance

```bash
# Create PostgreSQL 15 instance
gcloud sql instances create krishx-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=secure-root-password

# Create application database
gcloud sql databases create krishx --instance=krishx-db

# Create application user
gcloud sql users create krishx_user \
  --instance=krishx-db \
  --password=secure-user-password
```

### Step 2: Get Connection Details

```bash
# Get Cloud SQL connection name
gcloud sql instances describe krishx-db --format='value(connectionName)'
# Output: krishx-production:us-central1:krishx-db
```

### Step 3: Run Migration Script

```bash
cd backend

# Set environment variables
export SQLITE_PATH=krishx.db
export DATABASE_URL="postgresql://krishx_user:secure-user-password@localhost/krishx"

# Use Cloud SQL Auth Proxy for local connection
cloud-sql-proxy krishx-production:us-central1:krishx-db &

# Run migration
python migrate_to_postgres.py
```

Expected output:
```
Connecting to SQLite: krishx.db
Connecting to PostgreSQL: postgresql://...
Creating PostgreSQL schema...
Migrating users... 1247 rows
Migrating predictions... 8432 rows
Migrating pest_detections... 3891 rows
Migrating otp_codes... 156 rows (unexpired only)
Migrating admin_audit_log... 89 rows
Resetting sequences...
Migration complete. Verifying counts...
  users: 1247 ✅
  predictions: 8432 ✅
  pest_detections: 3891 ✅
Migration successful!
```

### Step 4: Update Backend to Use PostgreSQL

```bash
# Update Cloud Run environment variables
gcloud run services update krishx-backend \
  --set-env-vars="DATABASE_URL=postgresql://krishx_user:password@/krishx?host=/cloudsql/krishx-production:us-central1:krishx-db" \
  --add-cloudsql-instances=krishx-production:us-central1:krishx-db \
  --region=us-central1
```

### Step 5: Verify PostgreSQL Connection

```bash
# Test database connection
curl https://krishx-backend-xxxx-uc.a.run.app/health

# Expected: {"status": "healthy", "db": "postgresql"}
```

---

## 7. MOBILE APP CONFIGURATION

### Update Production API URL

Edit `mobile/src/config.js`:

```js
// Replace with your actual Cloud Run or App Engine URL
const PRODUCTION_API_URL = 'https://krishx-backend-xxxx-uc.a.run.app';
```

### Verify Environment-Aware Switching

The config already handles environment switching:

```js
// Automatically uses the correct URL based on build type
export const API_BASE_URL = __DEV__ ? DEV_ANDROID_EMULATOR : PRODUCTION_API_URL;
// Development: http://10.0.2.2:5000
// Production:  https://your-cloud-run-url
```

### Update app.json for Production

Edit `mobile/app.json`:

```json
{
  "expo": {
    "name": "KRISHX Agriculture",
    "slug": "krishx-agriculture",
    "version": "1.0.0",
    "extra": {
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID_HERE"
      }
    }
  }
}
```

Get your EAS project ID after running `eas build:configure` (see Section 8).

---

## 8. EAS BUILD — APK & AAB GENERATION

EAS (Expo Application Services) builds production Android packages in the cloud.

### Step 1: Install EAS CLI and Login

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login
# Enter your Expo username and password
```

### Step 2: Configure EAS Project

```bash
cd mobile

# Initialize EAS for this project
eas build:configure

# This will:
# 1. Ask for your Expo project name
# 2. Create/update eas.json
# 3. Add projectId to app.json
```

### Step 3: Verify eas.json Configuration

The `mobile/eas.json` should contain:

```json
{
  "cli": {
    "version": ">= 5.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease",
        "channel": "preview",
        "env": {
          "APP_ENV": "staging"
        }
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease",
        "channel": "production",
        "env": {
          "APP_ENV": "production"
        }
      }
    }
  }
}
```

### Step 4: Build APK (for testing and direct distribution)

```bash
cd mobile

# Build APK using preview profile
eas build --platform android --profile preview

# Follow the prompts:
# - "Generate a new Android Keystore?" → Yes (first time)
# - EAS stores the keystore securely in their cloud

# Wait for build to complete (typically 10–20 minutes)
# Download APK from the URL provided
```

**APK is suitable for:**
- Direct installation on test devices
- Distribution to pilot users
- NGO/government deployment via direct download

### Step 5: Build AAB (for Google Play Store)

```bash
# Build Android App Bundle using production profile
eas build --platform android --profile production

# Wait for build to complete
# Download .aab file from the URL provided
```

**AAB is required for:**
- Google Play Store submission
- Play Store optimization (dynamic delivery)

### Step 6: Check Build Status

```bash
# View recent builds
eas build:list

# View specific build
eas build:view <BUILD_ID>
```

### Step 7: Submit to Google Play Store

```bash
# Configure Play Store submission (first time)
# Requires google-services-account.json from Google Play Console

eas submit --platform android --profile production
# Or manually upload the .aab in Google Play Console
```

### Keystore Management

EAS securely stores your Android signing keystore. **Never lose access to your Expo account** — it holds your production keystore.

To download your keystore for backup:
```bash
eas credentials
# Select: Android → Keystore → Download
```

Store the downloaded keystore file and password in a secure location (e.g., encrypted password manager or secure cloud storage).

---

## 9. ENVIRONMENT VARIABLES REFERENCE

### Complete Variable List

| Variable | Required | Default | Description |
|----------|---------|---------|-------------|
| `KRISHX_SECRET` | **YES** | *(insecure default)* | JWT signing key. MUST be 32+ random chars in production |
| `FLASK_ENV` | Yes | `development` | `production` or `development` |
| `DB_PATH` | Recommended | `./krishx.db` | Full path to SQLite database file |
| `DATABASE_URL` | For PostgreSQL | None | PostgreSQL connection string |
| `SMTP_HOST` | Yes (for email) | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | Yes (for email) | `587` | SMTP server port |
| `SMTP_USER` | Yes (for email) | None | SMTP username / email address |
| `SMTP_PASS` | Yes (for email) | None | SMTP password or App Password |
| `SMTP_FROM` | Recommended | `SMTP_USER` value | Display name for outgoing emails |
| `ALLOWED_ORIGINS` | Recommended | `*` (all) | Comma-separated CORS allowed origins |
| `PORT` | For Cloud Run | `5000` | Port for Gunicorn to bind |
| `WORKERS` | Optional | `1` | Gunicorn worker count |
| `THREADS` | Optional | `4` | Threads per Gunicorn worker |

### Generating Secrets

```bash
# Generate a secure KRISHX_SECRET
python3 -c "import secrets; print(secrets.token_hex(32))"
# Example output: 3d65a1e8b9c2f4a7d8e5b3c1a9f2e7d4b6c8a1e3d5f7b9c2e4a6d8f0b2c4e6a8
```

### .env File Template

```env
# KRISHX Backend Configuration
# Copy this file to .env and fill in your values

FLASK_ENV=production
PORT=8080

# SECURITY — REQUIRED: Change this to a random 32+ character string
KRISHX_SECRET=REPLACE_WITH_RANDOM_32_CHAR_SECRET

# DATABASE
DB_PATH=/data/krishx.db
# For PostgreSQL (optional):
# DATABASE_URL=postgresql://user:password@host:5432/krishx_db

# EMAIL (SMTP) — Required for OTP email delivery
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourorganisation.com
SMTP_PASS=your-16-char-gmail-app-password
SMTP_FROM=KRISHX Agriculture

# SECURITY — CORS
# Comma-separated list of allowed origins. Use * for development only.
ALLOWED_ORIGINS=https://api.krishx.com

# PERFORMANCE
WORKERS=1
THREADS=4
```

---

## 10. HEALTH CHECKS & VERIFICATION

### Backend Health Check

```bash
# Basic health check
curl https://your-backend-url/health
# Expected: {"status": "healthy", "timestamp": "..."}

# Check with detailed response
curl -v https://your-backend-url/health
# Verify security headers are present:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

### Test Authentication Flow

```bash
# Register a test user
curl -X POST https://your-backend-url/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"Test@123"}'

# Expected: {"message": "OTP sent to email"}

# Login (after OTP verification)
curl -X POST https://your-backend-url/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@krishx.com","password":"YourAdminPassword"}'

# Expected: {"access_token": "...", "refresh_token": "..."}
```

### Test AI Endpoints

```bash
# Set your token (from login response)
TOKEN="your_access_token_here"

# Test soil prediction
curl -X POST https://your-backend-url/predict \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"N":90,"P":42,"K":43,"temperature":20.88,"humidity":82,"moisture":42}'

# Expected: soil type + crop recommendations

# Test pest detection (requires a base64-encoded image)
# Use a small test image for this check
```

### Verify Rate Limiting

```bash
# Test login rate limiting (should block after 10 attempts)
for i in {1..11}; do
  curl -X POST https://your-backend-url/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -s | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Attempt $i: {d.get(\"error\",\"ok\")}')"
done
# Attempt 11 should return: "Too many login attempts..."
```

### Mobile App Verification Checklist

After deploying and updating the API URL:

- [ ] App opens without crash
- [ ] Registration sends OTP email successfully
- [ ] OTP verification works
- [ ] Login succeeds and home screen loads
- [ ] Soil analysis returns results within 2 seconds
- [ ] Pest detection processes a photo within 5 seconds
- [ ] History loads correctly
- [ ] PDF export works
- [ ] Settings links navigate correctly (Privacy Policy, Terms, About)

---

## 11. ROLLBACK PROCEDURES

### Cloud Run Rollback

Cloud Run keeps previous revisions. Roll back instantly:

```bash
# List all revisions
gcloud run revisions list --service=krishx-backend --region=us-central1

# Roll back to previous revision
gcloud run services update-traffic krishx-backend \
  --to-revisions=krishx-backend-PREVIOUS_REVISION=100 \
  --region=us-central1
```

### App Engine Rollback

```bash
# List deployed versions
gcloud app versions list

# Roll back to previous version
gcloud app services set-traffic default \
  --splits PREVIOUS_VERSION=1 \
  --region=us-central1
```

### Database Rollback

If a migration fails or causes issues:

```bash
# SQLite: Restore from backup
cp backup/krishx_backup_YYYYMMDD.db krishx.db

# PostgreSQL: Restore from Cloud SQL backup
gcloud sql backups restore BACKUP_ID \
  --restore-instance=krishx-db
```

---

## 12. COST ESTIMATION

### Monthly Costs (Approximate)

#### Development / Startup Phase (< 1,000 users)

| Service | Configuration | Monthly Cost |
|---------|-------------|-------------|
| Cloud Run | 1 instance, 2GB RAM | ~USD 30 |
| Cloud Storage (SQLite) | 1GB | ~USD 0.05 |
| Cloud Build | 10 builds/month | Free tier |
| Egress | ~5GB | ~USD 0.60 |
| **Total** | | **~USD 31/month** |

#### Growth Phase (1,000–10,000 users)

| Service | Configuration | Monthly Cost |
|---------|-------------|-------------|
| Cloud Run | Autoscale 1–3 instances | ~USD 80 |
| Cloud SQL (PostgreSQL) | db-f1-micro | ~USD 25 |
| Cloud Storage (assets) | 10GB | ~USD 0.25 |
| Egress | ~50GB | ~USD 6 |
| **Total** | | **~USD 115/month** |

#### Scale Phase (10,000–100,000 users)

| Service | Configuration | Monthly Cost |
|---------|-------------|-------------|
| Cloud Run | Autoscale 1–10 instances | ~USD 250 |
| Cloud SQL (PostgreSQL) | db-n1-standard-2 | ~USD 90 |
| CDN (Cloud Armor) | Static assets | ~USD 20 |
| Redis (Memorystore) | 1GB cache | ~USD 35 |
| Egress | ~500GB | ~USD 60 |
| **Total** | | **~USD 455/month** |

### EAS Build Costs

| Plan | Builds/Month | Concurrent | Cost |
|------|------------|-----------|------|
| Free | 30 | 1 | USD 0 |
| Production | Unlimited | 3 | USD 29/month |

For a startup, the free tier (30 builds/month) is sufficient.

---

## APPENDIX A: QUICK DEPLOYMENT CHECKLIST

### Backend Deployment (Cloud Run)

- [ ] Docker image builds without errors
- [ ] Image pushed to GCR
- [ ] `KRISHX_SECRET` set to a random 32+ char string
- [ ] `FLASK_ENV` set to `production`
- [ ] SMTP credentials configured and tested
- [ ] `ALLOWED_ORIGINS` set to actual production domain
- [ ] Volume mount for SQLite OR PostgreSQL configured
- [ ] Health check endpoint returns 200
- [ ] Security headers present in responses
- [ ] Rate limiting tested

### Mobile App (EAS Build)

- [ ] Production API URL set in `mobile/src/config.js`
- [ ] `mobile/app.json` version updated
- [ ] EAS project ID set in `app.json`
- [ ] EAS build completes without errors
- [ ] APK installed and tested on physical device
- [ ] All screens navigate correctly
- [ ] Soil analysis returns results
- [ ] Pest detection processes images
- [ ] OTP email delivery works
- [ ] PDF export works on device

### Google Play Store (AAB submission)

- [ ] AAB built with `production` profile
- [ ] App signing configured in Play Console
- [ ] Store listing filled (description, screenshots, category)
- [ ] Privacy policy URL added to Play Console
- [ ] Target audience and content rating configured
- [ ] Internal testing track reviewed
- [ ] Production release submitted for review

---

## APPENDIX B: USEFUL COMMANDS REFERENCE

```bash
# Backend: Start development server
cd backend && python app.py

# Backend: Start with Gunicorn (production-like)
cd backend && gunicorn --config gunicorn.conf.py app:app

# Backend: Run in Docker locally
docker run -p 8080:8080 -e FLASK_ENV=development krishx-backend:latest

# Mobile: Start Expo dev server
cd mobile && npx expo start

# Mobile: Clear Expo cache
cd mobile && npx expo start --clear

# EAS: Build APK
cd mobile && eas build --platform android --profile preview

# EAS: Build AAB for Play Store
cd mobile && eas build --platform android --profile production

# EAS: Check build status
eas build:list

# GCP: View Cloud Run logs
gcloud run services logs read krishx-backend --region=us-central1

# GCP: Check Cloud Run service status
gcloud run services describe krishx-backend --region=us-central1

# GCP: Update environment variable
gcloud run services update krishx-backend \
  --set-env-vars="KEY=VALUE" --region=us-central1

# Database: SQLite integrity check
sqlite3 krishx.db "PRAGMA integrity_check;"

# Database: Backup SQLite
cp krishx.db backup/krishx_$(date +%Y%m%d_%H%M%S).db
```

---

*KRISHX Deployment Guide v1.0 | 2025 | © KRISHX Agriculture*
