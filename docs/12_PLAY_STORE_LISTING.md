# KRISHX Agriculture — Google Play Store Listing Assets

**Version 1.0.0 | Play Store Submission Package**

---

## PART A: APP METADATA

---

### App Title
```
KRISHX — Smart Farming AI
```
*30 characters — maximum allowed. Includes primary keyword "Smart Farming AI".*

---

### Short Description (80 characters max)
```
AI pest detection, soil analysis & crop recommendations for every farmer
```
*79 characters. Hits the three core features in a single sentence.*

---

### Full Description (4000 characters max)

```
🌱 KRISHX Agriculture — Your AI-Powered Farm Advisor

KRISHX puts a PhD-level agricultural consultant in every farmer's pocket. 
Using state-of-the-art deep learning and machine learning, KRISHX delivers 
instant, accurate, and free agricultural guidance — no expertise required.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔬 PEST DETECTION — Identify crop pests in 4 seconds

Simply photograph any insect or pest attacking your crops. KRISHX's 
EfficientNetB4 AI identifies it in seconds and tells you exactly what 
to do:

• Identifies 12 agricultural pest types with 93% accuracy
• Shows risk level (High / Medium / Low)
• Recommends specific pesticide products
• Suggests organic and natural alternatives
• Provides prevention strategies

Supported pests: Grasshopper, Caterpillar, Beetle, Weevil, Ants, 
Earthworms, Earwig, Slug, Snail, Moth, Bees, Wasp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌍 SOIL ANALYSIS & CROP RECOMMENDATION

Enter your soil readings and get instant expert-level guidance:

• Identify your soil type (Clay, Sandy, Loam, and more)
• Get top-5 crop recommendations ranked by suitability
• Confidence scores so you know how reliable each recommendation is
• Covers 22 major crops including Rice, Wheat, Maize, Cotton, Coffee, 
  Banana, Sugarcane, Chickpea, and more
• 97%+ soil classification accuracy — matches laboratory tests

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💊 FERTILIZER RECOMMENDATION

Get a specific fertilizer product recommendation based on your soil's 
Nitrogen, Phosphorus, and Potassium levels. No guesswork — just the 
right product and application guidance for your exact soil profile.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 PREDICTION HISTORY & PDF REPORTS

• All analyses saved automatically to your account
• View complete history of soil analyses and pest detections
• Export full history as a professional PDF report
• Share reports directly with agricultural extension officers
• Season-over-season comparison for better decision making

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 SECURE & PRIVATE

• Email verification with OTP for account security
• Your data is private and encrypted
• No data sold to third parties
• Complete privacy policy available in-app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ WHY KRISHX?

✓ 100% FREE — No subscriptions, no hidden fees
✓ Works on any Android 7.0+ smartphone
✓ Results in under 4 seconds
✓ No agricultural knowledge required
✓ Trusted AI: 93% pest accuracy, 97% soil accuracy
✓ PDF export for offline reference
✓ Dark theme optimized for outdoor sunlight
✓ Supports farmers in South Asia, Southeast Asia & Africa

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KRISHX is designed for the 570 million smallholder farming households 
worldwide who deserve access to the same quality of agricultural guidance 
as large commercial farms — at zero cost.

Important: AI recommendations are advisory. Always consult a qualified 
agricultural professional before applying pesticides or making major 
farming decisions.
```

*Character count: approximately 2,850 — well within 4,000 limit. Structured with emoji headers for visual scanning in Play Store.*

---

### Keywords / Search Tags

```
agriculture app, farming app, crop recommendation, soil analysis, pest detection,
smart farming, AI agriculture, plant disease, fertilizer recommendation, crop advisor,
farmer app, insect identification, soil test, agricultural AI, crop planting guide,
soil NPK, pest control, organic farming, agricultural advisory, farm management
```

*Primary keywords in title: "Smart Farming", "AI"*
*Primary keywords in short description: "pest detection", "soil analysis", "crop recommendations"*

---

### Category
**Primary:** Tools
**Secondary:** Education

---

### Tags (Play Store searchable tags — max 5)
1. agriculture
2. farming
3. pest detection
4. soil analysis
5. crop recommendation

---

### Content Rating
**Expected:** Everyone
**Rationale:** No violence, no adult content, no social networking, no user-generated content visible to others, no location tracking, no ads.

---

### App Price
**Free**

---

### Contact Information

| Field | Value |
|-------|-------|
| Email | admin@krishx.com |
| Website | https://krishx.com (or GitHub repository URL) |
| Privacy Policy URL | Required — host the privacy policy at a public URL |

---

## PART B: SCREENSHOT REQUIREMENTS

---

### Screenshot Specifications

