# 🩺 AI Health Companion — Patient Health App

> A full-stack healthcare platform built for **Smart India Hackathon 2026**. It consists of two components: an **Android patient app** and a **Doctor Dashboard web app**, both powered by Firebase.

---

## 📁 Project Structure

```
.
├── app/                          # Android Patient App (Kotlin)
│   └── src/main/java/com/example/patientapp/
│       ├── data/                 # Models & Repositories
│       ├── di/                   # Hilt Dependency Injection
│       ├── ui/                   # Activities & Features
│       │   ├── auth/             # Login, Register (Phone OTP)
│       │   ├── casetaking/       # Symptom entry & voice recording
│       │   ├── allergies/        # Allergy tracking
│       │   ├── eyescreening/     # AI eye screening via camera
│       │   ├── history/          # Medical & family history
│       │   ├── home/             # Dashboard
│       │   ├── medications/      # Medication tracker
│       │   ├── mentalhealth/     # Mental health check
│       │   ├── notifications/    # FCM push notifications
│       │   ├── profile/          # User profile
│       │   ├── registration/     # Post-signup registration
│       │   ├── reminder/         # Medication reminders
│       │   ├── report/           # PDF report generation
│       │   └── splash/           # Splash screen
│       └── utils/                # Helpers, receivers, session
│
├── doctor-website/               # Doctor Dashboard (React + Vite)
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx         # Doctor login (Firebase Auth)
│       │   ├── SignUp.jsx        # Doctor signup
│       │   ├── Dashboard.jsx     # Doctor overview
│       │   ├── PatientList.jsx   # View all patients
│       │   └── PatientReport.jsx # Individual patient report
│       ├── components/
│       │   └── Navbar.jsx
│       └── services/             # Firebase services (auth, doctors, patients)
│
├── firestore.rules               # Firestore security rules
├── storage.rules                 # Firebase Storage security rules
├── release-key.jks               # Android release signing key
├── build.gradle                  # Root Gradle build
└── settings.gradle               # Gradle settings
```

---

## 🚀 Features

### Android Patient App
- **Phone OTP Authentication** — Login/Register with phone number + Firebase Auth
- **Health Dashboard** — Central hub for all health modules
- **Case Taking** — Log chief complaints, select symptoms, set severity & duration
- **Voice Recording** — Record voice descriptions of symptoms
- **Medical History** — Track surgeries, chronic diseases, hospitalizations
- **Family History** — Log hereditary conditions per family member
- **Medications Tracker** — Current medications with dosage & frequency
- **Allergies** — Track allergy type, allergen, and severity
- **Eye Screening** — Capture eye photo via CameraX, AI risk assessment
- **Mental Health Check** — Stress scoring questionnaire
- **PDF Report Generation** — Generate & share health reports (iTextPDF)
- **Medication Reminders** — Schedule notifications via WorkManager + AlarmManager
- **Push Notifications** — Firebase Cloud Messaging (FCM)
- **Offline Support** — Room database for local caching

### Doctor Dashboard (Web)
- **Firebase Auth** — Email/password login for doctors
- **Per-Doctor Scoping** — Each doctor sees only their assigned patients
- **Patient List** — Browse and search patients
- **Patient Reports** — Detailed view of patient health data
- **Auto-Increment Doctor ID** — Unique numeric doctor IDs
- **Seed Data** — Quick test data seeding

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Android UI | XML Layouts + ViewBinding |
| Architecture | MVVM + Repository Pattern |
| DI | Dagger Hilt |
| Database | Room (local) + Firestore (cloud) |
| Auth | Firebase Auth (Phone OTP) |
| Camera | CameraX |
| PDF | iTextPDF |
| Notifications | WorkManager + AlarmManager + FCM |
| Web Frontend | React 19 + Vite + Tailwind CSS v4 |
| Web Backend | Firebase (Auth, Firestore, Storage) |
| Deployment | Vercel (web), APK (Android) |

---

## ⚙️ Prerequisites

- **Android App:**
  - Android Studio Hedgehog (2023.1.1) or newer
  - JDK 17
  - Android SDK 34 (compileSdk)
  - Min SDK 26 (Android 8.0+)
  - Firebase project with `google-services.json` configured
