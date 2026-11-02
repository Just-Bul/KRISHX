# KRISHX Smart Agriculture Platform
## Project Documentation

---

## ABSTRACT

KRISHX is an AI-powered smart agriculture platform developed as an Android mobile application that combines machine learning and deep learning technologies to assist smallholder and commercial farmers in making data-driven agricultural decisions. The platform integrates three core intelligent modules: (1) a soil and crop recommendation engine built on a RandomForest classifier trained on a tabular agronomic dataset of 50,000+ records, achieving over 97% soil classification accuracy; (2) a pest detection system powered by EfficientNetB4 transfer learning trained on 5,494 annotated images across 12 agricultural pest classes, achieving 93.06% validation accuracy; and (3) a fertilizer recommendation engine using nearest-neighbor NPK matching. The mobile application is built with React Native (Expo SDK 51) and communicates with a Python Flask REST API backend. The system incorporates a complete production-ready authentication system with JWT tokens, bcrypt password hashing, and OTP email verification. An administrative dashboard provides user management, prediction analytics, and platform oversight. The platform addresses the critical gap in affordable, accessible, AI-driven agricultural advisory tools for resource-constrained farmers in developing regions, with a deployment-ready architecture on Google Cloud Platform supporting both SQLite and PostgreSQL databases.

**Keywords:** Smart Agriculture, Transfer Learning, EfficientNetB4, RandomForest, Pest Detection, Crop Recommendation, React Native, Flask, Android Application

---

## 1. INTRODUCTION

### 1.1 Background

Agriculture remains the backbone of economies across Asia and Africa, employing over 60% of the population in countries like Bangladesh, India, and sub-Saharan Africa. Despite its critical importance, smallholder farmers — who account for 84% of all farms globally and produce 70% of the world's food — continue to face persistent challenges: unpredictable crop yields, inefficient fertilizer use, and devastating pest infestations that collectively cause losses of USD 220 billion annually (FAO, 2021).

The Fourth Industrial Revolution has introduced powerful AI tools into agriculture, a sector historically resistant to technological adoption. Computer vision, machine learning, and mobile computing have converged to create accessible tools that can be deployed on USD 100 smartphones in rural areas with intermittent internet connectivity.

KRISHX (from "Krishi", meaning agriculture in Sanskrit/Bengali) is a direct response to this opportunity: a production-ready AI agricultural assistant available as a free Android application, designed from the ground up for farmers and agricultural extension workers.

### 1.2 Motivation

- **Fertilizer waste:** 50–60% of fertilizer applied by smallholder farmers is misapplied due to lack of soil testing infrastructure.
- **Pest losses:** Insects, fungi, and weeds destroy 40% of crops globally. Early identification could reduce losses by up to 50%.
- **Advisory gap:** There is 1 agricultural extension officer per 1,500 farmers on average in developing countries (World Bank, 2020).
- **Mobile penetration:** Smartphone ownership in rural South Asia exceeded 58% in 2023, creating a delivery channel for AI-based advisory.

### 1.3 Project Overview

KRISHX delivers three AI services through a single mobile application:

| Feature | Technology | Accuracy |
|---|---|---|
| Soil Type Classification | RandomForest | 97%+ |
| Crop Recommendation | Rule-based + RF | Top-5 suggestions |
| Fertilizer Recommendation | Euclidean NPK matching | Context-aware |
| Pest Detection | EfficientNetB4 | 93.06% |
| Treatment Advice | Knowledge base | 12 pest classes |

---

## 2. PROBLEM STATEMENT

### 2.1 Core Problem

Farmers in resource-limited settings lack access to affordable, accurate, and timely agricultural advisory services. Traditional approaches — soil testing laboratories, agricultural extension officers, printed field guides — are expensive, slow, and geographically inaccessible.

### 2.2 Specific Problems Addressed

**Problem 1: Uninformed Crop Selection**
Farmers select crops based on tradition and neighbor behavior rather than current soil chemistry. This results in soil-crop mismatches, yield reduction of 20–40%, and soil degradation.

**Problem 2: Fertilizer Over/Under-application**
Without NPK soil testing or advisory, farmers apply generic fertilizers, causing nitrogen runoff (environmental damage) and phosphorous depletion (yield loss).

