# RoadSoS — Offline-first Road Safety & Emergency Response

A two-app system for the AIEM Open Innovation Hackathon: an Android app that drivers and pedestrians carry, and a web dashboard for emergency responders. Built so the safety-critical paths (crash detection, SOS SMS, first-aid AI) work even when the network does not.

## Team Name
team Space

## Team Members
- Moses Rodrigues
- Joel Dlima
- Clyde Godinho

## Selected Domain
Environment & Public Safety

## Problem Statement
Indian roads see one of the highest road-fatality counts in the world, and a large share of those deaths happen in the "golden hour" between the crash and help arriving. The two specific gaps we target:

1. **Detection delay** — a victim who is unconscious, trapped or alone cannot reach for a phone, dial, describe the location, and wait for the call to connect. Every minute of that delay raises the risk of permanent injury or death.
2. **Connectivity gaps** — large stretches of highway, tunnels, hill roads and rural districts have weak or no cellular data. Apps that need the internet to "send an SOS" simply do not fire in the places where help is least available.

So the problem is not just "send an SOS button" — it is **detect the crash automatically, attach a precise location, alert the right people over whatever channel is still working, and do it without internet.**

## Solution
A coordinated two-app system on a shared Supabase backend.

**Mobile app (`expo-app/`)** — for drivers and pedestrians.
- A native Android foreground service watches the accelerometer 24/7 (jerk + spike-ratio algorithm in Drive mode, magnitude threshold in Normal mode) so it survives the screen turning off and the React Native JS thread being killed under memory pressure.
- On a confirmed impact the service shows a 15-second countdown. If the user does not cancel, it sends emergency SMS via the device radio (`SmsManager` — no internet path) and writes a crash log with GPS coordinates to Supabase.
- A built-in AI assistant gives first-aid steps. Online it uses Groq's Llama 3.3 70B; offline it falls back to a QLoRA-fine-tuned Llama 3.2 3B model that lives on the device.
- A lock-screen-friendly ICE (In Case of Emergency) card with blood group, allergies, medications, conditions and contacts — accessible to a first responder without unlocking the phone.

**Web dashboard (`web-app/`)** — for emergency coordinators.
- Realtime feed of incoming incidents over Supabase Realtime — new SOS rows appear at the top of the list instantly.
- A Leaflet map that plots crash logs as red markers with a pulsing "wave" animation; a marker turns solid green when a responder marks it resolved.
- Filter, severity badges (CRITICAL / MODERATE / MINOR by peak G-force), Google Maps directions link, and one-click resolve from the marker popup.
- Multilingual UI (English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi) via URL-prefixed locale routing.

## Tech Stack Used
**Mobile (`expo-app/`)**
- Expo 54 / React Native 0.81 / TypeScript (strict)
- Expo Router (file-based routing), NativeWind + Tailwind CSS
- `llama.rn` for on-device LLM inference (GGUF, Q4_K_M)
- `expo-sensors` (accelerometer), `expo-location`, `expo-sms`, `expo-haptics`
- **Kotlin native module** — `CrashDetectionService` foreground service + `SmsManager` direct send

**Web (`web-app/`)**
- Next.js 15 (App Router) / React 19 / TypeScript
- `@supabase/ssr` for cookie-based auth, `react-leaflet` for the map
- `recharts` for the analytics page, `framer-motion` for transitions

**Backend**
- Supabase: PostgreSQL + PostGIS + Realtime + Row-Level Security
- Tables: `incidents`, `crash_logs`, `services`, `responders`, `profiles`
- Edge function `send-sos-sms` as a Twilio fallback when device SMS fails

**Cloud AI**
- Groq API serving Llama 3.3 70B for real-time first-aid responses (1–3s latency)

