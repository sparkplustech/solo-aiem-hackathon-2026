# Flood Vision

## JINX a

## Team Members

- Ashvek
- Rehan
- Mukund

## Selected Domain

Environment & Public Safety

## Problem Statement

Traditional flood monitoring relies on expensive infrastructure and is often slow to react. Communities lack real-time, hyperlocal awareness of street-level flooding, leading to traffic chaos and safety risks during heavy rains.

## Solution

Flood Vision is a gamified, community-driven flood detection system powered by Gemini AI and IoT. It allows citizens to snap photos of flooded areas, which are instantly validated by Gemini Vision to estimate water depth. Additionally, hardware nodes (ESP32 with HC-SR04 ultrasonic sensors) provide live, real-time water level data. All data is fused onto an interactive live map that automatically reroutes users around blocked roads.

## Tech Stack Used

- **Frontend:** HTML, CSS, TypeScript, React, Tailwind CSS, Zustand
- **Backend:** Python, Django, REST Framework
- **Hardware/IoT:** ESP32, HC-SR04 Ultrasonic Sensors, C++
- **APIs/AI:** Gemini Vision API, Google Maps API

## AI Tools Used

- **yolo and open cv:**used the street image predicts the chanhes of flood hapenning

## Features

- **Real-Time IoT Monitoring:** Live water depth tracking using ESP32 hardware and ultrasonic sensors.
- **AI Crowd-Sourced Reports:** Users can submit photos of flooded areas, which are instantly verified by Gemini AI.
- **Dynamic Route Optimizer:** Google Maps integration that automatically calculates alternate routes and avoids flooded paths in real-time.
- **Gamified Community Engagement:** Leaderboards, points, and badges (e.g., Flood Guardian) to encourage citizen participation.
- **Live Interactive Dashboard:** Sleek UI with real-time latency polling, rain sector simulation, and status indicators.

## How to Run the Project

1. Download the project and extract it.
2. Open the main folder in your terminal.
3. Start the Django backend:
   ```bash
   cd floodv_ision_backend
   python manage.py runserver 0.0.0.0:8000
   ```
4. Open a new terminal and start the React frontend:
   ```bash
   cd "Flood vision frontend"
   npm install
   npm run dev
   ```
5. Open the project in browser at `http://localhost:5173`

## Screenshots

## ![alt text](image.png)

## ![alt text](image-1.png)

## Future Scope

- **Smart City Integration:** Connecting directly with municipal drainage management systems for predictive maintenance.
- **Cellular Hardware Nodes:** Upgrading ESP32 modules with GSM/LTE for deployment in remote areas without WiFi.
- **Predictive AI Modeling:** Using historical data, weather forecasts, and machine learning to predict floods hours before they happen.
