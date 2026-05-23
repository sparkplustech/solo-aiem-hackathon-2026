# FloodVision — Flood Monitoring & ESP32 IoT Dashboard

A real-time flood monitoring system with a React frontend, Django backend, and live ESP32 HC-SR04 ultrasonic sensor integration.

---

## Project Structure

```
new ashvek main/
├── FloodVision/
│   ├── Flood vision frontend/     # React + Vite + TypeScript frontend
│   └── floodv_ision_backend/      # Django backend (AI analysis + ESP32 telemetry)
│       ├── flood/                 # CCTV flood AI analysis app
│       └── espdata/               # ESP32 real-time sensor data app ← NEW
└── esp_sketch/
    └── esp_sketch.ino             # ESP32 Arduino firmware
```

---

## Quick Start — Running All Three Components

### 1. Enable Windows Mobile Hotspot

1. Open **Settings → Network & Internet → Mobile Hotspot**
2. Turn on the hotspot
3. Note the **IP address** shown (should be `10.111.152.66`)

> The ESP32 is hardcoded to connect to **Rehan's Laptop** hotspot. Make sure the hotspot is ON before powering the ESP32.

---

### 2. Flash the ESP32

> **Requirements:** Arduino IDE with ESP32 board support installed.

1. Open `esp_sketch/esp_sketch.ino` in Arduino IDE
2. Select board: `ESP32 Dev Module`
3. Select the correct COM port
4. Click **Upload**
5. Open Serial Monitor at `115200 baud` to confirm:
   ```
   [WiFi] Connected! IP: 10.x.x.x
   [Sensor] Distance: 42.50 cm
   [HTTP] POST OK (200): {"status": "ok", "flood_alert": false}
   ```

**Wiring:**
| HC-SR04 Pin | ESP32 GPIO |
|---|---|
| TRIG | GPIO 5 |
| ECHO | GPIO 18 |
| VCC | 5V |
| GND | GND |

**Flood threshold:** If the measured distance is **< 30 cm**, a flood alert is triggered.  
*(Water rising → distance from sensor to water surface shrinks)*

---

### 3. Start the Django Backend

```powershell
cd "FloodVision\floodv_ision_backend"

# First-time setup (activate virtual environment if using one)
pip install -r requirements.txt

# Run migrations (only needed once / after updates)
python manage.py migrate

# Start the development server
python manage.py runserver 0.0.0.0:8000
```

The backend will be accessible at:
- `http://localhost:8000/espdata/latest/` — Frontend polls this
- `http://localhost:8000/espdata/reading/` — ESP32 POSTs here
- `http://localhost:8000/espdata/health/` — Connectivity check
- `http://localhost:8000/analyze/` — AI flood detection (CCTV)
- `http://localhost:8000/admin/` — Django admin panel

> **Note:** Django must be running on `0.0.0.0:8000` (not just `127.0.0.1`) so the ESP32 can reach it through the hotspot at `10.111.152.66:8000`.

---

### 4. Start the React Frontend

```powershell
cd "FloodVision\Flood vision frontend"

# First-time setup
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

Navigate to the **IoT Telemetry** tab (sensor icon in the sidebar) to see:
- 🟢 **LIVE** status when ESP32 is connected and sending data
- **Real-time distance chart** updating every second
- **Flood alert banner + browser notification** when distance < 30 cm

---

## How It Works

```
HC-SR04 Sensor
      │
      ▼ (distance reading every 1 second)
   ESP32 (GPIO 5/18)
      │
      │ WiFi → HTTP POST {"distance_cm": 42.5}
      ▼
Django espdata app (port 8000)
  ├── Saves reading to SQLite DB
  ├── Keeps rolling 60-reading in-memory buffer
  └── Flags flood_alert = true if distance < 30 cm
      │
      │ HTTP GET /espdata/latest/ (polled every 1 second)
      ▼
React SensorsView (frontend)
  ├── Updates real-time distance chart
  ├── Shows LIVE/OFFLINE/CONNECTING status
  ├── Triggers browser push notification on flood
  └── Plays audio alarm on flood detection
```

---

## Flood Alert System

A flood is detected when the **measured distance < 30 cm**, meaning water has risen to within 30 cm of the sensor.

When a flood is detected:
1. **Django** logs a warning in the server console
2. **Django** sets `is_flood_alert = true` in the DB
3. **Frontend** shows a red ⚠ **FLOOD ALERT** banner at the top of the tab
4. **Browser push notification** fires (`FloodVision — FLOOD ALERT`)
5. **Audio alarm** plays (if browser allows audio)
6. **In-app toast** notification appears
7. The chart turns **red** while in flood state

> To change the threshold, edit `FLOOD_THRESHOLD_CM` in both:
> - `floodv_ision_backend/espdata/views.py`
> - `Flood vision frontend/src/components/SensorsView.tsx`

---

## ESP32 Endpoints (Django espdata app)

| Method | URL | Description |
|---|---|---|
| `POST` | `/espdata/reading/` | ESP32 sends `{"distance_cm": N}` |
| `GET` | `/espdata/latest/` | Frontend polls for live data |
| `GET` | `/espdata/health/` | Connectivity check |

---

## Environment Variables

Create a `.env` file in `Flood vision frontend/` (already gitignored):
```env
VITE_OPENWEATHER_API_KEY=your_key_here
```

---

## Django Admin

Visit `http://localhost:8000/admin/` and log in to:
- View all `SensorReading` records
- Filter by `is_flood_alert = True`
- See historical sensor data

---

## Troubleshooting

| Problem | Solution |
|---|---|
| ESP32 shows `[WiFi] Failed to connect` | Check hotspot is ON and SSID/password matches exactly in `.ino` |
| Frontend shows OFFLINE | Check Django is running on `0.0.0.0:8000` (not `127.0.0.1`) |
| Distance reads `-1.0` | HC-SR04 out of range (> 4m) or wiring issue |
| No browser notification | Click Allow when browser asks, or check `Notification.permission` in console |
| `CORS` error in browser | Ensure `corsheaders` is installed and `CORS_ALLOW_ALL_ORIGINS = True` in `settings.py` |