## AI Tools Used
- **Groq Cloud (Llama 3.3 70B)** — primary online inference for the AI assistant
- **llama.rn + on-device Llama 3.2 / RoadSoS 3B** — offline inference so the assistant works with no internet
- **QLoRA fine-tuning on Google Colab (T4)** — produced the [`moses6849/roadsos-3b-road-safety`](https://huggingface.co/moses6849/roadsos-3b-road-safety) model from a hand-curated set of 210+ Indian road-safety Q&A pairs, exported as GGUF Q4_K_M
- **Anthropic Claude (via Claude Code)** — used during development as a pair-programming and code-review assistant for the screen designs, the crash-detection workflow, and the web dashboard

## Features
- **Automatic crash detection** with a dual-mode algorithm: Drive mode uses jerk + spike-ratio + minimum-magnitude to ignore speed bumps; Normal mode uses a tuned magnitude threshold for falls
- **Native Android foreground service** — survives screen-off and JS thread kill, fires the SOS even if the app process is dead
- **Cancellable 15-second countdown** — the in-app overlay and the lock-screen notification both stop the auto-SOS the moment the user taps Cancel
- **Direct-radio SMS** — uses `SmsManager` so the alert goes over GSM, not the internet; works in cellular-only / no-data areas
- **3-tier AI assistant** — Groq cloud (best) → on-device Llama (offline) → short honest fallback pointing to 112
- **Responder dashboard** with pulsing-red / solid-green crash markers and live UPDATE / INSERT subscriptions
- **ICE card** with blood group, medical info and one-tap call buttons, designed for first-responder use
- **7-language UI** — English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi
- **Offline-first data layer** — profile, contacts, incidents and a seeded nearby-services dataset all live on the device

## How to Run the Project

### Try the deployed dashboard
The responder dashboard is live: **<https://road-sos-sepia.vercel.app/en/dashboard>**

### Install the mobile app (Android)
1. Download `expo-app/android/app/build/outputs/apk/release/app-release.apk` (124 MB, signed with a debug keystore — fine for sideload).
2. On your Android phone, enable *Install unknown apps* for your file manager.
3. **Fully uninstall any existing RoadSoS install first** (every build uses `versionCode 1`, so the OS may not treat it as an update).
4. Open the APK and install. Grant Location, SMS and Notifications permissions when asked.

### Build and run from source

**Mobile app**
```bash
cd expo-app
npm install
# Copy .env.example to .env and fill in your Supabase + Groq keys
npm start                 # Expo dev server — press 'a' for Android
npm run android           # Build + install on a connected device / emulator
npm run build-apk         # Windows: release APK via android/gradlew.bat
```
> **Windows build note:** the Android CMake/ninja toolchain cannot build from a path containing spaces. The workspace path has spaces, so the project's `D:\rsos` mirror is used for release builds — see [`CLAUDE.md`](CLAUDE.md) for the full procedure.

**Web dashboard**
```bash
cd web-app
npm install
# Copy .env.example to .env.local and fill in NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
npm run dev               # http://localhost:3000
npm run build && npm start
```

## Demo / Screenshots
- **Live web dashboard:** <https://road-sos-sepia.vercel.app/en/dashboard>
- **Reference designs:** the full design canvas lives in [`RoadSOS/`](RoadSOS/) — open `RoadSoS Screens.html` in a browser to see every screen side-by-side.
- **APK for the Android app:** `expo-app/android/app/build/outputs/apk/release/app-release.apk`
- **Deep technical reference:** [`detailedinfo.md`](detailedinfo.md) covers both apps file-by-file; [`CLAUDE.md`](CLAUDE.md) is the orientation doc for contributors.

## Future Scope
- **Independent GPS in the native service** — currently the crash-detection service reads its last known location from `SharedPreferences` written by the JS layer. Adding `FusedLocationProviderClient` to the Kotlin service would let it acquire its own fix when the app has not been opened recently.
- **iOS parity for the foreground service** — iOS does not allow a real equivalent of Android foreground services; the iOS path would use silent push wake-ups plus the existing JS detector. The Apple Watch companion in `watch/ios/` is a good starting point.
- **Responder mobile app** — the dashboard already subscribes to a `responder-locations` broadcast channel. A small Expo app that streams the responder's GPS would put their live position on the dashboard map.
- **Twilio fallback hardening** — the `send-sos-sms` Supabase Edge Function exists; wiring it as a guaranteed retry path when device SMS fails would close the last "no signal at all" gap.
- **Play Store release** — replace the debug keystore with a production keystore and ship a signed AAB.
- **Wider AI training set** — extend the RoadSoS 3B fine-tune from 210 to ~2,000 Q&A pairs covering more regional emergency-services context and local languages.