| Spec | Requirement |
|------|------------|
| Format | PNG or JPEG |
| Minimum dimension | 320px |
| Maximum dimension | 3840px |
| Aspect ratio | Between 16:9 and 9:16 |
| Recommended size | 1080 × 2340 (portrait, modern Android) |
| Count | 2–8 screenshots (recommend 8) |

---

### Required Screenshots — List

Capture the following screens in order. Use a clean Android device with demo data pre-loaded.

#### Screenshot 1: Login Screen
**Screen:** `LoginScreen.js`
**How to capture:**
- Open the app fresh (logged out)
- The login screen shows the KRISHX brand header, email/password fields, "Sign In" button, and Privacy Policy/Terms footer links

**Add text overlay:** `"Secure Login with Email Verification"`

---

#### Screenshot 2: Home Screen (after login)
**Screen:** `HomeScreen.js`
**How to capture:**
- Log in as a farmer account
- Shows greeting, 4 feature cards (Soil Analysis, Pest Detection, Fertilizer, History), and bottom navigation

**Add text overlay:** `"Your Complete Farm Advisory Hub"`

---

#### Screenshot 3: Soil Analysis Form
**Screen:** `PredictionScreen.js`
**How to capture:**
- Navigate to Analyze tab
- Shows the 6 input fields (N, P, K, Temperature, Humidity, Moisture) with the "Get Crop Recommendation" button

**Sample values to show:**
- N: 90, P: 42, K: 43, Temp: 20.88, Humidity: 82, Moisture: 42

**Add text overlay:** `"AI Soil Analysis — 97% Accuracy"`

---

#### Screenshot 4: Crop Recommendation Results
**Screen:** `ResultScreen.js`
**How to capture:**
- Run the prediction with sample values above
- Shows "Clay Soil" soil type with confidence %, and 5 recommended crops with confidence bars
- Scroll to show fertilizer recommendation section

**Add text overlay:** `"Top-5 Crop Recommendations Instantly"`

---

#### Screenshot 5: Pest Detection Camera
**Screen:** `PestDetectionScreen.js`
**How to capture:**
- Navigate to Pest Detection
- Shows the camera/gallery selection interface with instructions

**Add text overlay:** `"Photograph Any Pest — Identify in 4 Seconds"`

---

#### Screenshot 6: Pest Detection Result
**Screen:** `PestDetectionScreen.js` (result state)
**How to capture:**
- Upload a grasshopper or caterpillar test image
- Shows the pest name, confidence %, risk level indicator, pesticide recommendation, and organic alternative

**Sample expected result:**
```
Grasshopper
91.4% confidence
Risk Level: HIGH 🔴
Pesticide: Chlorpyrifos 20% EC
Organic: Neem oil spray
```

**Add text overlay:** `"Instant Pest ID + Treatment Plan"`

---

#### Screenshot 7: Prediction History
**Screen:** `HistoryScreen.js`
**How to capture:**
- Navigate to History tab
- Shows a scrollable list of past soil analyses and pest detections with dates
- Should show at least 5–8 history entries

**Add text overlay:** `"Complete Prediction History & PDF Export"`

---

#### Screenshot 8: Admin Dashboard
**Screen:** `AdminHomeScreen.js`
**How to capture:**
- Log in as admin account
- Shows dashboard statistics: total users, total predictions, today's activity, top crops chart

**Add text overlay:** `"Admin Dashboard for Agricultural Organizations"`

---

### Feature Graphic (Play Store Banner)

**Size:** 1024 × 500 pixels
**Format:** PNG or JPEG (no transparency)

**Design brief:**
```
Background: Dark gradient (#0F172A → #1E1052 → #4C1D95)

Left side (60%):
  KRISHX  [large, white, letter-spaced, bold]
  Agriculture  [smaller, below]
  
  "AI-Powered Smart Farm Advisory"  [subtitle]
  
  Three feature pills:
  [🔬 93% Pest Detection]  [🌱 97% Soil Accuracy]  [💊 Fertilizer Guide]

Right side (40%):
  Mobile phone mockup showing the ResultScreen with crop recommendations
  
Bottom right corner:
  "Free on Android"
```

---

### App Icon Requirements

**Already configured in `mobile/app.json`:**
- `icon.png` — 1024×1024 PNG, full bleed, no transparency
- `adaptive-icon.png` — 1024×1024 PNG for Android adaptive icon foreground
- Adaptive icon background: `#0F172A` (dark navy)

**Design guidelines for icon:**
- Center a stylized green leaf (🌱) on a dark `#0F172A` background
- Leaf should be in the KRISHX accent green (`#22C55E`) or gradient
- "KX" or "K" monogram inside or below the leaf
- Clean, minimal design visible at all sizes (512px Play Store, 48px home screen)