**Problem 3: Late Pest Identification**
By the time farmers visually identify a pest outbreak, 30–70% of a crop may already be damaged. Manual identification is error-prone, and agricultural consultants are expensive and unavailable in remote areas.

**Problem 4: No Historical Analysis**
Farmers have no mechanism to track which soil conditions, crops, and fertilizers performed best on their land over multiple seasons.

### 2.3 Gap Analysis

| Existing Solution | Limitation |
|---|---|
| Government helplines | Language barriers, slow response, unavailable 24/7 |
| Soil testing labs | Cost USD 15–50/test, 5–15 day turnaround |
| Agricultural apps (crop price only) | No AI intelligence, no pest detection |
| Research-grade AI tools | Require internet, expensive cloud APIs, not mobile-native |

---

## 3. EXISTING SYSTEM ANALYSIS

### 3.1 Current Agricultural Advisory Methods

**Traditional Systems:**
- Field extension officers visiting farms (1 per 1,500+ farmers)
- Paper-based soil test kits with limited accuracy
- Generic printed crop calendars and planting guides
- Farmer-to-farmer knowledge transfer (often inaccurate)

**Existing Digital Solutions:**
- **Plantix** (Germany): Pest detection via image recognition. Limitations: paid subscription, no soil/fertilizer intelligence, no offline mode, no admin system.
- **KRISHI VIGYAN** (India): Government portal. Limitations: web-only, no mobile app, no AI, only static content.
- **Farmerline** (Ghana): Market prices and weather. Limitations: no AI prediction, no pest detection.
- **AgroStar** (India): Input purchase + advisory. Limitations: commercial subscription model, India-specific crop data only.

### 3.2 Limitations of Existing Systems

1. **Siloed functionality** — no single platform covers soil + crop + fertilizer + pest together
2. **No local context** — models trained on data from one region fail in another
3. **Closed-source** — cannot be customized or extended by local agricultural institutions
4. **No admin visibility** — no platform dashboard for agricultural agencies to monitor usage
5. **Authentication barriers** — complex sign-up processes exclude low-literacy users
6. **No history tracking** — each session starts fresh with no longitudinal analysis

---

## 4. PROPOSED SYSTEM

### 4.1 KRISHX Architecture

KRISHX proposes an integrated AI agricultural platform with the following components:

```
┌─────────────────────────────────────────────────────┐
│              KRISHX Android Application             │
│                  (React Native Expo)                │
├──────────────┬─────────────────┬───────────────────┤
│  Auth Module │  AI Module      │  History Module   │
│  • Register  │  • Soil Predict │  • View Records   │
│  • OTP Verify│  • Crop Suggest │  • PDF Export     │
│  • Login     │  • Pest Detect  │  • Delete         │
│  • JWT       │  • Fertilizer   │                   │
└──────┬───────┴────────┬────────┴───────────────────┘
       │                │
       ▼                ▼
┌─────────────────────────────────────────────────────┐
│           Flask REST API (Python 3.11)              │
│  /auth/* | /predict | /pest-detect | /history/*    │
│  /user/* | /admin/* | /health                      │
├──────────────┬─────────────────┬───────────────────┤
│  RandomForest│  EfficientNetB4 │  SQLite/PostgreSQL│
│  Soil+Crop   │  Pest Detector  │  Database         │
│  97% acc     │  93.06% acc     │                   │
└──────────────┴─────────────────┴───────────────────┘
```

### 4.2 Key Innovations

1. **Two-model AI pipeline**: RF (tabular) + CNN (image) in a single unified API
2. **OTP-secured authentication**: No account lockout from forgotten passwords
3. **Offline-graceful UX**: App works in read-only mode when backend is unreachable
4. **Admin RBAC**: Role-based access control; admins see all data, users see only their own
5. **Production containerization**: Docker + Gunicorn + GCP deployment-ready
6. **PDF export**: Users can download prediction reports for offline reference

---

## 5. OBJECTIVES

### Primary Objectives
1. Design and implement an AI-powered soil and crop recommendation system with ≥95% classification accuracy on the training dataset
2. Develop an image-based pest detection system with ≥90% accuracy using transfer learning
3. Build a production-grade Android mobile application with complete user authentication including OTP verification
4. Integrate fertilizer recommendation using NPK profile matching
5. Implement a comprehensive admin dashboard for user and prediction management

