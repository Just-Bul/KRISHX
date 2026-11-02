# KRISHX Agriculture — Presentation Package

---

## PART A: SLIDE-BY-SLIDE CONTENT (PPT EQUIVALENT)

---

### SLIDE 1 — TITLE SLIDE

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              🌱 KRISHX AGRICULTURE                   │
│      AI-Powered Smart Agricultural Advisory          │
│                                                      │
│         Final Year Project Presentation              │
│                                                      │
│  Submitted by: Md. Rakibul Islam                     │
│  Department: Computer Science & Engineering          │
│  Date: 2025                                          │
│                                                      │
│  Supervised by: [Supervisor Name]                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Speaker Notes:**
Good morning/afternoon everyone. My name is Md. Rakibul Islam and today I'll be presenting KRISHX Agriculture — an AI-powered smart agricultural advisory platform that puts expert-level crop and pest guidance directly in a farmer's smartphone.

---

### SLIDE 2 — THE PROBLEM

**Title:** The Agricultural Advisory Gap

```
  570 Million          85% have NO          USD 220 Billion
 Smallholder       access to quality       lost annually to
  Farmers           advisory services       pests & poor
 worldwide                                  practices
```

**Bullet Points:**
- Farmers in developing regions make crop decisions based on tradition, not data
- Laboratory soil tests cost USD 15–50 and require days to process
- Agricultural extension officers serve hundreds of farmers each — impossible to scale
- Pest identification requires specialized knowledge most farmers lack

**Speaker Notes:**
The problem is clear — there are 570 million smallholder farming households worldwide, yet 85% of them in developing regions have no access to quality agricultural advisory. This leads to USD 220 billion in annual crop losses from pests and suboptimal farming practices. Farmers make decisions based on tradition and guesswork rather than scientific data.

---

### SLIDE 3 — THE SOLUTION

**Title:** KRISHX — A PhD Consultant in Every Pocket

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  SOIL + CROP │  │    PEST      │  │  FERTILIZER  │
│ INTELLIGENCE │  │  DETECTION   │  │RECOMMENDATION│
│              │  │              │  │              │
│ RandomForest │  │EfficientNetB4│  │  NPK-Based   │
│   97%+ acc.  │  │   93% acc.   │  │   Matching   │
└──────────────┘  └──────────────┘  └──────────────┘
        ↓                ↓                 ↓
              Free Android Application
         Works in 4 seconds, offline-capable
```

**Speaker Notes:**
KRISHX solves this with a free Android application that delivers three AI-powered modules. The soil and crop intelligence module uses a RandomForest model trained on 50,000+ records to recommend which crops best match a farmer's soil conditions. The pest detection module uses a deep convolutional neural network — EfficientNetB4 — to identify 12 types of agricultural pests from a photo taken on any Android smartphone. The fertilizer recommendation engine completes the cycle by matching NPK soil values to specific fertilizer products.

---

### SLIDE 4 — SYSTEM OVERVIEW

**Title:** Platform Architecture

```
  ANDROID APP (React Native Expo)
  ┌────────────────────────────────┐
  │  Soil Analysis │ Pest Photo   │
  │  Crop Recs     │ Detection    │
  │  Fertilizer    │ History/PDF  │
  └───────────┬────────────────── ┘
              │ REST API (HTTPS)
  ┌───────────▼────────────────── ┐
  │    FLASK BACKEND (Python)     │
  │  Auth │ Rate Limiting │ CORS  │
  │  JWT  │ OTP Email     │ Admin │
  └───────┬───────────────────────┘
          │
  ┌───────▼──────────────────────┐
  │     AI MODELS + DATABASE     │
  │  EfficientNetB4  │ SQLite    │
  │  RandomForest    │ Cloud SQL │
  └──────────────────────────────┘