---

## PART C: PROMOTIONAL TEXT

---

### 15-Word Tagline
```
Free AI agricultural advisory — soil, crops, pest detection for every farmer.
```

---

### 30-Second Promo Script (Video/Social Media)

```
Meet KRISHX — the free AI agricultural advisor in your pocket.

Take a photo of any pest attacking your crops.
KRISHX identifies it in 4 seconds with 93% accuracy.
Get the exact pesticide — or the organic alternative.

Enter your soil readings.
Get crop recommendations matched to your exact soil profile.
97% accuracy. Better than a laboratory test.

Your entire prediction history — saved and exportable as PDF.
Share it with your extension officer with one tap.

KRISHX. Free. For every farmer.
Download from Google Play today.
```

---

### Twitter / Social Media Post

```
🌱 Introducing KRISHX Agriculture

✅ Identify crop pests from a photo in 4 seconds (93% AI accuracy)
✅ Soil analysis + crop recommendations in <500ms (97% accuracy)
✅ Fertilizer prescription based on your exact NPK profile
✅ Complete prediction history with PDF export
✅ 100% FREE for farmers worldwide

Built for the 570M smallholder farmers who deserve expert advice.

#SmartFarming #AgriTech #AI #Agriculture #FarmerFirst
```

---

### LinkedIn Post (Startup Announcement)

```
Excited to announce KRISHX Agriculture v1.0 — an AI-powered smart agriculture 
platform built for smallholder farmers in developing markets.

The Problem:
570 million smallholder farming households. 85% have no access to quality 
agricultural advisory. USD 220 billion in annual crop losses.

Our Solution:
A free Android app that puts PhD-level agricultural intelligence in every 
farmer's pocket:

🔬 Pest Detection: EfficientNetB4 CNN, 93.06% accuracy, 12 pest classes
🌱 Soil Analysis: RandomForest, 97%+ accuracy, 50,000+ training records
💊 Fertilizer Recommendation: NPK-matched product suggestions
📋 Prediction History: Full record with PDF export

Built on: Python Flask + React Native + TensorFlow + scikit-learn + GCP

Looking for:
• Agricultural NGO partnerships for field pilots
• Government extension program licensing
• Seed investment to scale to 100K+ farmers

#AgriTech #AI #SmartFarming #SocialImpact #StartupAnnouncement
```

---

## PART D: PLAY CONSOLE SETUP CHECKLIST

Complete these steps in Google Play Console before submitting:

### App Setup
- [ ] Create app in Play Console
- [ ] Set app name: "KRISHX Agriculture"
- [ ] Set default language: English (UK)
- [ ] Set app category: Tools (or Education)
- [ ] Set contact email: admin@krishx.com

### Store Listing
- [ ] Upload screenshots (minimum 2, recommend 8)
- [ ] Upload feature graphic (1024×500)
- [ ] Upload app icon (512×512)
- [ ] Add short description (80 chars)
- [ ] Add full description (with formatting)
- [ ] Add contact email and privacy policy URL

### App Content
- [ ] Complete IARC questionnaire (content rating)
- [ ] Complete data safety form (see below)
- [ ] Complete target audience declaration (Farmers — age 18+)
- [ ] Declare no ads (no ad SDK in the app)

### Data Safety Form

Fill in the Play Store data safety section as follows:

| Data Type | Collected? | Shared? | Purpose |
|-----------|-----------|---------|---------|
| Name | Yes | No | Account management |
| Email address | Yes | No | Authentication, OTP delivery |
| Photos (pest images) | Yes | No | AI pest detection only |
| App interactions | Yes | No | Improving app experience |
| Crash logs | No | No | — |
| Location | No | No | — |
| Financial info | No | No | — |

**Data is encrypted in transit:** Yes (HTTPS)
**Data can be deleted:** Yes (account deletion on request via admin@krishx.com)

### Release
- [ ] Upload AAB (built with `eas build --profile production`)
- [ ] Complete release notes for v1.0.0
- [ ] Submit for review (typically 1–7 business days for first submission)

---

### Release Notes for v1.0.0 (What's New)

```
KRISHX Agriculture v1.0 — Initial Release

Welcome to KRISHX, your AI-powered agricultural advisor!

• AI pest detection: identify 12 agricultural pest types from a photo
• Soil analysis: classify soil type and get crop recommendations
• Fertilizer recommendation based on your NPK soil profile
• Prediction history with PDF export
• Secure email OTP authentication
• Admin dashboard for agricultural organizations

Thank you for using KRISHX. Your feedback helps improve our AI for all farmers.
```

---

*KRISHX Play Store Listing Package v1.0 | 2025 | © KRISHX Agriculture*