- **Doctor Website:**
  - Node.js 18+ and npm
  - Firebase project with web app config

---

## 🔧 Build & Run — Android App

### 1. Clone the repo
```bash
git clone https://github.com/your-org/ai-health-companion.git
cd ai-health-companion
```

### 2. Add Firebase config
Place your real `google-services.json` from the [Firebase Console](https://console.firebase.google.com) into `app/`:
```
app/google-services.json    ← Your real Firebase config
```

### 3. Open in Android Studio
Open the root project folder (`ai-health-companion`) in Android Studio. It will auto-detect the Gradle project and sync dependencies.

### 4. Build the Debug APK
```bash
./gradlew assembleDebug
```
The debug APK will be at:
```
app/build/outputs/apk/debug/app-debug.apk
```

### 5. Build the Release APK
A release signing key (`release-key.jks`) is already configured in `app/build.gradle`.

```bash
./gradlew assembleRelease
```
The signed release APK will be at:
```
app/build/outputs/apk/release/app-release.apk
```

### 6. Install on a Device / Emulator
```bash
# Install debug APK via ADB
adb install app/build/outputs/apk/debug/app-debug.apk

# Install release APK via ADB
adb install app/build/outputs/apk/release/app-release.apk
```

### 7. Generate a Signed APK (Android Studio GUI)
1. In Android Studio: **Build → Generate Signed Bundle / APK**
2. Select **APK** → Next
3. Key store path: `release-key.jks`
4. Key store password: `patient123`
5. Key alias: `patientapp`
6. Key password: `patient123`
7. Select **release** build variant → Finish
8. APK output: `app/build/outputs/apk/release/app-release.apk`

### Release Signing Config (already in `app/build.gradle`)
```groovy
signingConfigs {
    release {
        storeFile file("../release-key.jks")
        storePassword "patient123"
        keyAlias "patientapp"
        keyPassword "patient123"
    }
}
```

---

## 🌐 Build & Run — Doctor Dashboard (Web)

### 1. Navigate to the web directory
```bash
cd doctor-website
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
The app will start at **http://localhost:5173**.

### 4. Build for production
```bash
npm run build
```
Output will be in `doctor-website/dist/`.

### 5. Preview the production build
```bash
npm run preview
```

### 6. Deploy to Vercel
The project already has `vercel.json` configured for SPA routing. To deploy:
```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# Deploy from the doctor-website directory
cd doctor-website
vercel
```

Or connect the `doctor-website/` directory to Vercel via the dashboard for automatic deployments.

---

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project (or use existing)
3. Enable these services:
   - **Authentication** → Enable Phone and Email/Password sign-in methods
   - **Cloud Firestore** → Create database (start in test mode, then deploy rules)
   - **Firebase Storage** → Enable and deploy `storage.rules`
   - **Cloud Messaging** → Auto-enabled for Android
4. Add your Android app (package: `com.example.patientapp`) and download `google-services.json`
5. Add a Web app in the Firebase console and copy the config into `doctor-website/src/services/firebase.js`
6. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

---

## 📦 APK Distribution

After building the release APK:

1. **Direct install:** Transfer `app-release.apk` to an Android device and install
2. **Google Play:** Upload the signed APK/AAB to Play Console
3. **Firebase App Distribution:** Use `firebase appdistribution:distribute app/build/outputs/apk/release/app-release.apk`
4. **Share via cloud:** Upload to Google Drive, Dropbox, or any file-sharing service

---

## 🧪 Testing

### Android
```bash
# Run unit tests
./gradlew test

# Run instrumented tests
./gradlew connectedAndroidTest
```

### Doctor Website
```bash
cd doctor-website
npm run lint    # Run oxlint
```

---

## 📝 Environment Notes

- **Firestore rules** enforce per-user data access (patients can only read/write their own data)
- **Storage rules** restrict file access to the owning patient
- The `google-services.json` in the repo is a **placeholder** — replace with your real Firebase config before building
- The release keystore password is `patient123` — **change this for production**
