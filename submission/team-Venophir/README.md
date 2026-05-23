# ResqNet – Decentralized Offline-First Disaster Response Platform

## Team Name
TEAM VENOPHIR

## Team Members
- Nihar Jakhi
- Eric Pinto
- Omkar pednekar

## Selected Domain
Environment & Public Safety

## Problem Statement

Imagine being trapped during a severe flood or earthquake. Power lines are down, cellular towers have collapsed, and your phone shows “No Signal.” At the exact moment people need help the most, modern disaster response systems become unreliable because they are heavily dependent on internet connectivity and centralized rescue infrastructure.

During large-scale disasters, official rescue teams quickly become overwhelmed. Authorities struggle to identify genuine emergencies because fake images and unverified SOS reports consume valuable time and resources. At the same time, capable local civilians nearby often have the ability to help, but there is no secure, coordinated system to connect them with victims in real time.

Existing disaster applications mainly focus on sending alerts or awareness notifications, but they do not provide offline survival assistance, realtime rescue coordination, evidence verification, or decentralized rescue support.

## Solution

ResqNet is a decentralized, offline-first disaster response ecosystem designed to function even when communication infrastructure fails.

The platform combines:
- Offline Edge AI survival guidance
- Realtime rescue coordination
- Fake image verification
- Live disaster mapping
- Smart rescue assignment
- Resource allocation
- Web3 civilian rescue incentives

When a victim triggers SOS, the app captures GPS coordinates, verifies uploaded evidence locally, and stores the emergency offline. Once connectivity becomes available, the report syncs instantly to the Admin Command Center using Firebase Realtime Database.

The admin receives realtime alerts on a live Google Maps dashboard and can dispatch the nearest rescue teams based on disaster category, location, and resource availability.

If official rescue resources are unavailable, ResqNet activates a decentralized civilian rescue network using Web3 smart contracts and USDC escrow rewards.

## Tech Stack Used

### Frontend
- React.js (Vite)
- Tailwind CSS
- Lucide React

### Backend & Realtime Infrastructure
- Firebase Realtime Database
- Firebase Storage
- Socket.IO WebSockets

### Mapping & Geolocation
- Google Maps API
- Google Directions API
- HTML5 Geolocation API

### AI & Edge Computing
- Custom Local NLP Decision Engine
- IndexedDB
- LocalStorage
- EXIF Metadata Parsing

### Web3
- Solidity Smart Contracts
- Ethers.js
- MetaMask Integration
- USDC Escrow System

## AI Tools Used

- Custom Edge AI NLP Engine
- Rule-Based Decision Tree AI
- Voice-to-Text Recognition
- EXIF Metadata Verification Engine

## Features

### 1. Offline-First Survival Engine
Works even without internet connectivity using local caching and IndexedDB.

### 2. Hands-Free Voice SOS
Users can trigger SOS using voice commands during emergencies.

### 3. AI 10-Minute Survival Plan
Edge AI generates instant survival precautions without internet.

### 4. Fake Image Detection
Detects edited or old disaster images using EXIF metadata analysis.

### 5. Live Disaster Tracking
Realtime Google Maps tracking of rescue teams and victims.

### 6. Smart Rescue Assignment
Automatically assigns nearest available rescue team.

### 7. Resource Allocation Engine
Allocates disaster-specific rescue resources dynamically.

### 8. Live Radio Communication
Realtime communication between victim, admin, and rescuers.

### 9. Web3 Rescue Incentive System
Uses smart contracts to reward verified civilian rescuers.

### 10. Admin Command Center
Realtime operational dashboard for authorities and rescue coordination.




## How to Run the Project

1. Clone the repository
2. Open the project folder
3. Install dependencies

```bash
npm install
npm run dev


#Future scope

## Future Scope

### 1. AI-Based Disaster Prediction
Future versions of ResqNet can integrate Machine Learning models and weather datasets to predict floods, landslides, cyclones, and wildfire risks before they occur.

### 2. Drone-Assisted Rescue Operations
Rescue drones can be integrated for:
- live aerial surveillance
- thermal victim detection
- medicine delivery
- inaccessible area monitoring

### 3. Satellite & ISRO Integration
The platform can integrate satellite imagery and ISRO disaster-monitoring APIs for realtime large-scale disaster visualization and early warning systems.

### 4. Offline Mesh Networking
Future versions can use Bluetooth Mesh and LoRa communication to allow nearby devices to communicate even without cellular towers or internet infrastructure.

### 5. Multi-Language AI Survival Assistant
The Edge AI system can support multiple Indian regional languages such as:
- Hindi
- Marathi
- Konkani
- Tamil
- Bengali

making emergency assistance accessible to rural populations.

### 6. IoT Disaster Sensor Integration
IoT devices such as:
- flood sensors
- smoke detectors
- seismic sensors
- river-level monitors

can automatically trigger alerts directly into ResqNet.

### 7. Blockchain Identity Verification
Blockchain-based digital identity verification can prevent fake rescuers and improve trust in decentralized rescue operations.

### 8. Government Emergency System Integration
ResqNet can integrate with:
- NDMA
- Police departments
- Fire departments
- Coast Guard systems
- Hospital emergency networks

for unified national disaster management.

### 9. Smart Wearable Integration
Future versions can integrate with:
- smartwatches
- health bands
- medical IoT devices

to monitor:
- heart rate
- oxygen level
- motion detection

during emergencies.

### 10. Autonomous Resource Optimization
AI-based logistics systems can dynamically optimize:
- fuel distribution
- rescue routing
- medical supply allocation
- shelter management

during large-scale disasters.

### 11. AR-Based Rescue Navigation
Augmented Reality (AR) overlays can guide rescuers inside:
- collapsed buildings
- flooded streets
- smoke-filled environments

for safer rescue missions.

### 12. National Disaster Data Intelligence Platform
ResqNet can evolve into a centralized national disaster analytics platform that helps governments analyze:
- disaster frequency
- rescue efficiency
- high-risk zones
- climate vulnerability patterns


