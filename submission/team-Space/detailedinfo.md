# RoadSoS — Detailed Technical Reference

Covers both applications under `AIEM Open Innovation Hackathon/`:
- [`expo-app`](#expo-app) — React Native / Expo mobile app
- [`web-app`](#web-app) — Next.js 15 web dashboard

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [expo-app — Mobile Application](#expo-app)
   - [Tech Stack](#mobile-tech-stack)
   - [File Structure](#mobile-file-structure)
   - [Routes & Screens](#mobile-routes--screens)
   - [Core Features](#mobile-core-features)
   - [Libraries & Dependencies](#mobile-dependencies)
   - [Environment Variables](#mobile-environment-variables)
   - [Build Targets](#mobile-build-targets)
3. [web-app — Dashboard](#web-app)
   - [Tech Stack](#web-tech-stack)
   - [File Structure](#web-file-structure)
   - [Routes & Pages](#web-routes--pages)
   - [Core Features](#web-core-features)
   - [Libraries & Dependencies](#web-dependencies)
   - [Environment Variables](#web-environment-variables)
4. [Shared Data Models](#shared-data-models)
5. [Architectural Decisions](#architectural-decisions)

---

## Project Overview

**RoadSoS** is a road safety emergency response system built for the AIEM Open Innovation Hackathon. It targets Indian roads and consists of:

| App | Role |
|-----|------|
| `expo-app` | Mobile app installed by drivers — detects crashes, sends SOS SMS, provides AI first-aid guidance |
| `web-app` | Web dashboard for monitoring — shows live incident feed, responder map, admin panel for managing services |

Both apps share Supabase as a backend (PostgreSQL + Realtime), support 7 Indian languages, and are designed offline-first so core safety features survive poor connectivity.

---

## expo-app

### Mobile Tech Stack

| Category | Library | Version |
|----------|---------|---------|
| Framework | Expo | 54.0.0 |
| Runtime | React Native | 0.81.5 |
| Language | TypeScript | 5.3.3 |
| Navigation | Expo Router | 6.0.23 |
| Styling | NativeWind + Tailwind CSS | 4.2.3 / 3.4.15 |
| Backend | Supabase JS | 2.43.4 |
| Cloud AI | Groq SDK | latest |
| On-device AI | llama.rn | 0.5.10 |
| Maps | Leaflet | 1.9.4 |
| Icons | Lucide React Native | 1.14.0 |
| Local Storage | AsyncStorage | 2.1.2 |
| Location | expo-location | 19.0.8 |
| Sensors | expo-sensors | 15.0.8 |
| Notifications | expo-notifications | 0.32.17 |
| Haptics | expo-haptics | 14.0.1 |
| Media | Expo AV + File System | — |
| Testing | Jest | 29.7.0 |

### Mobile File Structure

```
expo-app/
├── app/                          # All screens (Expo Router file-based routing)
│   ├── _layout.tsx               # Root layout — auth gate, onboarding redirect, notifications setup
│   ├── index.tsx                 # Boot/splash — routes to onboarding or tabs
│   ├── onboarding.tsx            # 3-step first-run wizard
│   ├── ice.tsx                   # I.C.E. card (In Case of Emergency)
│   ├── model-setup.tsx           # Offline AI model download & management
│   ├── +not-found.tsx            # 404 fallback
│   ├── (tabs)/                   # Bottom tab group
│   │   ├── _layout.tsx           # Tab bar config (icons, colors, labels)
│   │   ├── index.tsx             # Home — SOS, crash status, quick dial, nearby
│   │   ├── services.tsx          # Nearby emergency services browser
│   │   ├── chat.tsx              # AI assistant (cloud / local / offline)
│   │   └── settings.tsx          # Profile, crash detection, AI model, contacts
│   ├── auth/
│   │   ├── sign-in.tsx           # Email + password login
│   │   └── sign-up.tsx           # Account creation
│   ├── incident/
│   │   └── [id].tsx              # Post-SOS detail (contacts notified, SMS status)
│   └── stream/
│       └── [id].tsx              # Live video stream view
│
├── components/
│   ├── AppKit.ts                 # Full reusable UI library (Screen, Panel, PrimaryButton, etc.)
│   ├── SOSButton.tsx             # 130dp red circle with pulsing ring animation
│   ├── CountdownOverlay.tsx      # Full-screen 15-second crash countdown
│   ├── ChatBubble.tsx            # Message display — bot left, user right, streaming cursor
│   ├── ChatInput.tsx             # Input with send/stop toggle
│   ├── ModelDownloader.tsx       # Progress ring + bar for LLM download
│   ├── LeafletMap.tsx            # Leaflet WebView map for services
│   ├── ServiceCard.tsx           # Expandable service listing panel
│   ├── ContactList.tsx           # Emergency contact editor
│   └── ErrorBoundary.tsx         # React error boundary with retry
│
├── hooks/
│   ├── useCrashDetector.ts       # Accelerometer crash algorithm + state machine
│   ├── useLocation.ts            # Background location tracking
│   ├── useNearbyServices.ts      # Fetch, cache, filter nearby services
│   └── useSOSFlow.ts             # SOS button handler — contacts, SMS, Supabase log
│
├── lib/
│   ├── auth.ts                   # Supabase auth wrapper (signIn, signUp, signOut, session)
│   ├── background-service.ts     # Delegates to native Android service or expo-notifications
│   ├── native-crash-service.ts   # JS bridge to CrashDetectionModule (Android native)
│   ├── crash-logger.ts           # logCrashDetected() + resolveCrashLog() to Supabase
│   ├── local-llm.ts              # llama.rn model load, inference, abort
│   ├── groq.ts                   # Groq API call + context builder
│   ├── direct-sms.ts             # Android SMS permission + SmsManager bridge
│   ├── offline-cache.ts          # AsyncStorage CRUD for profile, contacts, incidents, services
│   ├── notifications.ts          # Notification channel setup + scheduling
│   ├── region-detector.ts        # Maps lat/lng → Indian region (GOA, MH, KA, etc.)
│   ├── fetch-utils.ts            # fetchWithTimeout() wrapper
│   ├── validators.ts             # validateEmail(), validatePhone(), validateName()
│   └── utils.ts                  # generateUID(), formatDate(), helpers
│
├── types/
│   └── index.ts                  # All shared TypeScript types and enums
│
├── constants/
│   ├── theme.ts                  # Colors, typography, spacing tokens; service labels
│   └── layout.ts                 # Tab bar sizing constants
│
├── assets/
│   └── roadsosLogo.png
│
├── android/                      # Android native project (Gradle, Kotlin modules)
│   └── app/src/main/java/com/roadsos/mobile/
│       ├── CrashDetectionService.kt   # Foreground service — sensor loop, countdown, SMS, Supabase
│       ├── CrashDetectionModule.kt    # React Native bridge (start/stop/config/storeLocation)
│       └── CrashDetectionPackage.kt  # Registers module with RN
│
├── app.json                      # Expo config — permissions, bundle ID, icons, splash, plugins
├── package.json
├── tsconfig.json
└── global.css                    # NativeWind Tailwind base directives
```

### Mobile Routes & Screens

| Route | Screen | Purpose |
|-------|--------|---------|
| `/` | Boot | Checks onboarding state → redirects |
| `/onboarding` | Onboarding Wizard | 3-step profile + contacts + permissions |
| `/model-setup` | Model Setup | Download/manage offline AI model |
| `/ice` | I.C.E. Card | Emergency medical profile for first responders |
| `/(tabs)/index` | Home | SOS button, crash status, quick dial, nearby help |
| `/(tabs)/services` | Services | Filter + browse nearby emergency services |
| `/(tabs)/chat` | AI Chat | Cloud / local / offline AI assistant |
| `/(tabs)/settings` | Settings | Monitoring mode, crash detection, account |
| `/auth/sign-in` | Sign In | Optional Supabase authentication |
| `/auth/sign-up` | Sign Up | Account creation |
| `/incident/[id]` | Incident Detail | Post-SOS delivery status per contact |
| `/stream/[id]` | Live Stream | Video stream viewer |

### Mobile Core Features

#### 1. Crash Detection

**Hook:** `hooks/useCrashDetector.ts`
**Native service:** `CrashDetectionService.kt` (Android foreground service)

The system monitors the device accelerometer at high frequency and applies two detection algorithms based on the user's selected mode:

**Drive mode** (vehicle crash detection):
- Computes resultant g-force magnitude: `magG = sqrt(x²+y²+z²) / GRAVITY_EARTH`
- Computes jerk: rate of change of magnitude between samples
- EMA baseline tracker (α = 0.08) follows slow changes in motion
- Crash fires when: `jerkGs > threshold AND magG/ema > spike ratio AND magG > minG`

**Normal mode** (pedestrian / static):
- Simple threshold on raw g-force magnitude
- No jerk or EMA required

**Sensitivity presets:**

| Level | Drive threshold | Normal threshold |
|-------|----------------|-----------------|
| Low | 5.0g jerk | 4.0g |
| Medium | 3.5g jerk | 2.8g |
| High | 2.5g jerk | 2.0g |

**Crash response sequence:**
1. `dispatchCrash()` fires in native service
2. Looping vibration starts (`VibrationEffect.createWaveform`)
3. 15-second countdown begins — notification updates every second
4. Cancel button in notification sends `ACTION_CANCEL_COUNTDOWN`
5. At 0s: background thread posts crash log to Supabase, sends SMS via `SmsManager`
6. Result notification shown; vibration stops

**Background survival (Android):**
- `CrashDetectionService` is a foreground service with `android:foregroundServiceType="health"`
- Holds `PARTIAL_WAKE_LOCK` to keep CPU alive with screen off
- Permissions required: `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_HEALTH`, `HIGH_SAMPLING_RATE_SENSORS`, `WAKE_LOCK`
- When JS thread is killed, service reads location + contacts from SharedPreferences and acts fully natively

#### 2. SOS Flow

**Hook:** `hooks/useSOSFlow.ts`

Manual SOS triggered by pressing the SOS button:
1. Reads emergency contacts from AsyncStorage (blocks if empty — shows Alert)
2. Gets current location from `useLocation`
3. Shows confirmation Alert with contact names listed
4. On confirm: sends SMS to each contact via `direct-sms.ts`
5. Logs incident to Supabase `incidents` table (fire-and-forget)
6. Navigates to `/incident/[id]` for status view

**SMS content format:**
```
🆘 EMERGENCY ALERT from [Name]
I may need help at: [Address]
Coordinates: [lat], [lng]
Google Maps: https://maps.google.com/?q=[lat],[lng]
Blood Group: [group]
```

#### 3. AI Chat (3-tier fallback)

**Files:** `lib/groq.ts`, `lib/local-llm.ts`, `hooks/useCrashDetector.ts`

| Tier | Condition | Model | Latency |
|------|-----------|-------|---------|
| 1 — Cloud | `isOnline = true` | Groq `llama-3.3-70b-versatile` | 1–3s |
| 2 — Local | Model downloaded + offline | On-device Llama 3.2 3B (llama.rn) | 3–8s |
| 3 — Offline | No model + offline | Static first-aid scripts | Instant |

**Context injected into every prompt:**
- User name, blood group, medical info (allergies, medications, conditions)
- Current location address
- Nearby services (names + distances)
- Current mode (drive/normal) and crash detection state

**Quick prompt chips** (tap → fills input):
- First Aid, Car Accident, Breakdown, Medical Emergency, Report Incident

**Streaming:** Cloud responses stream token-by-token via Groq's streaming API. Local model streams via llama.rn callbacks. A 90-second watchdog aborts hung completions.

#### 4. Nearby Services

**Hook:** `hooks/useNearbyServices.ts`
**Cache:** `lib/offline-cache.ts`

- Seed database covers major Indian cities: Bengaluru, Mumbai, Delhi, Chennai, Hyderabad, Pune, Goa, and more
- Service types: `hospital`, `trauma_centre`, `ambulance`, `police`, `towing`, `puncture`, `showroom`
- Cache TTL: 7 days in AsyncStorage; re-fetched on app open if stale
- Distance computed client-side using Haversine formula from current GPS position
- Sorted ascending by distance; filterable by type via Chip row
- Leaflet map renders markers via WebView

#### 5. Offline-First Architecture

| Data | Primary Store | Cloud Sync |
|------|--------------|-----------|
| User profile | AsyncStorage | Optional (Supabase) |
| Emergency contacts | AsyncStorage | Optional |
| Incidents | AsyncStorage | Yes (crash logs) |
| Nearby services | AsyncStorage (7-day TTL) | On demand |
| AI model weights | Device filesystem | No |
| Crash logs | SharedPreferences (Android) | On internet restore |

#### 6. I.C.E. Card (`/ice`)

Accessible from lock screen intent (future). Displays:
- Name (34px, weight 900)
- Blood group (large pill, red border)
- Medical info: allergies, medications, conditions
- Emergency contacts with one-tap call
- "Call 112" primary button

Designed for first responders — maximum contrast, no login required.

#### 7. Onboarding Wizard (`/onboarding`)

3 steps with pill progress indicators:

| Step | Content |
|------|---------|
| 0 | Name TextField, blood group Chips, language Chips, optional medical TextFields |
| 1 | Emergency contacts (add/delete), crash detection toggle |
| 2 | Permission grants: Location (always-on), SMS |

Saves to AsyncStorage on each step. Sets `onboardingComplete = true` → navigates to `/model-setup`.

#### 8. Model Download (`/model-setup`)

**Component:** `components/ModelDownloader.tsx`

- Single model: RoadSoS 3B Fine-tuned (~2.0 GB)
- Download via Expo `FileSystem.downloadAsync()` with progress callback
- Circular progress ring + linear progress bar during download
- Pause/Resume: saves partial download offset to AsyncStorage
- Cancel: shows confirmation → deletes partial file
- Completed state persisted in AsyncStorage; checked on every app open

### Mobile Dependencies

```json
{
  "expo": "~54.0.0",
  "expo-router": "~6.0.23",
  "react-native": "0.81.5",
  "react": "19.1.0",
  "typescript": "~5.3.3",
  "@supabase/supabase-js": "^2.43.4",
  "nativewind": "^4.2.3",
  "tailwindcss": "^3.4.15",
  "lucide-react-native": "^1.14.0",
  "llama.rn": "^0.5.10",
  "leaflet": "^1.9.4",
  "expo-location": "~19.0.8",
  "expo-sensors": "~15.0.8",
  "expo-notifications": "~0.32.17",
  "expo-haptics": "~14.0.1",
  "expo-av": "~15.0.2",
  "expo-file-system": "~18.0.10",
  "@react-native-async-storage/async-storage": "^2.1.2",
  "jest": "^29.7.0"
}
```

### Mobile Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
EXPO_PUBLIC_GROQ_API_KEY=<groq-key>
EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY=<google-key>
EXPO_PUBLIC_GOOGLE_SEARCH_CX=<search-engine-id>
```

### Mobile Build Targets

| Platform | Command | Output |
|----------|---------|--------|
| Android debug | `npx expo run:android` | `.apk` via Gradle |
| Android release | `cd android && ./gradlew assembleRelease` | `app-release.apk` |
| iOS | `npx expo run:ios` | Xcode build |
| Expo Go | `npx expo start` | QR code dev |

**Android requirements:**
- `buildDir = "D:/b/$name"` (short path for Windows MAX_PATH fix)
- `stagingDir = "C:/x"` (cross-drive staging workaround)
- Minimum SDK: 24 | Target SDK: 36
- Native modules: `CrashDetectionService`, `CrashDetectionModule`, `DirectSmsModule`

---

## web-app

### Web Tech Stack

| Category | Library | Version |
|----------|---------|---------|
| Framework | Next.js (App Router) | 15.2.0 |
| Language | TypeScript | 5.7.0 |
| Runtime | React | 19.1.0 |
| Styling | Tailwind CSS | 4.1.0 |
| Backend | Supabase SSR + JS | 0.6.0 / 2.49.0 |
| Maps | Leaflet + react-leaflet | 1.9.4 / 5.0.0 |
| Icons | Lucide React | latest |
| i18n | Custom context system | — |

### Web File Structure

```
web-app/
├── app/
│   ├── layout.tsx                      # Root HTML — fonts, meta, body
│   ├── page.tsx                        # Redirect to /en
│   ├── globals.css                     # Tailwind directives + CSS custom properties
│   ├── error.tsx                       # Global error boundary with retry
│   ├── loading.tsx                     # Global loading skeleton
│   ├── not-found.tsx                   # 404 page
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts               # Supabase OAuth callback — exchanges code for session
│   └── [locale]/                       # Locale segment (en | hi | ta | te | kn | ml | mr)
│       ├── layout.tsx                  # Locale layout — header, nav, language switcher
│       ├── page.tsx                    # Redirect to /[locale]/dashboard
│       ├── dashboard/
│       │   └── page.tsx               # Main live incident dashboard
│       ├── admin/
│       │   ├── page.tsx               # Admin home — system status overview
│       │   └── services/
│       │       └── page.tsx           # CRUD for emergency services
│       ├── track/
│       │   └── [incidentId]/
│       │       └── page.tsx           # Individual incident detail
│       ├── login/
│       │   └── page.tsx               # Sign-in form
│       └── signup/
│           └── page.tsx               # Account creation
│
├── lib/
│   ├── i18n/
│   │   ├── LanguageProvider.tsx       # React context + localStorage persistence
│   │   └── translations.ts            # Message catalog — 7 languages × all keys
│   ├── supabase/
│   │   ├── client.ts                  # Browser Supabase client (createBrowserClient)
│   │   ├── server.ts                  # Server-side client (createServerClient + cookies)
│   │   └── middleware.ts              # Auth session refresh helper
│   └── types.ts                        # TypeScript types for all domain objects
│
├── components/
│   └── ResponderMap.tsx                # Leaflet map — renders responder markers, no SSR
│
├── middleware.ts                       # Next.js middleware — auth checks, locale routing
├── next.config.js                      # images.unoptimized=true, server actions body limit 2MB
├── tsconfig.json                       # strict mode, path aliases
└── package.json
```

### Web Routes & Pages

| Route | Page | Purpose | Auth required |
|-------|------|---------|--------------|
| `/` | Root | Redirect to `/en` | No |
| `/[locale]` | Locale root | Redirect to `./dashboard` | No |
| `/[locale]/dashboard` | Dashboard | Live incident feed + stats + map | Yes |
| `/[locale]/admin` | Admin home | System status + nav to sub-sections | Yes |
| `/[locale]/admin/services` | Service CRUD | Add/edit/delete emergency services | Yes |
| `/[locale]/track/[id]` | Incident detail | Per-incident status + contacts + map | Yes |
| `/[locale]/login` | Login | Email/password sign-in | No |
| `/[locale]/signup` | Sign up | Account creation | No |
| `/auth/callback` | OAuth callback | Supabase code exchange | No |

**Supported locales:** `en` `hi` `ta` `te` `kn` `ml` `mr`

### Web Core Features

#### 1. Live Dashboard (`/[locale]/dashboard`)

**Real-time subscriptions** (Supabase Realtime):
- Subscribes to `incidents` table `INSERT` events → live row appears at top of list
- Responder locations broadcast channel → map marker positions update

**Stats cards (auto-updating):**
- Active incidents count
- Total SOS alerts sent
- Active responders online
- Average response rate (%)

**Incident list:**
- Filter tabs: All / Auto (crash detected) / Manual (SOS button)
- Each row: trigger type badge, timestamp, location address, status badge (Active / Resolved)
- Clicking → navigates to `/track/[id]`

**Responder map** (`components/ResponderMap.tsx`):
- Leaflet (no SSR — loaded dynamically with `next/dynamic`)
- Markers for each active responder colored by type (ambulance, police, fire)
- Popups show responder name + last updated time

**Connection indicator:**
- Green "Live" badge when Supabase Realtime connected
- Amber "Offline" badge when connection drops

#### 2. Incident Detail (`/[locale]/track/[incidentId]`)

- Location: address + coordinates + Google Maps link
- SMS delivery status per contact (delivered / failed)
- Nearby services contacted
- Timestamp + trigger type + resolution status

#### 3. Admin Panel (`/[locale]/admin`)

**System status display:**
- Database connectivity (Supabase ping)
- Realtime subscription health
- Total services registered

**Service management** (`/[locale]/admin/services`):
- Table of all registered emergency services
- Add new service: name, type, address, phone, 24x7 flag, lat/lng
- Edit existing entries
- Delete with confirmation

#### 4. Internationalization

**Implementation:** `lib/i18n/LanguageProvider.tsx` + `translations.ts`

- 7 languages: English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi
- Language code embedded in URL (`/en/`, `/hi/`, etc.)
- `useLanguage()` hook returns `t(key)` function for the active locale
- Fallback: missing translations fall through to English string
- Persistence: selected language saved to `localStorage`
- Header language switcher: dropdown updates URL prefix + localStorage

**Translation keys cover:** navigation labels, dashboard stats, incident statuses, service types, error messages, form labels, button text.

#### 5. Authentication

**Library:** `@supabase/ssr`

- Server-side session via `createServerClient()` with cookie adapter
- `middleware.ts` refreshes sessions on every request
- Protected routes: dashboard, admin, track — redirect to `/[locale]/login` if no session
- OAuth callback at `/auth/callback` exchanges code → session cookie

### Web Dependencies

```json
{
  "next": "15.2.0",
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "typescript": "^5.7.0",
  "@supabase/ssr": "^0.6.0",
  "@supabase/supabase-js": "^2.49.0",
  "leaflet": "^1.9.4",
  "react-leaflet": "^5.0.0",
  "tailwindcss": "^4.1.0",
  "lucide-react": "latest"
}
```

### Web Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_DEFAULT_LANG=en
```

---

## Shared Data Models

Defined in `expo-app/types/index.ts` and mirrored in `web-app/lib/types.ts`:

```typescript
// Enumerations
type BloodGroup   = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
type Language     = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Malayalam' | 'Marathi'
type AppMode      = 'normal' | 'drive'
type Sensitivity  = 'low' | 'medium' | 'high'
type ServiceType  = 'hospital' | 'trauma_centre' | 'ambulance' | 'police' | 'towing' | 'puncture' | 'showroom'
type TriggerType  = 'auto' | 'manual'
type IncidentStatus = 'active' | 'resolved'

// Core objects
interface UserProfile {
  name: string
  bloodGroup: BloodGroup
  language: Language
  medicalInfo: {
    allergies: string
    medications: string
    conditions: string
  }
  crashDetectionEnabled: boolean
  crashSensitivity: Sensitivity
  appMode: AppMode
  devMode: boolean
  onboardingComplete: boolean
  batteryOptimization: boolean
}

interface EmergencyContact {
  id: string
  name: string
  phone: string
}

interface LocationData {
  lat: number
  lng: number
  address: string
  accuracy?: number
  timestamp: number
}

interface NearbyService {
  id: string
  name: string
  service_type: ServiceType
  address: string
  primary_phone: string
  is_24x7: boolean
  distance_km: number
  lat: number
  lng: number
}

interface Incident {
  id: string
  triggerType: TriggerType
  location: LocationData
  contacts: EmergencyContact[]
  smsStatuses: Record<string, 'sent' | 'failed'>
  createdAt: string
  status: IncidentStatus
}

interface Responder {
  id: string
  name: string
  lat: number
  lng: number
  type: 'ambulance' | 'police' | 'fire'
  updatedAt: string
}
```

### Supabase Tables

| Table | Key columns | Used by |
|-------|-------------|---------|
| `incidents` | id, trigger_type, lat, lng, address, status, created_at | Both |
| `crash_logs` | id, detected_at, mode, sensitivity, g_force, jerk_gs, lat, lng, address, outcome | Mobile |
| `services` | id, name, service_type, address, primary_phone, is_24x7, lat, lng | Both |
| `responders` | id, name, lat, lng, type, updated_at | Web |
| `profiles` | id (auth uid), name, blood_group, language, medical_info | Mobile (optional) |

---

## Architectural Decisions

### 1. Offline-First on Mobile

All safety-critical features work without internet:
- Crash detection runs on-device sensors
- SOS SMS uses device radio (no internet path)
- Contacts and profile stored in AsyncStorage
- Nearby services cached for 7 days
- AI has 3-tier fallback ending with static scripts

Internet is only needed for: cloud AI (tier 1), Supabase incident logging, model download.

### 2. Native Android Service for Background Crash Detection

Expo's JS thread can be killed by Android's memory manager. A Kotlin foreground service (`CrashDetectionService`) keeps the sensor loop alive:
- Holds `PARTIAL_WAKE_LOCK`
- Runs accelerometer listener on `SensorManager`
- Performs entire countdown → SMS → Supabase flow natively
- SharedPreferences used for cross-process data (location, contacts, crash timestamp)
- On app resume, JS calls `consumeNativePendingCrash()` to check if a crash fired while app was dead

### 3. Supabase Realtime on Web

The web dashboard uses Supabase Realtime to push new incident rows to all connected dashboards instantly — no polling. This makes the dashboard usable in emergency coordination centers where responders need live data.

### 4. URL-Based i18n on Web

Seven Indian language prefixes in the URL (`/en/`, `/hi/`, etc.) make links shareable at the correct locale. The Next.js middleware handles locale detection and session refresh in one pass.

### 5. Groq for Cloud AI

Groq's LPU inference hardware delivers Llama 3.3 70B responses in 1–3 seconds — fast enough for emergency guidance. The mobile app injects full user context (blood group, medical info, location, nearby services) into every system prompt.

### 6. llama.rn for On-Device AI

`llama.rn` (0.5.10) wraps llama.cpp for React Native. The 3B model runs on-device with no internet. The fine-tuned RoadSoS variant was trained on 210+ Indian road-safety Q&A pairs for domain accuracy.

### 7. NativeWind for Mobile Styling

Tailwind utility classes via NativeWind keep styling consistent with the web app's Tailwind setup. The shared design token file (`constants/theme.ts`) exports raw hex values used by both NativeWind and direct StyleSheet calls.

---

## Summary Comparison

| Dimension | expo-app | web-app |
|-----------|----------|---------|
| Primary user | Driver / road user | Emergency coordinator / admin |
| Framework | Expo 54 + React Native | Next.js 15 App Router |
| Navigation | Expo Router (file-based) | Next.js App Router + locale segment |
| Styling | NativeWind + Tailwind 3 | Tailwind 4 |
| Auth | Supabase (optional) | Supabase SSR (required for dashboard) |
| Offline | Full — all features work | Partial — realtime features offline |
| AI | 3-tier: Groq → Llama RN → scripts | None |
| Sensors | Accelerometer, GPS, SMS | Browser APIs only |
| Maps | Leaflet via WebView | react-leaflet (dynamic import) |
| i18n | AsyncStorage picker | URL prefix + localStorage |
| Data store | AsyncStorage + SharedPreferences | Supabase only |
| Background | Kotlin foreground service | N/A |
| Build | Gradle (Android) / Xcode (iOS) | Vercel / Node.js server |