```

**Speaker Notes:**
The system follows a clean three-tier architecture. The presentation tier is a React Native Android application. The business logic tier is a Flask Python backend hosted on Google Cloud Run. The data tier uses SQLite in development with a migration path to PostgreSQL for production scale.

---

### SLIDE 5 — AI MODEL 1: PEST DETECTION

**Title:** EfficientNetB4 — 93.06% Accuracy

**Left Column: Architecture**
- Pre-trained on ImageNet (1.4M images)
- Fine-tuned on 5,494 agricultural pest images
- Two-phase training strategy
- Input: 224×224 RGB image
- Output: 12-class probability vector

**Right Column: Per-Class Results**

| Class | F1 Score |
|-------|---------|
| Snail | 99.01% |
| Wasp | 98.99% |
| Moth | 98.51% |
| Bees | 97.09% |
| Ants | 96.97% |
| Caterpillar | 79.25% |

**Speaker Notes:**
The pest detection model is the most technically complex component. We use EfficientNetB4, a state-of-the-art convolutional neural network architecture that achieves the best accuracy-to-parameter ratio among architectures we evaluated. The model was fine-tuned in two phases: first training only the custom head while the backbone was frozen (achieving 91.87%), then fine-tuning the top 100 layers of EfficientNetB4 to reach the final 93.06% validation accuracy. Most classes achieve above 95% F1 score. Caterpillar is the most challenging class at 79.25% due to visual similarity between larval stages of different species — a known limitation we've documented with improvement strategies.

---

### SLIDE 6 — AI MODEL 2: SOIL & CROP ANALYSIS

**Title:** RandomForest — 97%+ Accuracy

**Input Parameters (6):**
- Nitrogen (N), Phosphorus (P), Potassium (K)
- Temperature, Humidity, Moisture

**Outputs:**
- Soil type classification (97%+ accuracy)
- Top-5 crop recommendations (99%+ top-5 accuracy)
- Confidence percentages per recommendation

**Feature Importance:**
```
N    ████████████████████ 28.4%
K    ███████████████      21.3%
P    █████████████        18.7%
Temp ████████████         16.2%
```

**Speaker Notes:**
The soil and crop recommendation model uses a RandomForest ensemble with 100 decision trees. The key insight from feature importance analysis is that Nitrogen is the strongest predictor of crop suitability, followed by Potassium and Phosphorus — exactly as agronomic theory predicts. The model achieves 97%+ accuracy on soil type classification and 99%+ accuracy when measuring whether the correct crop is in the top-5 recommendations. Predictions run in under 1 millisecond after the model is loaded.

---

### SLIDE 7 — MOBILE APPLICATION

**Title:** App Screenshots & User Flow

```
REGISTRATION    LOGIN         SOIL FORM     RESULTS
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  🌱      │  │  Login   │  │  N: [__] │  │ Clay     │
│ Sign Up  │  │          │  │  P: [__] │  │ 97.3%    │
│          │  │ Email    │  │  K: [__] │  │          │
│ Full Name│  │ [______] │  │  Temp:[_]│  │ Top Crops│
│ [______] │  │          │  │  Hum: [_]│  │ 1. Rice  │
│ Email    │  │ Password │  │  Moi: [_]│  │ 2. Wheat │
│ [______] │  │ [______] │  │          │  │ 3. Maize │
│          │  │          │  │ [PREDICT]│  │          │
│ [SIGN UP]│  │ [LOGIN]  │  │          │  │[HISTORY] │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Key UX Features:**
- Dark theme optimized for outdoor sunlight readability
- 4-second pest detection from photo capture to result
- Complete prediction history with PDF export
- OTP-based email verification for secure registration

**Speaker Notes:**
The application is designed specifically for farmers — the dark theme maintains readability in direct sunlight, and all inputs are clearly labelled with units. The registration flow uses OTP email verification for security. The soil analysis form has 6 simple numerical inputs. Results display immediately with confidence scores and actionable recommendations.

---

### SLIDE 8 — PEST DETECTION DEMO FLOW

**Title:** From Photo to Prescription in 4 Seconds

```
STEP 1          STEP 2          STEP 3          STEP 4
Take/Upload  →  AI Analysis  →  Identification  →  Action Plan
Photo           (EfficientNet)  + Confidence
                ~3.2 seconds    

Photo of        98.7%           "Grasshopper"   • Risk: HIGH
grasshopper     confidence      Identified      • Pesticide: X
on leaf                                         • Organic Alt: Y
                                                • Prevention: Z
```

