# ELVARIX'26 — Event Management & QR Scanner App

A production-ready React Native (Expo) app for managing event attendance at **ELVARIX'26**, built with Firebase Firestore for real-time, duplicate-proof checkpoint scanning.

---

## 🔒 FIXING "Missing or insufficient permissions" ERROR

If you see **`Missing or insufficient permissions`** when scanning a QR code or saving a pass, your Firebase Firestore database security rules are currently blocking public reads/writes.

### Step-by-Step Fix (Takes 30 seconds):

1. Open **[Firebase Console](https://console.firebase.google.com/)**
2. Select your project: **`elvarix26`**
3. In the left menu, click **Build → Firestore Database**
4. Click the **Rules** tab at the top
5. Replace the existing rules with the following:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. Click the blue **Publish** button at the top right.
7. Open the app on your phone and tap **RETRY** — scanning and pass generation will immediately work!

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
├── google-services.json             # Firebase Android config
├── firebaseConfig.js                # Firebase SDK & collection names
├── babel.config.js
├── metro.config.js
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

## 🗄 Firestore Database Schema

```
ELVARIX26_Attendees/
  {registrationId}/
    ├── registrationId    (string)  e.g. "ELVA9423"
    ├── studentName       (string)  e.g. "Madan"
    ├── collegeName       (string)  e.g. "Grace College of Engineering"
    ├── events            (array)   e.g. ["Blind Coding", "On Spot Video Editing"]
    ├── foodPreference    (string)  "Veg" | "Non-Veg"
    ├── registrationType  (string)  "Internal" | "External"
    └── createdAt         (timestamp)

ELVARIX26_Reception_Logs/
  {registrationId}/
    ├── registrationId    (string)
    └── timestamp         (timestamp)   ← One-time scan guard

ELVARIX26_Snack_Logs/
  {registrationId}/
    ├── registrationId    (string)
    └── timestamp         (timestamp)   ← One-time scan guard

ELVARIX26_Food_Logs/
  {registrationId}/
    ├── registrationId    (string)
    ├── foodPreference    (string)
    └── timestamp         (timestamp)   ← One-time scan guard
```

---

## 🗓 Event Details

**ELVARIX'26** · September 23, 2026 · Grace College of Engineering
