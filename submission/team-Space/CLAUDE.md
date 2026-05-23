# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**RoadSoS** — an offline-first road-safety emergency response system for the AIEM Open Innovation Hackathon (Indian roads). The workspace holds **two independent applications plus a design package**, not a single project:

| Folder | What it is | Stack |
|--------|-----------|-------|
| `expo-app/` | Mobile app for drivers — crash detection, SOS SMS, AI first-aid | Expo 54 / React Native 0.81 / TypeScript |
| `web-app/` | Responder dashboard — live incident feed, map, admin | Next.js 15 App Router / React 19 |
| `RoadSOS/` | Claude-generated reference designs (JSX wireframes + CSS tokens) | Static — not built |

There is **no root `package.json`**. Each app has its own dependencies, its own `.git/`, and is developed independently. `cd` into the app folder before running anything. Two deep technical references already exist and should be consulted before large changes: `detailedinfo.md` (full architecture of both apps) and `expo-app/README.md` (mobile setup, AI tiers, build).

## Commands

All commands run from inside the relevant app folder.

### expo-app/
```bash
npm start                       # Expo dev server (Metro) — press a / i / w
npm run android                 # Build + run dev client on Android device/emulator
npm test                        # Jest (jest-expo preset)
npm test -- validators          # Run a single test file by name pattern
npm run test:watch              # Jest watch mode
npm run build-apk               # Windows release APK via android/gradlew.bat
```
Tests live in `expo-app/tests/`, mirroring `lib/`, `hooks/`, `components/`. There is no lint script — TypeScript is `strict` with `noUncheckedIndexedAccess`.

### web-app/
```bash
npm run dev                      # Next dev server on :3000
npm run build                    # Production build
npm run lint                     # next lint
```
The web app has no test suite.

### expo-app/server/ (WebRTC signaling — run separately, optional)
```bash
npm run start:all                # Responder server + signaling server together
```

Path alias `@/*` resolves to the app root in **both** apps (e.g. `@/lib/supabase`).

## Windows build gotcha — release APK must build from a space-free path

The workspace path contains spaces (`RoadSafety Hackathon`, `AIEM Open Innovation Hackathon`). The Android CMake/ninja native build **cannot build from a path containing spaces** — `react-native-worklets`/`reanimated` fail with `ninja: error: manifest 'build.ninja' still dirty after 100 tries`. The `junction-fix` in `android/app/build.gradle` does **not** solve this: autolinked native modules resolve their real path via `node`, so a junction is seen through to the spaced path.

The project's **real** filesystem path must have no spaces. The working setup: **`D:\rsos`** is a full mirror of `expo-app` at a space-free path; the release APK is built there.

1. Sync current code into the mirror: `robocopy "<expo-app>" D:\rsos /MIR /XD .cxx .expo` (also exclude `android\.gradle`, `android\app\build`). `robocopy` exit codes 1–7 mean success.
2. From `D:\rsos\android`, run `.\gradlew.bat clean` and `.\gradlew.bat assembleRelease` as **two separate** invocations — combining `clean` with build tasks races and breaks the worklets→reanimated prefab step.
3. APK: `D:\rsos\android\app\build\outputs\apk\release\app-release.apk` (~125 MB, signed with the debug keystore).

Other native-build notes: `D:\b` is a hardcoded shared subproject build dir (`android/build.gradle`) reused by every project copy — `gradlew clean` clears it. `android/app/build.gradle` carries `pickFirsts += ['**/libworklets.so']` because reanimated 4.x re-exports the worklets native lib, which otherwise fails `mergeReleaseNativeLibs` with a duplicate.

## Architecture — the parts that span multiple files

### Shared backend, no shared code
Both apps talk to the **same Supabase project** (PostgreSQL + Realtime) but share no source. Domain types are duplicated: `expo-app/types/index.ts` and `web-app/lib/types.ts` must be kept in sync by hand. Key tables: `incidents`, `crash_logs`, `services`, `responders`, `profiles`.

### Mobile: offline-first is the core constraint
Every safety-critical path must work with no internet. When changing the SOS, crash, or services flows, preserve this:
- **Primary store is the device** — `lib/offline-cache.ts` (AsyncStorage) for profile/contacts/incidents/services; Supabase sync is always optional and fire-and-forget.
- SOS SMS goes over the device radio (`lib/direct-sms.ts`), never an internet path.
- Nearby services have a seeded dataset + 7-day AsyncStorage cache.
- Missing API keys degrade gracefully — never make a feature hard-fail on a missing `EXPO_PUBLIC_*` env var.

### Mobile: native Android crash service
Crash detection cannot live only in JS — Android kills the JS thread under memory pressure. The design is split:
- `hooks/useCrashDetector.ts` — JS-side accelerometer algorithm (dual-mode: jerk+EMA for "drive", raw threshold for "normal"; 3 sensitivity presets).
- `android/.../CrashDetectionService.kt` — Kotlin **foreground service** that runs the full countdown → SMS → Supabase flow natively, even with the JS thread dead.
- `lib/native-crash-service.ts` — the JS↔Kotlin bridge. Cross-process data (location, contacts, pending-crash flag) passes through **SharedPreferences**; on resume JS calls `consumeNativePendingCrash()`.

Changing crash behavior usually means editing **both** the TS hook and the Kotlin service.

### Mobile: 3-tier AI ladder
The chat screen picks the best inference tier per request, not once at startup:
1. **Cloud** — Groq `llama-3.3-70b-versatile` (`lib/groq.ts`), used when online.
2. **Local** — on-device Llama 3.2 / RoadSoS 3B via `llama.rn` (`lib/local-llm.ts`), if the model is downloaded.
3. **Fallback** — a short honest pointer to 112. Do **not** auto-dump a canned first-aid list here — it was deliberately removed because it ignores the user's actual question.

Both AI tiers stream; a 90s watchdog aborts hung completions. Full user context (blood group, medical info, location, nearby services) is injected into every prompt.

### Web: locale-segment routing
Routes live under `app/[locale]/` for 7 Indian languages (`en hi ta te kn ml mr`). `middleware.ts` handles **both** locale routing and Supabase session refresh in one pass. i18n is a custom context (`lib/i18n/`), not next-intl. The dashboard uses Supabase **Realtime** subscriptions for the live incident feed — no polling. Leaflet maps are dynamically imported with SSR disabled.

### Design as source of truth
Screens in `expo-app` are built against the wireframes in `RoadSOS/`. Treat that JSX as authoritative for **layout and visual hierarchy only** — the real implementation uses live state, animations, and lucide icons. Color/spacing tokens in `RoadSOS/tokens.css` are mirrored into `expo-app/constants/theme.ts`.

## Conventions

- Immutable updates — never mutate objects/arrays in place.
- Validate at boundaries — `lib/validators.ts` for user input; never trust API/file data.
- Many small focused files over large ones; keep functions under ~50 lines.
- New mobile features need Jest coverage in `tests/`; the project targets 80%+ coverage.