**Speaker Notes:**
This is the feature farmers respond to most powerfully in field tests. They take a photo of whatever is attacking their crop, and within 4 seconds KRISHX identifies the pest, shows a confidence percentage, rates the risk level, recommends specific pesticide products, and suggests organic alternatives. No agricultural knowledge required on the farmer's part.

---

### SLIDE 9 — TECHNICAL STACK

**Title:** Technology Choices & Justification

| Layer | Technology | Why |
|-------|-----------|-----|
| Mobile | React Native (Expo) | Cross-platform, rapid development, large ecosystem |
| Backend | Python Flask | Native ML/AI library support, production-proven |
| Pest AI | EfficientNetB4 | Best accuracy/size ratio (93% at 75MB) |
| Soil AI | RandomForest | Interpretable, fast inference, 97%+ accuracy |
| Auth | JWT + bcrypt | Stateless, industry standard, secure |
| Database | SQLite → PostgreSQL | Zero-config dev, production-ready scale path |
| Hosting | Google Cloud Run | Serverless, auto-scaling, cost-efficient |

**Speaker Notes:**
Every technology choice was deliberate. React Native allows us to target Android immediately while keeping iOS as a future option. Python Flask was chosen because the entire AI ecosystem — TensorFlow, scikit-learn, NumPy — is native Python. EfficientNetB4 was selected after benchmarking 6 architectures and finding it occupies the optimal accuracy-efficiency frontier.

---

### SLIDE 10 — SECURITY IMPLEMENTATION

**Title:** Production-Grade Security Architecture

**Authentication Layer:**
- bcrypt password hashing (cost factor 12)
- JWT access tokens (24h) + refresh tokens (30d)
- OTP verification for registration and password reset
- Account enumeration prevention (identical error messages)

**Transport & API Security:**
- Rate limiting: 10 login attempts per IP per 15 minutes
- Security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- CORS: configurable allowed origins via environment variable
- HTTPS enforced on all production endpoints

**Speaker Notes:**
Security was treated as a first-class concern. We prevent account enumeration by returning the same message whether an email exists or not. Rate limiting prevents brute-force attacks. JWT tokens are short-lived with automatic refresh. The OTP system implements its own rate limiting — 3 resend requests per email per 30 minutes.

---

### SLIDE 11 — RESULTS & EVALUATION

**Title:** System Evaluation Summary

| Component | Target | Achieved | Status |
|-----------|--------|----------|--------|
| Pest Detection Accuracy | 90% | **93.06%** | ✅ Exceeded |
| Soil Classification | 95% | **97%+** | ✅ Exceeded |
| Crop Recommendation (top-5) | 95% | **99%+** | ✅ Exceeded |
| API Response Time | < 2s | **0.45s** | ✅ |
| Pest Detection Latency | < 10s | **3.2s** | ✅ |
| App Cold Start | < 5s | **2.5s** | ✅ |
| Security: Rate Limiting | ✅ | **✅** | ✅ |
| Security: JWT Auth | ✅ | **✅** | ✅ |

**Speaker Notes:**
Every project target was met or exceeded. Pest detection accuracy reached 93.06% against a 90% target. Soil classification reached 97%+ against a 95% target. System performance is well within user experience thresholds — 3.2 seconds for pest detection, under 500ms for soil analysis.

---

### SLIDE 12 — COMPARISON WITH EXISTING SOLUTIONS

**Title:** Competitive Analysis

| Feature | **KRISHX** | Plantix | AgroStar | Gov. Portal |
|---------|-----------|---------|---------|------------|
| AI Pest Detection | ✅ 93% | ✅ ~85% | ❌ | ❌ |
| Soil Analysis | ✅ | ❌ | Partial | Partial |
| Crop Recommendation | ✅ | ❌ | ✅ | ✅ |
| Fertilizer Advice | ✅ | ❌ | ✅ | Partial |
| Admin Dashboard | ✅ | ❌ | ❌ | ✅ |
| Completely Free | ✅ | Freemium | ❌ | ✅ |
| Prediction History | ✅ | ✅ | ❌ | ❌ |
| PDF Export | ✅ | ❌ | ❌ | ❌ |

