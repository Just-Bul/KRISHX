# KRISHX Mobile App — Setup & Build Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | comes with Node |
| Expo CLI | latest | `npm install -g expo-cli` |
| EAS CLI | latest | `npm install -g eas-cli` |
| Android Studio | latest | https://developer.android.com/studio (for emulator only) |

---

## 1. Install Dependencies

```bash
cd AI_AGRI-master/mobile
npm install
```

---

## 2. Configure Backend URL

Open `src/services/api.js` and update `BASE_URL`:

```js
// Android Emulator (maps to localhost on host machine)
export const BASE_URL = 'http://10.0.2.2:5000';

// Real Android Device (use your PC's local network IP)
export const BASE_URL = 'http://192.168.1.X:5000';

// Production server
export const BASE_URL = 'https://your-production-server.com';
```

Find your PC's IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

---

## 3. Start the Backend

```bash
cd AI_AGRI-master/backend
python app.py
```

Backend runs at http://localhost:5000

**Default admin credentials:**
- Email: `admin@krishx.com`
- Password: `Admin@123`

---

## 4. Run on Android Emulator / Device

```bash
cd mobile
npx expo start --android
```

Or scan the QR code with **Expo Go** app on your phone.

---

## 5. Build APK (for testing / side-loading)

### Option A: Expo Go (no build needed)
- Install **Expo Go** from Play Store
- Run `npx expo start` and scan QR

### Option B: Local APK build (requires Android Studio)
```bash
npx expo run:android
```
APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option C: EAS Build (cloud — no Android Studio needed)

1. Create Expo account at https://expo.dev
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Build APK:
   ```bash
   eas build -p android --profile preview
   ```
5. Download APK from Expo dashboard

### Option D: Play Store AAB
```bash
eas build -p android --profile production
```
Then submit: `eas submit -p android`

---

## 6. App Structure

```
mobile/
├── App.js                    # Entry point with navigation + providers
├── app.json                  # Expo config (name, package, permissions)
├── eas.json                  # EAS build profiles
├── package.json              # Dependencies
└── src/
    ├── theme/index.js        # Colors, fonts, spacing, shadows
    ├── context/AppContext.js # Global state (auth, dark mode, toast)
    ├── services/api.js       # All HTTP API calls (axios + auto-refresh)
    ├── utils/
    │   ├── storage.js        # SecureStore (tokens) + AsyncStorage
    │   └── validators.js     # Form validation helpers
    ├── navigation/
    │   └── AppNavigator.js   # Root/Auth/Main/Admin navigation stacks
    ├── components/
    │   └── ToastMessage.js   # Global toast notification overlay
    └── screens/
        ├── SplashScreen.js          # Animated brand splash
        ├── auth/
        │   ├── LoginScreen.js       # Email/password + remember me
        │   ├── RegisterScreen.js    # Full registration form
        │   └── ForgotPasswordScreen.js
        ├── main/
        │   ├── HomeScreen.js        # Dashboard with stats + recent
        │   ├── PredictionScreen.js  # 6-field input form
        │   ├── ResultScreen.js      # Soil + crop + pest + fertilizer
        │   ├── HistoryScreen.js     # Searchable prediction history
        │   ├── ProfileScreen.js     # User info + edit + password
        │   └── SettingsScreen.js    # Dark mode + notifications + about
        └── admin/
            ├── AdminHomeScreen.js        # Stats dashboard
            ├── AdminUsersScreen.js       # User management
            └── AdminPredictionsScreen.js # All predictions + delete
```

---

## 7. Backend API Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | No | Create user account |
| `/auth/login` | POST | No | Login → JWT tokens |
| `/auth/refresh` | POST | No | Refresh access token |
| `/auth/forgot-password` | POST | No | Send reset email |
| `/user/profile` | GET/PUT | JWT | View/edit profile |
| `/user/password` | PUT | JWT | Change password |
| `/user/stats` | GET | JWT | Personal analytics |
| `/predict` | POST | Optional | All-in-one AI prediction |
| `/history` | GET | JWT | User's prediction history |
| `/history/:id` | DELETE | JWT | Delete a record |
| `/admin/dashboard` | GET | Admin | System-wide stats |
| `/admin/users` | GET | Admin | All users list |
| `/admin/users/:id/status` | PUT | Admin | Enable/disable user |
| `/admin/predictions` | GET | Admin | All predictions |
| `/admin/predictions/:id` | DELETE | Admin | Delete prediction |

---

## 8. Key Features Implemented

### Authentication
- ✅ JWT access + refresh tokens (stored in SecureStore)
- ✅ bcrypt password hashing
- ✅ Remember Me (email saved in AsyncStorage)
- ✅ Auto token refresh on expiry
- ✅ Admin role detection (auto-routes to admin panel)

### Prediction System
- ✅ 6 inputs only (no soil type dropdown)
- ✅ AI auto-predicts soil type (k-NN classifier)
- ✅ Top 5 crop recommendations with confidence %
- ✅ 4 pests per crop with symptoms + chemical/organic treatments
- ✅ Fertilizer NPK recommendation
- ✅ Soil-specific fertilizer notes
- ✅ Disclaimer shown after pest/fertilizer section

### History
- ✅ All predictions saved to SQLite with user_id
- ✅ Search by crop or soil type
- ✅ Expandable cards showing all values
- ✅ Delete individual records
- ✅ Pagination (20 per page, infinite scroll)

### Admin Panel
- ✅ Dashboard with user/prediction stats
- ✅ Top crops and soil type charts
- ✅ Manage users (activate/deactivate)
- ✅ View and delete any prediction

### UI/UX
- ✅ Splash screen with animated logo
- ✅ LinearGradient headers throughout
- ✅ Expandable pest cards
- ✅ Animated score bars for crops
- ✅ Toast notifications (success/error/warning)
- ✅ Dark mode support (via AppContext)
- ✅ Pull-to-refresh on all list screens
- ✅ Share button on results screen

---

## 9. Color Theme

| Name | Hex | Usage |
|------|-----|-------|
| PRIMARY | #2d6a4f | Buttons, icons, headers |
| PRIMARY_DARK | #1b4332 | Gradient start |
| PRIMARY_LIGHT | #52b788 | Secondary accents |
| ACCENT | #f4a261 | Highlights, star badges |
| SUCCESS | #10b981 | Active states |
| ERROR | #ef4444 | Errors, danger actions |
| WARNING | #f59e0b | Warnings, disclaimers |

---

## 10. Troubleshooting

**"Network Error" on device:**
→ Use your PC's actual local IP, not `localhost`
→ Ensure backend is running and firewall allows port 5000

**"Module not found":**
→ Run `npm install` again inside the `mobile/` folder

**EAS build fails:**
→ Ensure you're logged into Expo (`eas whoami`)
→ Check `app.json` package name is unique

**Admin not shown:**
→ Admin users route directly to AdminStack (not MainTabs)
→ Use `admin@krishx.com / Admin@123` to test
