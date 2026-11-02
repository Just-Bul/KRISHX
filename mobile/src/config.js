/**
 * KRISHX — Central configuration
 *
 * HOW TO CONFIGURE FOR PRODUCTION:
 *   Set PRODUCTION_API_URL to your deployed Cloud Run / App Engine URL.
 *   The app automatically uses the dev URL when __DEV__ is true (Expo Go / dev builds)
 *   and the production URL for preview/release EAS builds.
 */

// ── Backend URL ───────────────────────────────────────────────────────────────
// LOCAL TESTING: pointing at PC running Flask on local network (172.20.10.2:5000)
// PRODUCTION:    change this to your GCP Cloud Run URL, e.g.:
//                'https://krishx-api-xxxx-uc.a.run.app'
const PRODUCTION_API_URL = 'https://just-bul-krishx-backend.hf.space';

// ── Development URLs ──────────────────────────────────────────────────────────
const DEV_ANDROID_EMULATOR = 'http://10.0.2.2:5000';   // Android emulator → host machine
const DEV_IOS_SIMULATOR    = 'http://localhost:5000';   // iOS Simulator
const DEV_PHYSICAL_DEVICE  = 'http://172.20.10.3:5000'; // Physical device on same network

// ── Active URL ────────────────────────────────────────────────────────────────
// __DEV__ is true in Expo Go / dev builds; false in preview/production EAS builds.
export const API_BASE_URL = __DEV__ ? DEV_PHYSICAL_DEVICE : PRODUCTION_API_URL;

// ── App metadata ──────────────────────────────────────────────────────────────
export const APP_VERSION    = '1.0.0';
export const APP_NAME       = 'KrishX';
export const APP_PACKAGE    = 'com.krishx.agriculture';
export const COPYRIGHT_YEAR = '2026';

// ── Developer info ────────────────────────────────────────────────────────────
export const DEVELOPER_NAME  = 'Rakibul Islam';
export const DEVELOPER_EMAIL = 'justbul.work@gmail.com';

// ── Play Store ────────────────────────────────────────────────────────────────
export const PLAY_STORE_URL = `market://details?id=${APP_PACKAGE}`;