### Secondary Objectives
1. Achieve sub-3-second end-to-end prediction latency on a standard Android device
2. Maintain a clean, accessible UI following Android Material Design principles
3. Implement JWT-based session management with auto-token-refresh
4. Provide prediction history with PDF export capability
5. Deploy the backend to Google Cloud Platform with HTTPS and production security

### Measurable Success Criteria

| Criterion | Target | Achieved |
|---|---|---|
| Soil classification accuracy | ≥ 95% | 97%+ |
| Pest detection accuracy | ≥ 90% | 93.06% |
| API response time (predict) | < 3s | ~1.5s avg |
| API response time (pest detect) | < 8s | ~4s avg |
| App startup time | < 3s | ~2s |
| Authentication coverage | 100% endpoints | ✅ |

---

## 6. SCOPE OF PROJECT

### 6.1 In-Scope

- Android mobile application (iOS not targeted)
- 12 pest classes: ants, bees, beetle, caterpillar, earthworms, earwig, grasshopper, moth, slug, snail, wasp, weevil
- Soil classification: Sandy, Loamy, Black, Red, Clayey soil types
- Crop recommendations for 22 common crops
- Fertilizer recommendation from a knowledge base of 40+ fertilizer products
- User authentication with email OTP verification
- Prediction history with cloud sync
- PDF report generation
- Admin panel with user and prediction management
- RESTful API with 15+ endpoints
- Google Cloud Platform deployment

### 6.2 Out-of-Scope

- iOS application
- Plant disease detection (separate from pest detection)
- Weather integration and forecasting
- Market price data
- IoT sensor integration
- Offline AI inference (all prediction requires server connection)
- Multi-language support (English only in v1.0)

---

## 7. METHODOLOGY

### 7.1 Development Approach

KRISHX follows an **Agile-Waterfall hybrid** methodology:
- Requirements gathered in a waterfall phase (weeks 1–2)
- Development in 4-week Agile sprints with iterative testing
- Final integration testing and documentation in waterfall phase (weeks 14–16)

### 7.2 Data Collection

**Pest Image Dataset:**
- Primary source: Curated agricultural pest image dataset from Kaggle and academic repositories
- 5,494 total images across 12 classes
- Training split: 4,399 images (80%)
- Validation split: 1,095 images (20%)
- Class balance range: 64–100 images per validation class

**Soil/Crop Dataset:**
- Source: Synthesized from ICAR (Indian Council of Agricultural Research) datasets
- 50,000+ rows of soil-crop-climate-fertilizer relationships
- Features: temperature, humidity, moisture, nitrogen, phosphorous, potassium
- Labels: soil type, crop, fertilizer

### 7.3 Model Development

**Phase 1: Data Preprocessing**
- Images: resize to 224×224, normalize with EfficientNet statistics (µ=[0.485, 0.456, 0.406], σ=[0.229, 0.224, 0.225])
- Tabular: LabelEncoder for categorical columns, train/test 80/20 split
- Augmentation: RandomRotation(±30°), RandomFlip, RandomZoom(±20%), brightness/contrast jitter, Gaussian noise, RandomCutout

**Phase 2: Model Training**
- Two-phase transfer learning for EfficientNetB4:
  - Phase 1: Freeze base network, train classification head (10 epochs)
  - Phase 2: Unfreeze top 100 layers, fine-tune with lower learning rate (20 epochs)
- RandomForest: Grid-searched hyperparameters, joblib cached with MD5 hash for reproducibility

**Phase 3: Evaluation**
- Holdout validation set (20%), never seen during training
- Metrics: accuracy, precision, recall, F1-score per class, confusion matrix
- Comparison: EfficientNetB4 vs EfficientNetB3 vs MobileNetV2

**Phase 4: API Integration**
- Flask REST API wrapping both models
- JWT authentication middleware
- Rate limiting and input validation

**Phase 5: Mobile Development**
- React Native Expo with navigation, state management, API integration
- UI testing on Android API 24–34 (Android 7.0–14.0)

---

## 8. SYSTEM ARCHITECTURE

*(See docs/03_SYSTEM_ARCHITECTURE.md for detailed diagrams)*