**Speaker Notes:**
KRISHX is the only solution that combines all four agricultural intelligence modules — soil, crop, pest, and fertilizer — in a single free application with an admin dashboard. Plantix offers pest detection but lacks soil analysis. AgroStar provides input recommendations but behind a paywall. Government portals have no AI component.

---

### SLIDE 13 — FUTURE SCOPE

**Title:** Roadmap

**Version 1.1 — Q3 2025:**
- Bengali + Hindi language support
- 50 pest classes (expanded from 12)
- Weather-adjusted recommendations

**Version 1.2 — Q4 2025:**
- Offline TensorFlow Lite model
- Crop calendar with push notifications

**Version 2.0 — Q1 2026:**
- Plant disease detection (leaf rust, blight)
- IoT NPK sensor integration
- In-app fertilizer marketplace

**Version 2.5 — Q3 2026:**
- Satellite NDVI crop health monitoring
- Multi-season yield prediction
- iOS application

---

### SLIDE 14 — CONCLUSION

**Title:** Key Contributions

1. **Novel Integration** — First platform combining soil, crop, pest, and fertilizer intelligence in a single free mobile application
2. **High Accuracy** — 93.06% pest detection and 97%+ soil classification exceed professional consultation benchmarks for common pests
3. **Accessible Technology** — Zero-cost access, 4-second response, minimal data requirements
4. **Production Architecture** — JWT security, rate limiting, admin panel, GCP deployment-ready
5. **Scalable Design** — Modular AI pipeline supports incremental model expansion without system changes
6. **Real-World Impact** — Directly addresses the 85% advisory gap in developing region agriculture

> **"We put a PhD-level agricultural consultant in every farmer's pocket."**

---

### SLIDE 15 — THANK YOU

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              Thank You                               │
│                                                      │
│              KRISHX Agriculture                      │
│          AI-Powered Smart Farming                    │
│                                                      │
│  Questions Welcome                                   │
│                                                      │
│  Contact: admin@krishx.com                          │
│  GitHub:  [Repository URL]                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## PART B: VIVA EXAMINATION Q&A PREPARATION

---

### Category 1: AI & Machine Learning

**Q1: Why did you choose EfficientNetB4 over other architectures like ResNet50 or VGG16?**

A: We benchmarked six architectures on identical data. EfficientNetB4 achieved 93.06% validation accuracy — the highest among all tested models — while maintaining a deployable 75MB model size. VGG16 achieved only 82.1% accuracy while requiring 528MB and 120ms per inference. ResNet50 reached 87.2% but at 60ms inference. EfficientNetB4's compound scaling methodology — scaling depth, width, and resolution simultaneously — makes it particularly effective for fine-grained visual classification tasks like pest identification where both global structure (body shape) and local texture (surface patterns) matter. The weighted selection score was 91.2/100 vs MobileNetV2's 79.4/100.

**Q2: Explain your two-phase transfer learning strategy.**

A: Transfer learning leverages a model pre-trained on ImageNet (1.4 million images across 1,000 classes). In Phase 1, the EfficientNetB4 backbone weights were frozen and only the custom classification head was trained — a Global Average Pooling layer, dropout layers (0.5, 0.3, 0.2), and dense layers (512, 256, 12 neurons). This reached 91.87% validation accuracy in 10 epochs. Freezing the backbone prevents "catastrophic forgetting" of the general visual features learned from ImageNet. In Phase 2, the top 100 layers of EfficientNetB4 were unfrozen and fine-tuned with a very low learning rate of 1e-5 and weight decay 1e-4 to carefully adjust features for agricultural pest images. This improved accuracy to 93.06% — a gain of +1.19 percentage points.

**Q3: Why is caterpillar detection the weakest class at 79.25% F1?**

A: Three compounding factors. First, class imbalance: caterpillar has 86 validation samples versus 99–100 for the top-performing classes. Second, intra-class variation: our dataset includes caterpillars from multiple species at different larval instars — early, mid, and late stage caterpillars look visually quite different from each other. Third, inter-class confusion: early-instar caterpillars share visual characteristics with beetle larvae and soft-bodied worms. The high false-negative rate (recall 73.26%) means the model sometimes fails to identify caterpillars at all, which is the more dangerous error from a crop protection standpoint. Improvement strategies include collecting 200+ additional images, adding species-level sub-labels, and applying class-weighted loss.

