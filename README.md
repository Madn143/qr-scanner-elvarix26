# ELVARIX'26 — Event Management & QR Scanner App

A production-ready React Native (Expo) app for managing event attendance at **ELVARIX'26**, built with Firebase Firestore for real-time, duplicate-proof checkpoint scanning.

---

## 🔒 MERGED FIRESTORE SECURITY RULES

Paste this exact block into your **Firebase Console → Firestore Database → Rules** tab. It preserves all existing website rules while enabling access for the QR Scanner app.

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ──────── EXISTING WEBSITE RULES (PRESERVED) ────────
    match /registrations/{registrationId} {
      allow create: if request.resource.data.registrationId == registrationId
        && request.resource.data.fullName is string
        && request.resource.data.email is string
        && request.resource.data.transactionId is string
        && request.resource.data.paymentScreenshot is string;

      allow read: if true;
      allow update, delete: if false;
    }

    match /counters/{counterId} {
      allow read, write: if true;
    }

    match /feedback/{feedbackId} {
      allow create: if request.resource.data.feedbackId == feedbackId
        && request.resource.data.registrationId is string
        && request.resource.data.feedback is string;
      allow read, update, delete: if false;
    }

    // ──────── NEW RULES FOR QR SCANNER APP ────────
    match /ELVARIX26_Attendees/{docId} {
      allow read, write: if true;
    }
    match /ELVARIX26_Reception_Logs/{docId} {
      allow read, write: if true;
    }
    match /ELVARIX26_Snack_Logs/{docId} {
      allow read, write: if true;
    }
    match /ELVARIX26_Food_Logs/{docId} {
      allow read, write: if true;
    }
  }
}
```

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
