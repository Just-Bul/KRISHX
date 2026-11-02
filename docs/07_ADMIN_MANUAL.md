# KRISHX Agriculture — Admin Manual

**Version 1.0 | Administrator Reference Guide**

---

## TABLE OF CONTENTS

1. [Admin Overview](#1-admin-overview)
2. [Admin Account Setup](#2-admin-account-setup)
3. [Admin Login](#3-admin-login)
4. [Dashboard Overview](#4-dashboard-overview)
5. [User Management](#5-user-management)
6. [Prediction Management](#6-prediction-management)
7. [Pest Detection Logs](#7-pest-detection-logs)
8. [Analytics & Reporting](#8-analytics--reporting)
9. [Database Operations](#9-database-operations)
10. [Security & Audit Log](#10-security--audit-log)
11. [Environment Configuration](#11-environment-configuration)
12. [API Administration](#12-api-administration)
13. [Troubleshooting](#13-troubleshooting)
14. [Emergency Procedures](#14-emergency-procedures)

---

## 1. ADMIN OVERVIEW

### Role-Based Access Control

KRISHX has two user roles:

| Role | Permissions |
|------|-----------|
| `farmer` | Register, login, use all AI modules, view own history, export PDF |
| `admin` | All farmer permissions + user management, prediction logs, analytics, system monitoring |

### Admin Capabilities Summary

An admin can:
- View all registered users and their activity
- Activate or deactivate user accounts
- View all soil analysis and pest detection predictions
- Monitor system usage patterns
- Access the admin audit log
- Cannot delete users (only deactivate — audit trail preservation)

### Admin Panel Access

Admin accounts see an **"Admin Panel"** button on their Profile screen, in addition to all standard farmer features.

---

## 2. ADMIN ACCOUNT SETUP

### Creating the First Admin Account

Admin accounts must be created directly in the database — there is no self-registration path for admins (by design, for security).

**Using the KRISHX Admin Seeder Script:**

```bash
# Navigate to backend directory
cd backend

# Run the database seeder (creates admin + sample data)
python seed_db.py
```

This creates the default admin account:
- **Email:** admin@krishx.com
- **Password:** Admin@123
- **Role:** admin

> ⚠️ **CRITICAL SECURITY ACTION**: Change the admin password immediately after first login. The default password is for initial setup only. See [Section 11](#11-environment-configuration) for production security requirements.

### Creating Additional Admin Accounts

To create additional admin accounts, use the Flask shell or a database management tool:

```python
# In Flask shell: cd backend && python -c "..."
from database import get_db_connection
import bcrypt

conn = get_db_connection()

password = 'YourSecurePassword@2025'
password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

conn.execute(
    """INSERT INTO users (full_name, email, password_hash, role, is_active, is_verified)
       VALUES (?, ?, ?, 'admin', 1, 1)""",
    ('New Admin Name', 'newadmin@krishx.com', password_hash)
)
conn.commit()
conn.close()
print("Admin account created successfully.")
```

### Admin Account Requirements

- Admin accounts should use organisational email addresses (not personal)
- Password must meet the same requirements as regular user accounts
- Minimum 2 admin accounts recommended (in case one is locked out)
- Admin accounts should have MFA enabled when the feature is added in v2.0

---

## 3. ADMIN LOGIN

### Steps

1. Open the KRISHX app on your Android device
2. Enter the admin email address
3. Enter the admin password
4. Tap **"Login"**

### Admin Indicators

After logging in as admin, you will notice:
- The **Profile screen** shows **"Admin"** badge next to your name
- An **"Admin Panel"** button appears on the Profile screen
- Your account shows **role: admin** in profile details

### Admin Panel Navigation

From Profile → tap **"Admin Panel"** to access:
- Users Management
- Predictions Log
- Pest Detections Log
- Analytics Dashboard

---

## 4. DASHBOARD OVERVIEW

The Admin Dashboard shows key system statistics at a glance.

### Dashboard Metrics

```
┌────────────────────────────────────────────────────┐
│  KRISHX Admin Dashboard                            │
├─────────────┬──────────────┬──────────────────────┤
│  👥 Users   │ 🌱 Analyses  │ 🔬 Pest Detections   │
│    1,247    │    8,432     │       3,891          │
│  Total Reg. │  Total Pred. │  Total Detections    │
├─────────────┴──────────────┴──────────────────────┤
│  📈 Activity (Last 7 Days)                        │
│  Mon ████████ 142                                  │
│  Tue ██████   98                                   │
│  Wed █████████ 167                                 │
│  Thu ████████████ 203                              │
│  Fri ███████  124                                  │
│  Sat ████     67                                   │
│  Sun ███      54                                   │
└────────────────────────────────────────────────────┘
```

### Key Metrics Explained

| Metric | Description |
|--------|-------------|
| Total Users | All registered accounts (active + inactive) |
| Active Users (7d) | Users who made at least one prediction in 7 days |
| Total Soil Analyses | Cumulative soil/crop prediction count |
| Total Pest Detections | Cumulative pest detection count |
| New Registrations (30d) | Accounts created in last 30 days |

---

## 5. USER MANAGEMENT

### Accessing User Management

Admin Panel → **"Users"**

### User List View

```
┌────────────────────────────────────────────────────┐
│  Users Management                    [Search____]  │
│  All · Active · Inactive                           │
├────┬───────────────────┬────────────┬──────────────┤
│ ID │ Name              │ Email      │ Status       │
├────┼───────────────────┼────────────┼──────────────┤
│  1 │ Md. Rakibul Islam │ admin@...  │ 🟢 Active    │
│  2 │ Farmer Ahmed      │ ahmed@...  │ 🟢 Active    │
│  3 │ Farmer Sumaiya    │ suma@...   │ 🔴 Inactive  │
│  4 │ Demo Farmer       │ demo@...   │ 🟢 Active    │
└────┴───────────────────┴────────────┴──────────────┘
```

### Searching Users

- Use the **Search box** to filter by name or email
- Use the **filter tabs** (All / Active / Inactive) to narrow results

### Viewing a User's Details

Tap any user row to open their profile:

```
┌────────────────────────────────────────┐
│  User Profile                    [✎]  │
│  Name: Farmer Ahmed                   │
│  Email: ahmed@example.com            │
│  Role: farmer                         │
│  Status: 🟢 Active                    │
│  Registered: 2025-03-15              │
│  Last Login: 2025-06-14              │
│  Email Verified: ✅ Yes               │
│                                        │
│  Activity:                            │
│  Soil Analyses: 47                    │
│  Pest Detections: 23                  │
│  Total Predictions: 70               │
│                                        │
│  [DEACTIVATE ACCOUNT]                │
└────────────────────────────────────────┘
```

### Activating / Deactivating Accounts

**To deactivate a user account:**
1. Open the user's profile
2. Tap **"Deactivate Account"**
3. Confirm the action
4. The user will immediately be unable to log in

**To reactivate a deactivated account:**
1. Find the user (filter by Inactive)
2. Open their profile
3. Tap **"Activate Account"**

**When to deactivate accounts:**
- Suspected abuse or spam activity
- User request for account suspension
- Multiple policy violations
- Accounts that appear to be bots

> **Note:** Accounts are deactivated, never deleted. This preserves the audit trail and prediction history. A deactivated user sees "Your account has been deactivated. Please contact support." on login.

### User Data Privacy

Admins can view:
- Name, email, registration date, last login
- Total prediction counts
- Account status and role

Admins **cannot** view:
- User passwords (stored as bcrypt hashes — unreadable)
- Individual prediction details from the user list (must navigate to Predictions section)

### Admin Audit Log for User Actions

Every admin action on a user account is logged automatically:

```
2025-06-14 09:23:41 | admin@krishx.com | DEACTIVATE_USER | user_id=47
2025-06-14 09:25:12 | admin@krishx.com | ACTIVATE_USER   | user_id=47
```

---

## 6. PREDICTION MANAGEMENT

### Accessing Prediction Logs

Admin Panel → **"Predictions"**

### Prediction Log View

```
┌────────────────────────────────────────────────────┐
│  Soil Analysis Predictions        [Filter] [Export]│
├────┬───────────────┬──────────────┬────────────────┤
│ ID │ User          │ Result       │ Date           │
├────┼───────────────┼──────────────┼────────────────┤
│892 │ Ahmed (id:2)  │ Clay → Rice  │ 2025-06-14     │
│891 │ Sumaiya(id:3) │ Loam → Wheat │ 2025-06-14     │
│890 │ Ahmed (id:2)  │ Sandy → Corn │ 2025-06-13     │
└────┴───────────────┴──────────────┴────────────────┘
```

### Prediction Detail View

Tap any prediction to see:
- All 6 input parameters (N, P, K, temperature, humidity, moisture)
- Soil type classification result and confidence
- All 5 crop recommendations with confidence scores
- Fertilizer recommendation
- Timestamp and user who made the prediction

### Filtering Predictions

- **By date range**: Use the filter to specify start and end dates
- **By user**: Search predictions by user email or ID
- **By soil type**: Filter to see all "Clay" predictions, etc.
- **By crop**: Filter all predictions that recommended a specific crop

### Use Case: Regional Analysis

As an agricultural extension department admin, you can:
1. Filter all predictions for a date range (e.g., current season)
2. Identify the most common soil types in your region
3. See which crops are most recommended (and thus planted) by farmers
4. Identify areas with unusual NPK deficiencies
5. Correlate soil data with pest detection data from the same time period

---

## 7. PEST DETECTION LOGS

### Accessing Pest Detection Logs

Admin Panel → **"Pest Detections"**

### Pest Detection Log View

```
┌────────────────────────────────────────────────────┐
│  Pest Detection Logs              [Filter] [Export]│
├────┬───────────────┬────────────────┬──────────────┤
│ ID │ User          │ Pest Detected  │ Confidence   │
├────┼───────────────┼────────────────┼──────────────┤
│456 │ Ahmed (id:2)  │ Grasshopper    │ 91.4%       │
│455 │ Demo (id:4)   │ Caterpillar    │ 78.2%       │
│454 │ Sumaiya(id:3) │ Weevil         │ 94.1%       │
└────┴───────────────┴────────────────┴──────────────┘
```

### Pest Detection Details

Each detection record contains:
- User who submitted the photo
- Pest identified
- Confidence percentage
- Risk level
- Pesticide and organic alternative recommendations
- Date and time
- Image (if stored — depends on storage configuration)

### Monitoring for Pest Outbreak Patterns

Administrators can identify regional pest outbreaks by monitoring the pest detection logs:

1. Filter detections by date range (e.g., last 7 days)
2. Sort by pest type to see which pests are most frequently reported
3. Correlate with geographic data if user location data is collected
4. Issue regional alerts through the admin system (future feature)

**Example outbreak detection:**
```
Week of 2025-06-10:
Grasshopper: 47 detections  ← Spike vs 8 per week average
Caterpillar: 12 detections
Weevil:       9 detections
```
This spike in grasshopper detections would indicate a potential outbreak warranting outreach to farmers in that region.

---

## 8. ANALYTICS & REPORTING

### Available Analytics

**User Analytics:**
- Daily/weekly/monthly new registrations
- Active users by period
- User retention rates
- Geographic distribution (if location data collected)

**Prediction Analytics:**
- Most common soil types across all analyses
- Most frequently recommended crops by season
- Most detected pest types
- Average confidence scores by pest class
- Low-confidence detection rate (indicator of image quality issues)

**System Analytics:**
- API response times
- Daily request volumes
- Error rates
- Peak usage hours

### Exporting Data

From any admin list view:
1. Tap **"Export"** button
2. Select format: CSV (for Excel/spreadsheet analysis)
3. Choose date range
4. File will be downloaded to device

### Monthly Report Generation

Generate a monthly operational report:
1. Admin Panel → Analytics
2. Set date range to previous month
3. Tap "Generate Report"
4. Share PDF with agricultural department management

---

## 9. DATABASE OPERATIONS

### Database Overview

| Database | Location | Size (Typical) |
|----------|---------|----------------|
| SQLite (dev) | `backend/krishx.db` | < 50 MB for 10K users |
| PostgreSQL (prod) | Cloud SQL instance | Scales automatically |

### Database Schema

```sql
-- Five core tables
users           -- User accounts and authentication
predictions     -- Soil/crop analysis results
pest_detections -- Pest detection results
otp_codes       -- One-time passwords (registration + reset)
admin_audit_log -- Admin action history
```

### Checking Database Health (Direct SQL Access)

For administrators with database access:

```sql
-- Count active users
SELECT COUNT(*) FROM users WHERE is_active = 1 AND role = 'farmer';

-- Predictions in last 7 days
SELECT COUNT(*) FROM predictions
WHERE created_at >= datetime('now', '-7 days');

-- Most detected pests this month
SELECT pest_name, COUNT(*) as count
FROM pest_detections
WHERE created_at >= datetime('now', 'start of month')
GROUP BY pest_name
ORDER BY count DESC;

-- Inactive OTP codes (cleanup check)
SELECT COUNT(*) FROM otp_codes
WHERE expires_at < datetime('now') OR is_used = 1;
```

### Database Maintenance

**Monthly OTP Cleanup (recommended):**

Expired or used OTP codes accumulate over time. Clean them periodically:

```sql
-- SQLite
DELETE FROM otp_codes
WHERE expires_at < datetime('now', '-1 day')
   OR is_used = 1;
```

**Backup Procedure:**

SQLite:
```bash
# Copy the database file (while backend is stopped for consistency)
cp backend/krishx.db backup/krishx_backup_$(date +%Y%m%d).db
```

PostgreSQL (Cloud SQL):
- Use Cloud SQL automated backups (configure in GCP Console)
- Manual backup: `gcloud sql backups create --instance=krishx-db`

### Migration: SQLite to PostgreSQL

When scaling requires PostgreSQL, run the migration script:

```bash
# Set environment variables
export SQLITE_PATH=/path/to/krishx.db
export DATABASE_URL=postgresql://user:password@host:5432/krishx_db

# Run migration
cd backend
python migrate_to_postgres.py
```

The script:
1. Creates all PostgreSQL tables with correct schema
2. Copies all data from each SQLite table
3. Resets auto-increment sequences
4. Verifies row counts match

After migration:
```bash
# Update the backend to use PostgreSQL
export DATABASE_URL=postgresql://user:password@host:5432/krishx_db
# Remove DB_PATH env var or set it to empty
```

---

## 10. SECURITY & AUDIT LOG

### Admin Audit Log

Every admin action is recorded in `admin_audit_log`:

```sql
CREATE TABLE admin_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Audited Actions

| Action | Logged As |
|--------|----------|
| View user details | `VIEW_USER` |
| Activate user account | `ACTIVATE_USER` |
| Deactivate user account | `DEACTIVATE_USER` |
| View prediction details | `VIEW_PREDICTION` |
| Export data | `EXPORT_DATA` |
| Change system settings | `UPDATE_SETTINGS` |

### Viewing the Audit Log

```sql
-- Recent admin actions
SELECT admin_email, action, target_type, target_id, created_at
FROM admin_audit_log
ORDER BY created_at DESC
LIMIT 100;

-- Actions by specific admin
SELECT * FROM admin_audit_log
WHERE admin_email = 'admin@krishx.com'
ORDER BY created_at DESC;

-- All deactivation events
SELECT * FROM admin_audit_log
WHERE action = 'DEACTIVATE_USER'
ORDER BY created_at DESC;
```

### Security Monitoring

**Check for suspicious login activity:**

```sql
-- Users with many failed login attempts (would require auth logging enhancement)
-- Currently: in-memory rate limiter resets on server restart
-- Recommended: add login_attempts table in v1.1
```

**Monitor admin actions:**

Regularly review the audit log for:
- Unexpected bulk deactivations
- Admin accounts active at unusual hours
- High-volume data exports

### Rate Limiting Configuration

The backend enforces:
- **Login rate limit**: 10 attempts per IP per 15 minutes
- **OTP resend limit**: 3 sends per email per 30 minutes
- **OTP verification**: 3 attempts per code (then code invalidated)

These are hardcoded in `app.py` and `email_service.py`. To change limits, edit the constants and redeploy:

```python
# app.py
_LOGIN_MAX = 10    # max attempts
_LOGIN_WIN = 900   # window in seconds (15 min)

# email_service.py
RESEND_LIMIT = 3         # max OTP resends
RESEND_WINDOW = 1800     # window in seconds (30 min)
MIN_RESEND_INTERVAL = 60 # minimum seconds between resends
```

---

## 11. ENVIRONMENT CONFIGURATION

### Required Environment Variables

Set these on your production server before starting the backend:

| Variable | Required | Description | Example |
|----------|---------|-------------|---------|
| `KRISHX_SECRET` | **CRITICAL** | JWT signing secret (min 32 chars) | `xK9mP2...` (random) |
| `FLASK_ENV` | Yes | Set to `production` | `production` |
| `DB_PATH` | Recommended | SQLite file path | `/data/krishx.db` |
| `DATABASE_URL` | For PostgreSQL | Full PostgreSQL connection URL | `postgresql://user:pass@host/db` |
| `SMTP_USER` | Yes (for email) | Gmail/SMTP username | `noreply@yourorg.com` |
| `SMTP_PASS` | Yes (for email) | Gmail App Password | `abcd efgh ijkl mnop` |
| `SMTP_FROM` | Recommended | Sender display name | `KRISHX Agriculture` |
| `ALLOWED_ORIGINS` | Recommended | CORS allowed origins (comma-separated) | `https://api.krishx.com` |
| `PORT` | For Cloud Run | Port to listen on | `8080` |

### Generating a Secure Secret Key

```python
# Run this Python code to generate a secure secret
import secrets
print(secrets.token_hex(32))
# Output: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

### Gmail SMTP App Password Setup

1. Go to Google Account → Security → 2-Step Verification (enable it)
2. Go to Security → App Passwords
3. Select app: "Mail", device: "Other (Custom)" → name it "KRISHX"
4. Copy the 16-character app password
5. Set as `SMTP_PASS` environment variable

### Setting Environment Variables on GCP Cloud Run

```bash
gcloud run services update krishx-backend \
  --set-env-vars="KRISHX_SECRET=your_secret_here" \
  --set-env-vars="FLASK_ENV=production" \
  --set-env-vars="SMTP_USER=noreply@yourorg.com" \
  --set-env-vars="SMTP_PASS=your_app_password" \
  --set-env-vars="ALLOWED_ORIGINS=https://api.krishx.com" \
  --region=us-central1
```

### Verifying Security Configuration

After deployment, verify the security configuration:

```bash
# Check security headers are present
curl -I https://api.krishx.com/health

# Expected headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
```

---

## 12. API ADMINISTRATION

### Checking Backend Health

```bash
# Health check endpoint (no auth required)
curl https://api.krishx.com/health

# Expected response:
# {"status": "healthy", "timestamp": "2025-06-14T10:30:00Z"}
```

### API Base URLs

| Environment | URL |
|-------------|-----|
| Local Development | `http://localhost:5000` |
| Android Emulator (local) | `http://10.0.2.2:5000` |
| Production (GCP) | `https://api.krishx.com` |

### Admin API Endpoints

These endpoints require `Authorization: Bearer <admin_jwt_token>`:

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/admin/users` | List all users |
| GET | `/admin/users/<id>` | Get user details |
| PATCH | `/admin/users/<id>/toggle` | Toggle active/inactive |
| GET | `/admin/predictions` | List all predictions |
| GET | `/admin/pest-detections` | List all pest detections |
| GET | `/admin/stats` | System statistics |

### Testing Admin API (curl examples)

```bash
# Login as admin to get token
TOKEN=$(curl -s -X POST https://api.krishx.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@krishx.com","password":"YourSecurePassword"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Get all users
curl -H "Authorization: Bearer $TOKEN" https://api.krishx.com/admin/users

# Get system stats
curl -H "Authorization: Bearer $TOKEN" https://api.krishx.com/admin/stats

# Toggle user active status
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 5}' \
  https://api.krishx.com/admin/users/5/toggle
```

### Monitoring API Performance

Key metrics to monitor in production:

| Endpoint | P50 Target | P95 Target | Alert If |
|----------|-----------|-----------|---------|
| POST /predict | < 500ms | < 1s | > 2s |
| POST /pest-detect | < 4s | < 8s | > 15s |
| POST /auth/login | < 300ms | < 600ms | > 2s |
| GET /history | < 200ms | < 500ms | > 1s |

---

## 13. TROUBLESHOOTING

### Backend Not Starting

**Check environment variables:**
```bash
# Verify required vars are set
echo $KRISHX_SECRET
echo $FLASK_ENV
```

**Check security warning in logs:**
If you see:
```
[KRISHX] SECURITY WARNING: KRISHX_SECRET is not set. Using default insecure key!
```
Set the `KRISHX_SECRET` environment variable immediately.

**Check port conflicts:**
```bash
# Check if port 5000 is already in use
lsof -i :5000
# Kill conflicting process if needed
kill -9 <PID>
```

### Email (OTP) Not Sending

1. Verify `SMTP_USER` and `SMTP_PASS` are set correctly
2. Check Gmail allows App Passwords (requires 2FA enabled)
3. Check for error in Flask logs: `email_service.py send_email failed`
4. Test SMTP manually:
   ```python
   import smtplib
   with smtplib.SMTP('smtp.gmail.com', 587) as s:
       s.starttls()
       s.login('your_email@gmail.com', 'your_app_password')
       print("SMTP connection successful")
   ```
5. **DEV_MODE fallback**: If `SMTP_USER` is not set, OTPs are printed to Flask console. Check terminal output.

### Model Not Loading

**EfficientNetB4:**
```bash
# Check model file exists
ls -lh backend/pest_model/krishx_pest_model.h5
# Should show ~75MB file
```

**RandomForest:**
```bash
# Check model/data files
ls -lh backend/crop_recommendation.csv
ls -lh backend/soil_type_model.pkl  # (generated on first run)
```

If model files are missing, they need to be redownloaded or retrained (see Technical Documentation).

### Admin Account Locked Out

If all admin accounts are deactivated or passwords forgotten:

```python
# Emergency admin password reset via Flask shell
# cd backend && python3

from database import get_db_connection
import bcrypt

conn = get_db_connection()
new_password = 'Emergency@2025!'
new_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()

conn.execute(
    "UPDATE users SET password_hash=?, is_active=1 WHERE email=?",
    (new_hash, 'admin@krishx.com')
)
conn.commit()
conn.close()
print("Admin password reset complete.")
```

### Database Corruption (SQLite)

```bash
# Check SQLite integrity
sqlite3 krishx.db "PRAGMA integrity_check;"
# Should return: ok

# If corrupted, restore from backup
cp backup/krishx_backup_YYYYMMDD.db krishx.db
```

---

## 14. EMERGENCY PROCEDURES

### Security Incident: Suspected Unauthorized Admin Access

1. **Immediately** change all admin passwords via the database (see Section 13)
2. Rotate the `KRISHX_SECRET` JWT signing key — this invalidates ALL active sessions
3. Redeploy the backend with the new secret
4. Review `admin_audit_log` for the incident period
5. Check all user account statuses for unauthorized changes
6. Document the incident with timestamps

```bash
# Rotate JWT secret (invalidates all active tokens — all users must re-login)
gcloud run services update krishx-backend \
  --set-env-vars="KRISHX_SECRET=$(python3 -c 'import secrets; print(secrets.token_hex(32))')" \
  --region=us-central1
```

### Service Outage: Backend Not Responding

1. Check Cloud Run logs: `gcloud run services logs krishx-backend --region=us-central1`
2. Check instance health in GCP Console
3. Check if ML model files are accessible (Cloud Volume mount intact)
4. If needed, redeploy from last known good container:
   ```bash
   gcloud run services update krishx-backend \
     --image=gcr.io/PROJECT_ID/krishx-backend:stable \
     --region=us-central1
   ```

### Data Loss Prevention

**Before any database migration or maintenance:**
1. Create a database backup (see Section 9)
2. Test the backup restore procedure in a separate environment
3. Notify users of scheduled maintenance window
4. Proceed only after confirming backup is valid

**Backup verification:**
```bash
# Verify backup file is readable and has expected size
sqlite3 backup/krishx_backup_YYYYMMDD.db "SELECT COUNT(*) FROM users;"
```

---

## APPENDIX A: QUICK REFERENCE — ADMIN TASKS

| Task | Location | Notes |
|------|---------|-------|
| View all users | Admin Panel → Users | Filterable |
| Deactivate user | Admin Panel → Users → [User] → Deactivate | Reversible |
| View all predictions | Admin Panel → Predictions | |
| View pest detections | Admin Panel → Pest Detections | |
| View system stats | Admin Panel → Dashboard | Real-time |
| Reset admin password | Database direct (Section 13) | Emergency only |
| Change SMTP config | Environment variables | Restart required |
| Rotate JWT secret | Environment variables | Logs out all users |
| Database backup | CLI / Cloud SQL Console | Do before migrations |

---

## APPENDIX B: ADMIN API REFERENCE

### Authentication

All admin endpoints require:
```
Authorization: Bearer <access_token>
```

The token is obtained from `POST /auth/login` with admin credentials. Admin tokens expire in 24 hours (same as regular user tokens). The auto-refresh mechanism in the mobile app handles token renewal automatically.

### GET /admin/users

Returns paginated list of all users.

**Query Parameters:**
- `page` (int, default 1): Page number
- `per_page` (int, default 20): Results per page
- `search` (string): Filter by name or email

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "full_name": "Md. Rakibul Islam",
      "email": "admin@krishx.com",
      "role": "admin",
      "is_active": true,
      "is_verified": true,
      "created_at": "2025-01-15T10:00:00Z",
      "prediction_count": 0
    }
  ],
  "total": 1247,
  "page": 1,
  "pages": 63
}
```

### PATCH /admin/users/:id/toggle

Activates or deactivates a user account.

**Response:**
```json
{
  "message": "User deactivated successfully",
  "is_active": false
}
```

### GET /admin/stats

Returns system-wide statistics.

**Response:**
```json
{
  "total_users": 1247,
  "active_users_7d": 342,
  "total_predictions": 8432,
  "total_pest_detections": 3891,
  "new_registrations_30d": 189,
  "top_crops": ["Rice", "Wheat", "Maize"],
  "top_pests": ["Grasshopper", "Caterpillar", "Weevil"]
}
```

---

*KRISHX Admin Manual v1.0 | 2025 | © KRISHX Agriculture*
*Confidential — For authorized administrators only*
