# KRISHX Agriculture — User Manual

**Version 1.0 | Android Application**

---

## TABLE OF CONTENTS

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [Installation](#3-installation)
4. [Account Registration](#4-account-registration)
5. [OTP Email Verification](#5-otp-email-verification)
6. [Login](#6-login)
7. [Forgot Password / Password Reset](#7-forgot-password--password-reset)
8. [Home Screen](#8-home-screen)
9. [Soil Analysis & Crop Recommendation](#9-soil-analysis--crop-recommendation)
10. [Fertilizer Recommendation](#10-fertilizer-recommendation)
11. [Pest Detection](#11-pest-detection)
12. [Prediction History](#12-prediction-history)
13. [PDF Export & Sharing](#13-pdf-export--sharing)
14. [Profile Management](#14-profile-management)
15. [Settings](#15-settings)
16. [Troubleshooting](#16-troubleshooting)
17. [Contact & Support](#17-contact--support)

---

## 1. INTRODUCTION

**KRISHX Agriculture** is a free Android application that provides AI-powered agricultural advisory to farmers. Using your smartphone, you can:

- Analyse your soil and receive crop recommendations tailored to your exact soil conditions
- Identify agricultural pests from a photo within 4 seconds
- Get specific fertilizer product recommendations based on your NPK soil profile
- Keep a complete history of all your analyses for future reference
- Export reports as PDF to share with agricultural extension officers

KRISHX is **completely free** to use and requires no agricultural expertise — the AI does the expert analysis for you.

---

## 2. SYSTEM REQUIREMENTS

| Requirement | Minimum |
|-------------|---------|
| Operating System | Android 7.0 (API level 24) |
| RAM | 2 GB |
| Storage | 100 MB free space |
| Camera | Required for pest photo detection |
| Internet | Required for all features |
| Screen Size | 4.5 inches or larger recommended |

**Recommended:** Android 10.0 or higher, 3 GB RAM, stable mobile data or WiFi connection.

---

## 3. INSTALLATION

### Method 1: Google Play Store (Recommended)

1. Open **Google Play Store** on your Android device
2. Search for **"KRISHX Agriculture"**
3. Tap **Install**
4. Wait for download and installation to complete (approximately 45 MB)
5. Tap **Open** to launch

### Method 2: Direct APK Installation

1. On your Android device, go to **Settings → Security**
2. Enable **"Install from unknown sources"** or **"Install unknown apps"**
3. Download the KRISHX APK file from the official source
4. Open the downloaded file using a file manager
5. Tap **Install** when prompted
6. Tap **Open** after installation completes

> **Note:** Re-enable security restrictions after installation for device safety.

---

## 4. ACCOUNT REGISTRATION

You must create a KRISHX account to use all features. Registration is free.

### Steps

1. Open the KRISHX app
2. On the Login screen, tap **"Don't have an account? Register"**
3. Fill in the registration form:
   - **Full Name** — Your complete name (2–100 characters)
   - **Email Address** — A valid email you can access (used for OTP verification)
   - **Password** — Minimum 8 characters, must include uppercase, lowercase, number, and special character
   - **Confirm Password** — Re-enter your password exactly
4. Tap **"Create Account"**
5. A 6-digit OTP code will be sent to your email address
6. You will be taken to the OTP Verification screen automatically

### Password Requirements

Your password must contain:
- At least 8 characters
- At least one UPPERCASE letter (A–Z)
- At least one lowercase letter (a–z)
- At least one number (0–9)
- At least one special character (! @ # $ % etc.)

**Example of a valid password:** Agri@2025

### Important Notes

- Each email address can only be registered once
- If you see "Email already registered", use the **Forgot Password** option to recover access
- Your email address is your permanent login ID — choose carefully

---

## 5. OTP EMAIL VERIFICATION

After registration, you must verify your email address using a One-Time Password (OTP).

### Steps

1. Check your email inbox for a message from KRISHX Agriculture
2. The subject line will be: **"KRISHX — Verify Your Email"**
3. Open the email and note the **6-digit code** (example: 847293)
4. On the OTP Verification screen in the app, tap each box and enter the digits
5. Tap **"Verify OTP"**
6. If verified successfully, you will be logged in automatically

### OTP Details

| Property | Value |
|----------|-------|
| Code format | 6 digits (numbers only) |
| Expiry time | 5 minutes |
| Maximum attempts | 3 (then code is invalidated) |
| Resend limit | 3 times per 30 minutes |

### Resending OTP

If you did not receive the OTP or it expired:

1. On the OTP screen, tap **"Resend OTP"**
2. Wait for a new code to arrive (usually within 1–2 minutes)
3. Check your **Spam/Junk folder** if not in inbox

### Troubleshooting OTP

- **Code expired**: Tap "Resend OTP" to get a new code
- **Wrong code**: You have 3 attempts; after the 3rd incorrect attempt, request a new OTP
- **Email not received**: Check spam folder; ensure you entered your email correctly during registration
- **"Too many requests"**: Wait 30 minutes before requesting another OTP

---

## 6. LOGIN

### Steps

1. Open the KRISHX app
2. Enter your registered **Email Address**
3. Enter your **Password**
4. Tap **"Login"**
5. You will be taken to the Home Screen

### Stay Logged In

KRISHX keeps you logged in automatically. Your session remains active for 30 days. You will only be asked to log in again if:

- You manually log out
- Your session expires after 30 days of inactivity
- You log in on a new device

### Login Errors

| Error Message | Cause | Solution |
|--------------|-------|---------|
| "Invalid email or password" | Wrong credentials | Check email/password; use Forgot Password if needed |
| "Account is inactive" | Admin disabled your account | Contact support |
| "Too many login attempts" | 10+ failed attempts in 15 minutes | Wait 15 minutes, then try again |

> **Security Note:** After 10 failed login attempts from the same device, KRISHX temporarily blocks further attempts for 15 minutes to protect your account.

---

## 7. FORGOT PASSWORD / PASSWORD RESET

If you forgot your password, you can reset it using your registered email address.

### Steps

1. On the Login screen, tap **"Forgot Password?"**
2. Enter your registered email address
3. Tap **"Send Reset Code"**
4. Check your email for a 6-digit OTP code (subject: "KRISHX — Password Reset")
5. Enter the OTP on the verification screen
6. Enter your new password (must meet password requirements)
7. Enter new password again to confirm
8. Tap **"Reset Password"**
9. You will be redirected to the Login screen — log in with your new password

### Important Notes

- The reset OTP expires in 5 minutes
- If you don't receive the email, check your spam folder
- You can request a new reset code if the first one expires
- Your prediction history is preserved after a password reset

---

## 8. HOME SCREEN

After logging in, you will see the Home Screen with four main action cards.

```
┌──────────────────────────────────────────┐
│  Good morning, [Name]!        👤 Profile │
│  How can KRISHX help your farm today?    │
├────────────────┬─────────────────────────┤
│  🌱            │  🔬                     │
│  Soil Analysis │  Pest Detection         │
│  Crop Recs     │  Photo Analysis         │
├────────────────┴─────────────────────────┤
│  💊            │  📋                     │
│  Fertilizer    │  History                │
│  Recommendation│  & Reports              │
└────────────────┴─────────────────────────┘
```

### Navigation Bar (Bottom)

| Icon | Screen |
|------|--------|
| 🏠 Home | Returns to Home Screen |
| 🔬 Detect | Pest Detection module |
| 📋 History | Prediction history |
| 👤 Profile | Your profile and settings |

---

## 9. SOIL ANALYSIS & CROP RECOMMENDATION

This module analyses your soil conditions and recommends the best crops to grow.

### What You Need

Before using this feature, you need the following soil measurements:
- **Nitrogen (N)** content — from a soil test kit or laboratory report
- **Phosphorus (P)** content — from a soil test kit
- **Potassium (K)** content — from a soil test kit
- **Temperature** — current or average temperature of your farm area (°C)
- **Humidity** — relative humidity percentage (%)
- **Moisture** — soil moisture percentage (%)

> **Tip:** Basic soil test kits are available at agricultural supply shops for USD 5–15. Alternatively, contact your local agricultural extension office for free soil testing services.

### Steps

1. From Home Screen, tap **"Soil Analysis"** card
2. Enter all 6 parameters in the input fields

   | Field | Unit | Typical Range |
   |-------|------|--------------|
   | Nitrogen | mg/kg | 0 – 200 |
   | Phosphorus | mg/kg | 0 – 150 |
   | Potassium | mg/kg | 0 – 250 |
   | Temperature | °C | 5 – 45 |
   | Humidity | % | 10 – 100 |
   | Moisture | % | 0 – 100 |

3. Tap **"Get Crop Recommendation"**
4. Wait approximately 0.5 seconds for results

### Understanding Your Results

**Soil Type Classification**
- Displays the identified soil type (e.g., Clay, Sandy, Loam, Sandy Loam)
- Shows confidence percentage (e.g., 97.3%)
- Higher confidence = more reliable classification

**Crop Recommendations (Top 5)**
- Lists up to 5 crops most suitable for your soil conditions
- Each crop shows a confidence/suitability percentage
- The first crop is the best match for your soil profile
- **Common crops:** Rice, Wheat, Maize, Cotton, Sugarcane, Coffee, Banana, Mango, Chickpea, Kidney Bean, Lentil, Watermelon, Papaya, Pomegranate, Jute, Coconut

**Example Result:**
```
Soil Type: Clay (97.3% confident)

Recommended Crops:
1. Rice          89.2%  ← Best match
2. Jute          76.4%
3. Watermelon    71.8%
4. Sugarcane     68.3%
5. Banana        65.1%
```

### Important Notes

- All results are saved automatically to your History
- For best results, use accurate soil test values rather than estimates
- KRISHX recommendations are advisory — actual yield depends on many local factors
- Consult a local agricultural expert before making large investment decisions

---

## 10. FERTILIZER RECOMMENDATION

After receiving crop recommendations, you can get a specific fertilizer prescription.

### Steps

1. After viewing crop recommendations, tap **"Get Fertilizer Recommendation"**
   - OR from Home Screen, tap the **"Fertilizer"** card, enter soil parameters, and select a crop
2. The system will show the recommended fertilizer product and application guidance

### Understanding Fertilizer Results

The fertilizer recommendation includes:
- **Product name** — specific fertilizer product
- **Application rate** — how much to apply per unit area
- **Application method** — how to apply (broadcast, banding, foliar spray)
- **NPK match** — how closely the recommended fertilizer matches your soil's NPK needs

> **Caution:** Always read and follow the fertilizer manufacturer's instructions. Incorrect application can damage crops or soil. If unsure, consult your agricultural extension officer.

---

## 11. PEST DETECTION

This module identifies agricultural pests from photos and provides pesticide recommendations.

### Supported Pests (12 Classes)

| Pest | Risk Level | Notes |
|------|-----------|-------|
| Ants | Medium | Colony damage to roots and stems |
| Bees | Low | Generally beneficial; concern near hives |
| Beetle | High | Larvae and adults damage crops |
| Caterpillar | High | Leaf defoliation; common crop attacker |
| Earthworms | Low | Usually beneficial to soil health |
| Earwig | Medium | Feeds on seedlings and soft fruit |
| Grasshopper | High | Swarm damage; major crop threat |
| Moth | Medium | Adult moths lay eggs; larvae cause damage |
| Slug | Medium | Damages seedlings in moist conditions |
| Snail | Medium | Similar to slug; found in wet conditions |
| Wasp | Medium | Beneficial predators but can sting |
| Weevil | High | Grain and stored crop damage |

### Taking a Pest Photo — Best Practices

For accurate detection:

- **Distance**: 15–30 cm from the pest
- **Lighting**: Good natural light; avoid harsh shadows
- **Focus**: Ensure the pest is in sharp focus
- **Background**: Plain background (soil, leaf, palm) works best
- **Size**: Pest should fill at least 30% of the frame
- **Avoid**: Blurry, dark, or overcrowded images

### Steps

1. From the Home Screen or bottom navigation, tap **"Pest Detection"** (or the detect icon)
2. Choose input method:
   - **"Take Photo"** — Opens camera to capture a live photo
   - **"Choose from Gallery"** — Selects an existing photo from your device
3. Take or select the photo
4. Tap **"Detect Pest"**
5. Wait approximately 3–4 seconds for AI analysis
6. View results

### Understanding Detection Results

```
┌─────────────────────────────────────────┐
│  ✅ DETECTED: Grasshopper                │
│  Confidence: 91.4%                      │
│  Risk Level: 🔴 HIGH                    │
├─────────────────────────────────────────┤
│  RECOMMENDED PESTICIDE                  │
│  Chlorpyrifos 20% EC                   │
│  Apply 2ml/L water; spray on foliage   │
├─────────────────────────────────────────┤
│  ORGANIC ALTERNATIVE                    │
│  Neem oil spray (5ml/L water)          │
│  Apply in evening; repeat weekly       │
├─────────────────────────────────────────┤
│  PREVENTION                             │
│  Maintain field hygiene; use pheromone │
│  traps during swarming season          │
└─────────────────────────────────────────┘
```

**Confidence Score:**
- 90–100%: High confidence — result is very reliable
- 70–89%: Medium confidence — result is likely correct; cross-check if unsure
- Below 70%: Low confidence — take a clearer photo for better results

**Risk Levels:**
- 🔴 **HIGH**: Immediate action recommended; pest can cause significant crop loss
- 🟡 **MEDIUM**: Monitor closely; treat if population increases
- 🟢 **LOW**: Minimal immediate threat; maintain observation

### When Results Are Uncertain

If the confidence is below 70% or the result seems incorrect:
1. Take another photo with better lighting and focus
2. Move closer to the pest
3. Try a different angle (top view, side view)
4. Check that the pest is clearly visible and in focus

### Important Safety Notice

> ⚠️ **PESTICIDE WARNING**: Always wear protective gloves, mask, and clothing when applying pesticides. Keep children and animals away during application. Follow the manufacturer's safety instructions exactly. If in doubt about pesticide safety, consult a certified agricultural officer.

---

## 12. PREDICTION HISTORY

KRISHX automatically saves all your soil analyses and pest detections for future reference.

### Accessing History

1. Tap the **History** icon in the bottom navigation bar
2. OR tap **"History"** card on the Home Screen

### History Screen Layout

```
┌──────────────────────────────────────────┐
│  📋 Prediction History              [PDF]│
│  All · Soil · Pest                       │
├──────────────────────────────────────────┤
│  🌱 Soil Analysis                        │
│  Clay Soil · Rice recommended            │
│  2025-06-15  14:32                ›      │
├──────────────────────────────────────────┤
│  🔬 Pest Detection                       │
│  Grasshopper (91.4% confidence)         │
│  2025-06-14  09:15                ›      │
├──────────────────────────────────────────┤
│  🌱 Soil Analysis                        │
│  Sandy Loam · Wheat recommended          │
│  2025-06-13  16:48                ›      │
└──────────────────────────────────────────┘
```

### Filtering History

Use the filter tabs at the top of the History screen:
- **All** — Shows all prediction types
- **Soil** — Shows only soil/crop analyses
- **Pest** — Shows only pest detection results

### Viewing a Past Prediction

Tap any history entry to see the full details:
- All input parameters used
- Complete prediction results
- Date and time of analysis
- Confidence scores

### History Limits

- Your complete prediction history is stored and accessible
- History is tied to your account — logging out or reinstalling the app does not delete your history

---

## 13. PDF EXPORT & SHARING

Export your prediction history as a professional PDF report to share with extension officers or keep for your records.

### Exporting a PDF

1. Navigate to **History**
2. Tap the **PDF** button (top right of History screen)
3. The app generates a PDF report containing all your recent predictions
4. Your device's **Share Sheet** will open automatically
5. Choose to:
   - Save to device Files/Downloads
   - Share via WhatsApp, Email, or any messaging app
   - Print directly

### What the PDF Contains

- Your name and account information
- Date range of included predictions
- All soil analysis entries with parameters and results
- All pest detection entries with identified pest and recommendations
- KRISHX watermark and generation timestamp

### Sharing with an Extension Officer

The PDF is formatted for professional sharing. An agricultural extension officer can use your PDF to:
- Verify your soil conditions
- Confirm pest identifications
- Provide additional guidance based on your data
- Track seasonal patterns across multiple farmers

---

## 14. PROFILE MANAGEMENT

### Viewing Your Profile

1. Tap the **Profile** icon in the bottom navigation bar
2. View your name, email, and account information

### Changing Your Password

1. Go to **Profile** → **Settings**
2. Tap **"Change Password"**
3. Enter your current password
4. Enter your new password (must meet password requirements)
5. Confirm new password
6. Tap **"Update Password"**

### Logging Out

1. Go to **Profile**
2. Tap **"Logout"** at the bottom of the screen
3. Confirm logout when prompted
4. You will be returned to the Login screen

> **Note:** Logging out does not delete your prediction history. All data is stored securely in your account and will be available when you log in again.

---

## 15. SETTINGS

Access Settings from the Profile screen.

### Available Settings

| Setting | Description |
|---------|-------------|
| Change Password | Update your account password |
| Privacy Policy | View KRISHX data privacy policy |
| Terms of Service | View terms and conditions |
| AI Disclaimer | View limitations of AI predictions |
| About KRISHX | App version, developer info, contact |

### About Screen

The About screen displays:
- App version number
- Developer contact information
- Technology used in the app
- Link to Play Store for ratings and reviews

---

## 16. TROUBLESHOOTING

### App Won't Open / Crashes on Start

**Possible causes and solutions:**
1. **Outdated app**: Update KRISHX from Play Store
2. **Insufficient storage**: Free at least 200MB of device storage
3. **Corrupted installation**: Uninstall and reinstall the app
4. **Old Android version**: KRISHX requires Android 7.0 or higher

### Login Not Working

| Symptom | Solution |
|---------|---------|
| "Invalid email or password" | Double-check email (no spaces) and password (case-sensitive) |
| Forgot password | Use "Forgot Password?" on Login screen |
| "Account inactive" | Contact admin@krishx.com |
| Locked out (too many attempts) | Wait 15 minutes before trying again |

### Soil Analysis Not Loading

1. Check your internet connection
2. Ensure all 6 fields have values entered (no empty fields)
3. Check that values are within realistic ranges (no negative numbers)
4. Try closing and reopening the app

### Pest Detection Issues

| Problem | Solution |
|---------|---------|
| "Detection failed" | Check internet connection; try again |
| Very low confidence (<50%) | Retake photo with better lighting and focus |
| Wrong pest identified | Take photo from different angle; ensure pest fills the frame |
| Photo upload taking too long | Check WiFi/data connection speed |

### OTP Not Received

1. Wait 2–3 minutes — emails can be delayed
2. Check **Spam/Junk** folder
3. Verify you entered the correct email during registration
4. Tap "Resend OTP" on the verification screen
5. Note: Maximum 3 resend requests per 30 minutes

### PDF Export Not Working

1. Ensure the app has **Storage** permissions (Settings → Apps → KRISHX → Permissions)
2. Ensure sufficient free storage space (minimum 50MB)
3. Try again after closing and reopening the app

### App Running Slowly

1. Close other apps running in the background
2. Ensure stable internet connection (WiFi preferred for pest detection)
3. Restart your device
4. Clear KRISHX app cache: Settings → Apps → KRISHX → Clear Cache

---

## 17. CONTACT & SUPPORT

### Technical Support

**Email:** admin@krishx.com
**Response Time:** 1–2 business days

### When Contacting Support

Please include:
- Your registered email address
- Android version and phone model
- Description of the problem
- Screenshot of any error message (if applicable)
- App version (found in Settings → About)

### Reporting Incorrect AI Predictions

If you believe the AI made an incorrect pest identification or soil recommendation, please report it to help us improve:

1. Take note of the pest name identified and the confidence score
2. Email admin@krishx.com with subject: "AI Prediction Feedback"
3. Include: what the AI identified, what it actually was, confidence score, and a description of the image

All feedback helps improve the AI model for future versions.

### Privacy

KRISHX collects prediction data (soil parameters, pest photos, results) to improve AI accuracy. All personal data is handled according to our Privacy Policy, accessible from Settings → Privacy Policy within the app.

---

*KRISHX User Manual v1.0 | 2025 | © KRISHX Agriculture*
*For the latest version of this manual, contact admin@krishx.com*
