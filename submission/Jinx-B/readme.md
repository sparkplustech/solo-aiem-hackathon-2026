# SmartFactory 360°

## Team Name
Jinx B

## Team Members
- Marshal Fernandes
- Rylan Franco
- Winfred Carvalho

## Selected Domain
Manufacturing

---

## Problem Statement

**Factory operations are running blind.**

- **No real-time visibility** — managers have no live view of which machines are running, failing, or idle
- **Reactive maintenance** — workers don't know how to handle faults; escalation paths are paper-based and slow
- **Manual attendance tracking** — no reliable way to know where workers are, when they arrived, or how productive each shift was

> **Result:** unplanned downtime, delayed repairs, wasted labour hours, and decisions made on stale data

---

## Solution

**SmartFactory 360° — an integrated smart factory platform connecting every machine, worker, and manager in real time**

- A live **3D digital twin** of the factory floor — click any machine or worker to see status, health, and current task
- An **AI maintenance chatbot** that triages issues, guides self-resolution, and auto-creates tickets for complex faults
- A **mobile app** that tracks worker attendance via GPS — clock-in, clock-out, SOS button, and push notifications
- A **manager dashboard** with live KPIs, machine health table, ticket queue, and one-click broadcast alerts

---

## Features

| Feature | Description |
|---|---|
| 3D Digital Twin | Color-coded machines (green/amber/red), clickable worker nodes, live position updates every 10s via WebSocket |
| AI Chatbot | Claude-powered severity triage — Simple resolves in chat, Complex auto-creates a ticket and alerts the manager |
| Mobile App | Geofenced clock-in, background GPS tracking, offline queue, one-tap SOS with live coordinates |
| Manager Dashboard | Live KPI tiles, attendance heatmap, machine health table, ticket queue, broadcast messaging, PDF/CSV export |
| Predictive Maintenance | Machines auto-flagged when health score drops below threshold — 7-day sparkline trend per machine |
| Bonus Features | QR machine scan, voice chatbot input, worker productivity leaderboard, CCTV feed, safety SOS |

---

## Tech Stack Used

**Frontend**
- React 18 + TypeScript — web dashboard & 3D viewer
- Three.js + React Three Fiber — 3D digital twin rendering
- Tailwind CSS + Zustand + React Query — UI and state management
- Expo (React Native) / PWA — mobile worker app

**AI & Real-time**
- Anthropic Claude API — chatbot intelligence and issue triage
- Django Channels + Redis — WebSocket live updates
- Celery — async notifications and report generation

**Backend & Infrastructure**
- Django 5 + Django REST Framework — API and business logic
- PostgreSQL — primary data store
- Django SimpleJWT — role-based auth (worker / manager / engineer / admin)
- AWS S3 / MinIO — image uploads and report storage

**Deployment**
- Railway / Render — Django backend
- Vercel / Netlify — React frontend
- Firebase FCM — mobile push notifications

## AI Tools Used
Google Stitch, AI Studio, Gemini, Claude

---

## How to Run the Project

### 1. Run Backend Server

Open a terminal in the project root folder and run:

```powershell
cd backend
& .\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

### 2. Run Opsync Frontend

Open a new terminal and run:

```powershell
cd frontend\Opsync
npm install
npm run dev
```

### 3. Run Worker App

Open another terminal and run:

```powershell
cd frontend\worker-app
npm install
npm run dev
```

### 4. Run Mobile Camera App (Expo)

Open a new terminal and run:

```powershell
cd mobile-camera
npm install
npx expo start
```

**Steps to Stream Live Phone Video to CCTV Page:**
1. Make sure your phone and PC are connected to the **same WiFi network**.
2. Download and install the **Expo Go** app on your phone (Google Play Store / iOS App Store).
3. Scan the QR code displayed in your terminal using the Expo Go app.
4. Once the app loads on your phone, configure the PC's local IP address in the settings field (e.g. `http://192.168.1.XX:8000`).
5. Click **START LIVE BROADCAST** to stream live frames to OppSync's web CCTV page as **CAM 05 // MOBILE SECURITY** with live worker detection metadata!

> **Notes:**
> - Make sure Python virtual environment (`venv`) is already created inside the `backend` folder.
> - Ensure Node.js and npm are installed.
> - Keep all terminals running simultaneously.
> - Backend runs on port `8000`.
> - Frontend apps will show their local URLs in the terminal after starting.


## Future Scope

**Growth Roadmap**

- **Phase 1 (Now):** MVP — single factory, manual floor layout, demo data
- **Phase 2:** Multi-site support, CAD/SVG floor plan import, BLE beacon indoor positioning
- **Phase 3:** IoT sensor integration (OPC-UA, MQTT) — machines self-report health data
- **Phase 4:** Proprietary ML model for predictive maintenance, trained on customer data
- **Phase 5:** Marketplace of SOPs and integrations (ERP, SAP, Microsoft 365)

**Business Model**

- **SaaS Subscription** — per-seat or per-factory pricing across Starter / Growth / Enterprise tiers
- **Implementation Services** — paid onboarding, floor-plan setup, IoT wiring, and staff training
- **AI Insights Add-on** — premium tier with predictive maintenance scoring, custom anomaly models, and shift optimisation reports

**Target KPIs**

| Metric | Target |
|---|---|
| Machine downtime reduction | 30% decrease |
| Attendance tracking accuracy | > 95% |
| Issues self-resolved by AI chatbot | > 50% |
| Manager alert response time | < 5 minutes |