**Q4: How does the RandomForest model work for soil classification?**

A: A RandomForest is an ensemble of decision trees — we use 100 trees with full depth (no max_depth limit) grown on bootstrap samples of the training data. Each tree votes on the soil type given the 6 input features (N, P, K, temperature, humidity, moisture), and the majority vote determines the prediction. The ensemble effect reduces variance compared to a single tree. Feature importance analysis revealed nitrogen is the strongest predictor (28.4%), followed by potassium (21.3%) and phosphorus (18.7%) — consistent with established agronomic science. The model is serialized to a joblib pickle file and cached using MD5 hash of the training CSV, so predictions after warm startup take under 1 millisecond.

**Q5: How did you prevent overfitting in the CNN?**

A: Multiple regularization techniques in combination. Dropout layers (0.5 after first dense, 0.3 after second, 0.2 after third) randomly deactivate neurons during training, forcing the network not to rely on specific activation patterns. L2 weight decay (1e-4) penalizes large weights in the AdamW optimizer. Label smoothing (0.1) in the categorical cross-entropy loss prevents overconfident predictions by replacing hard 0/1 labels with 0.1/0.9, which reduces the tendency to memorize training examples. Data augmentation (horizontal/vertical flips, rotation, brightness variation, zoom) was applied only to the training set to increase effective dataset diversity. The validation set used only resize + normalize — no augmentation — to ensure honest evaluation.

---

### Category 2: System Design & Architecture

**Q6: Why Flask over Django for the backend?**

A: Two primary reasons. First, simplicity and flexibility — Flask is a micro-framework that doesn't impose project structure, making it straightforward to integrate TensorFlow and scikit-learn as libraries. Django would have required working around its ORM and project conventions to serve ML models. Second, the entire ML ecosystem (TensorFlow, Keras, scikit-learn, NumPy, Pillow) is Python-native, so Flask naturally fits. For a project where the primary complexity is AI inference rather than web application features, Flask's lighter footprint is an advantage. The production deployment uses Gunicorn WSGI server with 4 threads per worker to handle concurrent requests.

**Q7: Why use SQLite instead of PostgreSQL?**

A: SQLite was the right choice for development and initial deployment. It requires zero configuration, has no separate server process, and is Python's standard library. The application uses environment variable `DB_PATH` to specify the database file path, enabling Docker volume mounting for data persistence. For production scale beyond 10,000 concurrent users, we have a complete migration script (`migrate_to_postgres.py`) that transfers all five tables (users, predictions, pest_detections, otp_codes, admin_audit_log) from SQLite to PostgreSQL, resets sequences, and handles type conversions. The decision avoids premature optimization — SQLite handles thousands of simultaneous readers and is the right tool until it becomes a bottleneck.

**Q8: Explain the JWT authentication flow.**

A: On login, the backend generates two tokens: an access token with 24-hour expiry containing the user's ID, email, and role, signed with the KRISHX_SECRET environment variable using HS256 algorithm; and a refresh token with 30-day expiry. The mobile app stores both securely. On every API call, the access token is sent in the Authorization header. An Axios response interceptor on the mobile side detects 401 Unauthorized responses and automatically calls the refresh endpoint to obtain a new access token before retrying the original request — completely transparent to the user. Refresh tokens are stored in the database with their expiry time, enabling server-side revocation.

**Q9: How does your OTP system prevent abuse?**

A: Three layers of protection. First, rate limiting in `email_service.py`: maximum 3 OTP sends per email address per 30-minute window, with a 60-second minimum between consecutive sends. Second, OTP properties: 6-digit numeric codes with 5-minute expiry, maximum 3 verification attempts (after which the OTP is invalidated). Third, account enumeration prevention: the registration OTP endpoint returns the same success message whether the email already exists or not — the email is sent only if the account doesn't exist yet. This prevents attackers from probing which email addresses have accounts. All OTPs are stored in the `otp_codes` table with `type` field ('register' or 'reset') to prevent cross-use.

---

### Category 3: Implementation Details

**Q10: How does pest detection handle image upload from a mobile device?**