### 8.1 Three-Tier Architecture

KRISHX follows a classic three-tier architecture:

**Tier 1 — Presentation Layer (Android App)**
- React Native 0.74.1 with Expo SDK 51
- React Navigation (Stack + Bottom Tabs)
- Axios HTTP client with JWT interceptor and auto-refresh
- AsyncStorage + SecureStore for token persistence

**Tier 2 — Application Layer (Flask API)**
- Python 3.11 Flask application
- Gunicorn WSGI server (1 worker, 4 threads)
- JWT authentication, bcrypt password hashing
- In-memory login rate limiter
- CORS with configurable allowed origins
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)

**Tier 3 — Data Layer**
- SQLite (development / Cloud Run with persistent volume)
- PostgreSQL via psycopg2 (production Cloud SQL)
- ML model files (.h5, .pkl, .json) served from filesystem

### 8.2 Authentication Architecture

```
User → Register → [Pending Account Created]
             → OTP Email Sent (6 digits, 5 min TTL)
             → OTP Verified → Account Activated → JWT Issued

User → Login → [Credentials Verified] → JWT (24h) + Refresh (30d)
             → Auto-refresh on 401/TOKEN_EXPIRED
             → Logout → Tokens Cleared

User → Forgot Password → OTP Email → Verify OTP → Reset Token (15 min)
                                                  → New Password → Login
```

---

## 9. MODULE DESCRIPTION

### Module 1: Authentication System
**Files:** `mobile/src/screens/auth/`, `backend/auth.py`, `backend/email_service.py`
- User registration with email OTP verification (6 digits, 5-minute expiry)
- JWT access tokens (24 hours) + refresh tokens (30 days)
- Bcrypt password hashing with salt rounds
- Password reset via OTP email flow
- Rate limiting: 10 login attempts per IP per 15 minutes
- Resend OTP rate limiting: 3 requests per 30 minutes per email

### Module 2: Soil Analysis & Crop Recommendation
**Files:** `backend/model.py`, `mobile/src/screens/main/PredictionScreen.js`
- Input: Temperature (°C), Humidity (%), Moisture (%), N (kg/ha), P (kg/ha), K (kg/ha)
- Output: Predicted soil type, top-5 crop recommendations with confidence, fertilizer
- Model: RandomForest classifier trained on 50K+ records
- Caching: MD5 hash of CSV → joblib-serialized models (.pkl) for fast cold start
- Response time: < 500ms per prediction

### Module 3: Pest Detection
**Files:** `backend/pest_model.py`, `backend/optimized_model.py`, `mobile/src/screens/main/PestDetectionScreen.js`
- Input: JPEG/PNG image (any resolution, resized server-side)
- Output: Top pest class + confidence, treatment advice, organic control, prevention tips
- Model: EfficientNetB4 (18.7M parameters, 93.06% accuracy)
- Image processing: PIL resize → EfficientNet preprocessing → inference
- Knowledge base: `pest_data.py` maps each class to detailed treatment protocols

### Module 4: History & Reports
**Files:** `mobile/src/screens/main/HistoryScreen.js`, `backend/app.py`
- Full prediction audit trail stored per user
- Filter by date, sort by recency
- Individual record detail view with all parameters
- PDF export via expo-print/expo-sharing (soil predictions)
- Delete individual or bulk records
- Admin can view all users' histories

### Module 5: User Profile
**Files:** `mobile/src/screens/main/ProfileScreen.js`, `backend/app.py /user/*`
- View and edit: full name, phone number
- Change password (current + new password)
- View usage statistics: total predictions, pest detections, member since
- Profile photo support

### Module 6: Admin Dashboard
**Files:** `mobile/src/screens/admin/`, `backend/app.py /admin/*`
- Requires `is_admin=1` flag in user record
- Dashboard: total users, active users, total predictions, pest detections
- User management: view all users, toggle active/inactive
- Prediction management: view all predictions, delete records
- All admin actions logged to `admin_logs` table

---

## 10. DATASET DESCRIPTION

### 10.1 Pest Image Dataset

| Attribute | Value |
|---|---|
| Total Images | 5,494 |
| Training Set | 4,399 (80%) |
| Validation Set | 1,095 (20%) |
| Number of Classes | 12 |
| Image Format | JPEG, PNG |
| Input Resolution | 224 × 224 × 3 (after preprocessing) |

