# ELVARIX'26 — Event Management & QR Scanner App

A production-ready React Native (Expo) app for managing event attendance at **ELVARIX'26**, built with Firebase Firestore for real-time, duplicate-proof checkpoint scanning.

---

## 📱 Features

| Feature | Description |
|---|---|
| **QR Scanner** | Scans participant QR codes at 3 checkpoints (Reception, Snacks, Food) |
| **Duplicate Detection** | Firestore atomic writes prevent any participant from being checked in twice |
| **Pass Generator** | On-spot registration form that generates a digital ELVARIX'26 entry pass |
| **QR Code Embedding** | Every pass contains the full participant JSON encoded as a QR code |
| **Share / Save** | Export the pass as a PNG image and share via WhatsApp or save to gallery |

---

## 🗂 Project Structure

```
qr-scanner-elvarix26/
├── App.js                           # Root: Bottom tab navigator
├── app.json                         # Expo config + camera permissions
├── firebaseConfig.js                # ⚠️  Firebase credentials (fill this in!)
├── babel.config.js
├── package.json
├── assets/
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
├── screens/
│   ├── ScannerScreen.js             # Tab 1 — QR checkpoint scanner
│   └── PassGeneratorScreen.js       # Tab 2 — On-spot pass generator
└── components/
    ├── StatusOverlay.js             # Green/red scan result overlay
    ├── DigitalPass.js               # Official entry pass card component
    └── EventCheckboxGroup.js        # Multi-select event checkboxes
```

---

## 🔥 Firebase Setup (Required)

### Step 1 — Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → name it `elvarix26`
3. Disable Google Analytics (optional) → **Create project**

### Step 2 — Enable Firestore

1. In the left sidebar: **Build → Firestore Database**
2. Click **Create database** → **Start in test mode** (for development)
3. Choose a region close to you

### Step 3 — Get Your Config

1. **Project Settings** (gear icon) → **General** → scroll to **Your apps**
2. Click `</>` to add a Web app → Register it
3. Copy the `firebaseConfig` object

### Step 4 — Update `firebaseConfig.js`

Open `firebaseConfig.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // ← replace
  authDomain: "YOUR_AUTH_DOMAIN",      // ← replace
  projectId: "YOUR_PROJECT_ID",        // ← replace
  storageBucket: "YOUR_STORAGE_BUCKET",// ← replace
  messagingSenderId: "YOUR_SENDER_ID", // ← replace
  appId: "YOUR_APP_ID",               // ← replace
};
```

### Step 5 — Firestore Security Rules (Production)

For the event day, update Firestore rules to allow only authenticated or internal writes:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Replace with auth rules for production
    }
  }
}
```

---

## 🗄 Firestore Database Schema

```
Attendees/
  {registrationId}/
    ├── registrationId    (string)  e.g. "ELVA9423"
    ├── studentName       (string)  e.g. "Madan"
    ├── collegeName       (string)  e.g. "Grace College of Engineering"
    ├── events            (array)   e.g. ["Blind Coding", "On Spot Video Editing"]
    ├── foodPreference    (string)  "Veg" | "Non-Veg"
    ├── registrationType  (string)  "Internal" | "External"
    └── createdAt         (timestamp)

Reception_Logs/
  {registrationId}/
    ├── registrationId    (string)
    └── timestamp         (timestamp)   ← One-time scan guard

Snack_Logs/
  {registrationId}/
    ├── registrationId    (string)
    └── timestamp         (timestamp)   ← One-time scan guard

Food_Logs/
  {registrationId}/
    ├── registrationId    (string)
    ├── foodPreference    (string)
    └── timestamp         (timestamp)   ← One-time scan guard
```

> **Key design**: Each log collection uses `registrationId` as the **document ID**. This guarantees uniqueness at the database level — no two scans for the same participant can ever succeed.

---

## 🚀 Running the App

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your Android/iOS device

### Install & Start

```bash
cd qr-scanner-elvarix26
npm install       # (already done if you're reading this)
npx expo start
```

Then scan the QR code with **Expo Go** on your phone.

### Android Physical Device (Recommended for Camera)

```bash
npx expo start --android
```

> ⚠️ Camera scanning **does not work on simulators/emulators**. Use a real device.

---

## 📦 QR Code Payload Format

Every generated pass encodes this JSON into the QR code:

```json
{
  "registrationId": "ELVA9423",
  "studentName": "Madan",
  "collegeName": "Grace College of Engineering",
  "events": ["Blind Coding", "On Spot Video Editing"],
  "foodPreference": "Non-Veg",
  "registrationType": "Internal"
}
```

---

## 🎨 App Colour Palette

| Role | Colour |
|---|---|
| Background | `#050A14` |
| Card surface | `#0E1628` |
| Primary accent | `#6366F1` (Indigo) |
| Gold highlight | `#F59E0B` |
| Success | `#22C55E` |
| Error/Duplicate | `#EF4444` |

---

## 🔧 Dependencies

| Package | Purpose |
|---|---|
| `expo-camera` | Camera viewfinder + QR barcode scanning |
| `react-native-qrcode-svg` | Renders QR codes in the digital pass |
| `react-native-view-shot` | Captures the pass card as a PNG image |
| `expo-sharing` | Native share sheet for WhatsApp / save to gallery |
| `firebase` | Firestore real-time DB |
| `@react-navigation/bottom-tabs` | Tab bar navigation |
| `@expo/vector-icons` | Ionicons icon set |

---

## 🗓 Event Details

**ELVARIX'26** · September 23, 2026 · Grace College of Engineering