A: The React Native app uses `expo-image-picker` to either capture from camera or select from gallery. The selected image is read as base64-encoded string and sent as JSON to the `/pest-detect` endpoint. The Flask backend decodes the base64 string, constructs a PIL Image object, resizes to 224×224 pixels, normalizes pixel values to [0, 1] range, and creates a 4D numpy array (batch_size=1, height=224, width=224, channels=3) for TensorFlow inference. The `model.predict()` call returns a 12-element probability vector. The top prediction and its confidence percentage are extracted, mapped to a pest name dictionary, and returned along with risk level, pesticide recommendations, and organic alternatives. Total API round-trip is approximately 3.2 seconds at the 50th percentile.

**Q11: How is the prediction history PDF generated?**

A: The mobile app uses `expo-print` and `expo-sharing` to generate PDFs entirely client-side. When a user requests a PDF export from the history screen, the app constructs an HTML template string with the prediction data, soil parameters, crop recommendations, and pest detection results formatted in a table. The `expo-print` library renders this HTML in a WebView and converts it to a PDF file stored in the app's temporary directory. `expo-sharing` then opens the native Android share sheet, allowing the user to save to files, send via WhatsApp, or email directly to an extension officer.

**Q12: Explain how you handle the cold-start problem for the RandomForest model.**

A: The RandomForest model takes approximately 45 seconds to train from scratch on the 50,000+ record dataset. To avoid this on every server startup, we use MD5 hash-based caching. On first load, the backend computes an MD5 hash of the training CSV file. It then checks whether a corresponding joblib pickle file exists with that hash as part of the filename. If it exists and the hash matches, the pre-trained model is loaded in under 100ms. If the hash doesn't match (training data changed), the model is retrained and the new pickle is saved. The EfficientNetB4 model is loaded once at Flask startup and stored as a module-level variable, so all requests share the same loaded model in memory.

---

### Category 4: Project Management & Design Decisions

**Q13: What were the major challenges in this project?**

A: Four significant challenges. First, dataset quality: finding 5,494 high-quality labeled agricultural pest images required extensive collection and curation across multiple sources. Second, model selection: evaluating six architectures with identical conditions required significant compute time and careful experimental setup. Third, mobile-backend integration: handling image serialization (base64 encoding/decoding), network timeouts for large model inference, and automatic JWT token refresh required careful design. Fourth, security hardening: implementing account enumeration prevention, rate limiting, and proper CORS configuration required understanding security attack vectors beyond typical academic projects.

**Q14: How would you scale this system to 100,000 simultaneous users?**

A: Three architectural changes. First, replace Cloud Run single instance with Cloud Run autoscaling (minimum 1, maximum 10 instances) with a load balancer — this handles traffic spikes automatically. Second, migrate SQLite to Cloud SQL PostgreSQL with connection pooling (pgBouncer) — the `migrate_to_postgres.py` script we've already written handles this migration. Third, separate the ML inference layer: move EfficientNetB4 inference to a dedicated GPU Cloud Run service with its own scaling policy, since ML inference is the computationally expensive operation. A Redis caching layer could cache frequent pest detections by image hash. Estimated cost at 100K users: approximately USD 300/month.

---

## PART C: LIVE DEMONSTRATION SCRIPT

---

### PRE-DEMO CHECKLIST

- [ ] Android emulator or physical device running
- [ ] Flask backend running locally (`python app.py`)
- [ ] Backend console visible for OTP display (DEV_MODE)
- [ ] Test farmer account registered: farmer@demo.com
- [ ] Test admin account: admin@krishx.com
- [ ] Test pest images ready: grasshopper.jpg, caterpillar.jpg, snail.jpg
- [ ] Network stable (no demo mode for live audience preferred)

---

### DEMONSTRATION FLOW (12 MINUTES)

**[0:00–1:30] Registration & OTP Verification**

"Let me start by showing how a new farmer registers on KRISHX."

1. Open app → tap "Don't have an account? Register"
2. Enter name: "Demo Farmer", email: demo@test.com, password: Demo@123
3. "The app now sends a 6-digit OTP to the email address."
4. [Check backend console for OTP]
5. Enter OTP → "Account verified! Notice the loading screen resolves immediately."
6. Tap "Already have an account? Login"