**Class Distribution (Validation Set):**

| Class | Samples | Precision | Recall | F1-Score |
|---|---|---|---|---|
| Ants | 99 | 96.97% | 96.97% | 96.97% |
| Bees | 100 | 94.34% | 100.0% | 97.09% |
| Beetle | 83 | 88.00% | 79.52% | 83.54% |
| Caterpillar | 86 | 86.30% | 73.26% | 79.25% |
| Earthworms | 64 | 81.33% | 95.31% | 87.77% |
| Earwig | 93 | 91.21% | 89.25% | 90.22% |
| Grasshopper | 97 | 90.72% | 90.72% | 90.72% |
| Moth | 99 | 97.06% | 100.0% | 98.51% |
| Slug | 78 | 94.44% | 87.18% | 90.67% |
| Snail | 100 | 98.04% | 100.0% | 99.01% |
| Wasp | 99 | 98.99% | 98.99% | 98.99% |
| Weevil | 97 | 93.27% | 100.0% | 96.52% |

### 10.2 Soil/Crop/Fertilizer Dataset

| Attribute | Value |
|---|---|
| Dataset File | `data_core.csv` |
| Total Records | 50,000+ |
| Input Features | 6 (Temp, Humidity, Moisture, N, P, K) |
| Output Classes | Soil Type, Crop, Fertilizer |
| Soil Types | Sandy, Loamy, Black, Red, Clayey |
| Supported Crops | 22 common crops |
| Fertilizer Options | 40+ fertilizer products |

---

## 11. MODEL TRAINING PROCESS

### 11.1 EfficientNetB4 Training Pipeline

**Architecture:**
```
Input (224×224×3)
    → EfficientNetB4 Backbone (18.7M parameters)
        [ImageNet pre-trained weights]
    → Global Average Pooling
    → Batch Normalization
    → Dropout (0.5)
    → Dense (1024, Swish activation)
    → Batch Normalization
    → Dropout (0.3)
    → Dense (512, Swish activation) + Residual skip
    → Dropout (0.2)
    → Dense (12, Softmax)
```

**Phase 1 — Head Training:**
- Frozen backbone, only head layers trained
- Optimizer: AdamW (lr=1e-3, weight_decay=1e-4)
- Loss: Categorical Cross-Entropy with label smoothing (0.1)
- Epochs: 10 (early stopping)
- Best val accuracy: **91.87%**

**Phase 2 — Fine-tuning:**
- Unfreeze top 100 layers of EfficientNetB4
- Optimizer: AdamW (lr=1e-5, weight_decay=1e-4)
- Loss: Same + L2 regularization
- Epochs: 20 (early stopping patience=5)
- Callbacks: ModelCheckpoint, ReduceLROnPlateau, CSVLogger
- Best val accuracy: **93.06%**

**Data Augmentation Pipeline:**
```python
RandomRotation(factor=0.3)          # ±30° rotation
RandomFlip('horizontal_and_vertical')
RandomZoom(height_factor=0.2)        # ±20% zoom
RandomBrightness(factor=0.3)
RandomContrast(factor=0.3)
GaussianNoise(stddev=0.05)
RandomCutout(mask_size=0.1)         # Information dropout
```

### 11.2 RandomForest Training Pipeline

**Steps:**
1. Load `data_core.csv` and compute MD5 hash
2. If cached `.pkl` files exist and hash matches → load (< 100ms)
3. If not → train fresh:
   - LabelEncode: soil_type, crop_type, fertilizer_type
   - Train RandomForestClassifier (n_estimators=100, max_depth=None)
   - Save models + encoders to `.pkl` files with hash stamp
4. Training time: ~45 seconds on first run

---

## 12. AI MODEL SELECTION JUSTIFICATION

### 12.1 Why EfficientNetB4?

EfficientNetB4 was selected over competing architectures after empirical comparison:

| Model | Parameters | Val Accuracy | Inference Time | Model Size |
|---|---|---|---|---|
| **EfficientNetB4** | **18.7M** | **93.06%** | **~45ms** | **~75MB** |
| EfficientNetB3 | 12.2M | 89.4% | ~35ms | ~48MB |
| MobileNetV2 | 3.4M | 84.7% | ~20ms | ~14MB |
| ResNet50 | 25.6M | 87.2% | ~60ms | ~98MB |
| VGG16 | 138M | 82.1% | ~120ms | ~528MB |

**Decision rationale:**
- EfficientNetB4 provides the best accuracy with acceptable model size (~75MB, fits in RAM on 2GB Android devices)
- EfficientNet compound scaling (depth × width × resolution) outperforms manual architecture search
- Pre-trained on ImageNet (1.4M images, 1000 classes) provides excellent transfer learning base
- 45ms inference latency on server GPU is acceptable for mobile UX (total API response ~3–5s including network)

### 12.2 Why RandomForest for Soil/Crop?

- **Tabular data advantage**: RF outperforms neural networks on structured/tabular data at this scale
- **No normalization needed**: Handles mixed scales of NPK (0–200) and temperature (10–50°C) natively
- **Feature importance**: Provides interpretable feature rankings for agricultural validation
- **Fast inference**: < 1ms prediction after model load
- **Caching**: MD5-based joblib caching ensures models aren't retrained unnecessarily

---

## 13. RESULTS AND ANALYSIS

### 13.1 Pest Detection Results

| Metric | Value |
|---|---|
| Overall Accuracy | 93.06% |
| Macro Precision | 92.56% |
| Macro Recall | 92.60% |
| Macro F1-Score | 92.44% |
| Weighted F1-Score | 92.93% |

**Best performing classes:** Snail (F1: 99.01%), Wasp (F1: 98.99%), Moth (F1: 98.51%)
**Lowest performing classes:** Caterpillar (F1: 79.25%), Beetle (F1: 83.54%)
**Analysis:** Lower accuracy for caterpillar and beetle is attributed to visual similarity with other larvae/insect classes and lower sample count (83–86 validation samples vs 99–100 for top classes).

### 13.2 Soil/Crop Recommendation Results

- Soil classification accuracy: 97%+
- Fertilizer recommendation: Rule-based (100% deterministic given soil profile)
- Crop confidence scores output as percentages for top-5 recommendations

### 13.3 System Performance

| Metric | Target | Actual |
|---|---|---|
| Prediction API response | < 3s | ~1.5s |
| Pest detection API | < 8s | ~4s (includes image upload) |
| App cold start | < 4s | ~2.5s |
| Authentication flow | < 2s | ~1.2s |
| History load (50 records) | < 2s | ~0.8s |

---

## 14. FUTURE SCOPE

1. **Expanded pest classes**: Scale from 12 to 100+ pest/disease classes including plant diseases (leaf blight, rust, mildew)
2. **Localization**: Bangla, Hindi, Tamil, Swahili language support
3. **Offline mode**: On-device TensorFlow Lite model for basic pest detection without internet
4. **Weather integration**: Real-time weather API for climate-adjusted crop recommendations
5. **IoT sensor support**: Direct integration with cheap NPK soil sensors (USD 15–30) via Bluetooth
6. **Satellite imagery**: NDVI analysis from Sentinel-2 free satellite data for crop health monitoring
7. **Multi-season history**: Year-over-year crop performance comparison per farm plot
8. **Marketplace integration**: Connect fertilizer/pesticide recommendations to local retailer inventory
9. **Farmer community**: Social features for region-based crop performance sharing

---

## 15. CONCLUSION

KRISHX demonstrates that production-quality AI agricultural intelligence is achievable within the scope of an academic final-year project. By combining classical machine learning (RandomForest at 97%+ accuracy) with modern deep learning (EfficientNetB4 at 93.06% accuracy), the platform addresses three distinct agricultural challenges — soil analysis, crop selection, and pest identification — in a single, cohesive mobile application.

The system is not merely a prototype: it incorporates a complete production authentication system with OTP email verification, JWT token management, role-based access control, comprehensive prediction history, PDF export, an administrative dashboard, and a Google Cloud Platform deployment pipeline.

The platform is positioned to serve the 570 million smallholder farmer households globally who currently lack access to affordable, AI-powered agricultural advisory — representing a significant social impact opportunity and a viable path to commercial sustainability.

---

*Document Version: 1.0 | Project: KRISHX Agriculture | Academic Year: 2024–2025*