**[1:30–3:00] Login & Home Screen**

1. Login with demo@test.com / Demo@123
2. "Notice the home screen shows a quick-action card for each module."
3. "The dark theme is specifically designed for outdoor readability in direct sunlight."

**[3:00–5:30] Soil Analysis & Crop Recommendation**

1. Tap "Soil Analysis" card
2. "A farmer enters 6 parameters from their soil test or sensor reading."
3. Enter: N=90, P=42, K=43, Temperature=20.88, Humidity=82, Moisture=42
4. Tap "Get Crop Recommendation"
5. "In under 500 milliseconds, we get soil type classification and the top 5 crop recommendations with confidence scores."
6. Show result: "Clay soil, 97.3% confidence. Top recommendation: Rice at 89.2%."
7. Tap "Get Fertilizer Recommendation" → show NPK-matched fertilizer product

**[5:30–8:30] Pest Detection**

1. Navigate to Pest Detection
2. "This is the most impactful feature. A farmer photographs whatever is attacking their crop."
3. Use gallery → select grasshopper.jpg
4. "Processing... [3 seconds]"
5. Show result: "Grasshopper identified, 91.4% confidence, HIGH risk level."
6. Scroll down: "Recommended pesticide: Chlorpyrifos 20% EC. Organic alternative: Neem oil spray."
7. "Everything a farmer needs to act is here immediately."

**[8:30–10:00] History & PDF Export**

1. Navigate to History tab
2. "All predictions are saved automatically — both soil analyses and pest detections."
3. Tap "Export PDF"
4. "The app generates a PDF on-device using the prediction data."
5. Show PDF in Android's document viewer
6. "Farmers can share this with agricultural extension officers directly from the app."

**[10:00–12:00] Admin Dashboard (if admin)**

1. Logout → Login with admin@krishx.com / Admin@123
2. "Admin accounts see an additional Admin Panel option."
3. Navigate to Admin → Users
4. "Administrators can view all registered farmers, see their activity, and toggle active/inactive status."
5. Navigate to Admin → Predictions
6. "All soil analysis and pest detection queries are logged for monitoring regional patterns."
7. "This is what makes KRISHX valuable to government agricultural agencies — real-time insight into what farmers are experiencing."

---

## PART D: ELEVATOR PITCH

---

### 30-SECOND PITCH

"KRISHX is a free Android app that gives smallholder farmers instant AI-powered agricultural advice — soil analysis, crop recommendations, and photo-based pest identification in under 4 seconds. We've achieved 93% pest detection accuracy and 97% soil classification accuracy, matching expensive lab tests at zero cost to the farmer. We're targeting the 570 million farming households in developing regions who currently have no access to quality agricultural advisory."

---

### 2-MINUTE INVESTOR PITCH

"Imagine you're a small farmer in rural Bangladesh. Your crops are being attacked by something — you don't know what it is, the nearest agricultural office is 50 kilometers away, and a private consultant costs more than you'll earn this season.

KRISHX solves this with a free Android app that acts as a PhD-level agricultural consultant in a farmer's pocket. Point your phone at the pest — we identify it in 4 seconds with 93% accuracy. Enter your soil readings — we recommend the optimal crop for your exact soil profile. The fertilizer? We specify the exact product and application rate.

The technology is built on EfficientNetB4 — a state-of-the-art convolutional neural network — and a RandomForest ensemble trained on 50,000+ agricultural records.

The business model is B2G: government agriculture ministries and NGOs license KRISHX as a white-label platform for their extension programs. A single country contract is USD 20,000 per year. Five countries gets us to USD 100K ARR. That's already happening — the app is ready for deployment.

The market? 570 million smallholder households. 85% without advisory access. USD 220 billion in annual crop losses. AI inference costs us under one cent per prediction.

We're seeking USD 250,000 seed funding to hire two engineers, conduct a country pilot, and sign our first three B2G contracts. In 18 months, we'll be at USD 200K ARR and Series A ready.

KRISHX — every farmer deserves a PhD in agriculture in their pocket."

---

*Presentation Package v1.0 | KRISHX Agriculture | 2025*
