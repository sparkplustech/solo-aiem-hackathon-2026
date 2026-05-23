# Aegis: AI Deepfake & Synthetic Media Detector

## Team Name
Codekillers

## Team Members
- Shreyash Sawant
- Ved Rankale 
- Shubham Parab

## Selected Domain
Environment & Public Safety 

## Problem Statement
The rapid advancement of generative AI has led to an explosion of malicious deepfakes, voice cloning, and synthetic media. Victims of digital harassment and misinformation lack accessible, private, and fast tools to prove the authenticity of media. Existing solutions either require technical expertise, store user data, or are hidden behind enterprise paywalls.

## Solution
Aegis is a zero-storage, privacy-first web application that allows users to instantly analyze images and videos for AI manipulation. Using a multi-layered heuristic forensic pipeline, Aegis analyzes EXIF metadata, facial blending artifacts, and temporal consistency to provide a verifiable "Authenticity Score." Designed for everyday users, it processes everything in-memory and leaves no digital footprint.

## Tech Stack Used
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, JavaScript
- **Backend:** Node.js, Express, Multer (for in-memory buffer processing)
- **Tools & Libraries:** Lucide-React for iconography, jsPDF for forensic report generation

## AI Tools Used
- **Google Gemini:** Utilized extensively during the hackathon for rapid prototyping, architecting the React component tree, and developing the Node.js heuristic analysis pipeline.

## Features
- **Live Webcam Scanning:** Record a 5-second live video to instantly scan for real-time deepfake filters and virtual camera manipulation.
- **Multi-Layered Forensic Engine:** Analyzes EXIF data, GAN (Generative Adversarial Network) noise, and temporal continuity.
- **Zero-Storage Architecture:** Files are processed purely in RAM using memory buffers and are never saved to a disk or database.
- **One-Click Takedown Reports:** Automatically generates an exportable PDF forensic report with case IDs for social media or law enforcement escalation.
- **Spot the Fake Mini-Game:** An interactive, educational module to teach users about the dangers of synthetic media.

## How to Run the Project

1. **Download the project** and extract the folder.
2. **Open the folder** in your terminal or command prompt.
3. **Install all dependencies** by running:
   ```bash
   npm install
   ```
4. **Start both the frontend and backend servers concurrently** by running:
   ```bash
   npm run dev
   ```
5. **Open the project in browser:** The app will automatically launch, or you can navigate to `http://localhost:5173`.

## Demo / Screenshots
*(Add demo link or screenshots here during submission)*

## Future Scope
- **Aegis for Chrome (Browser Extension):** An auto-pilot extension that seamlessly integrates with Twitter and Instagram to automatically blur malicious deepfakes while scrolling.
- **True Deep Learning Integration:** Upgrading the current Express orchestration layer to connect with a Python/TensorFlow microservice for heavy neural network processing.
- **Audio Forensics (Voice Cloning Detection):** Expanding the engine to accept `.mp3` and `.wav` files to protect against voice-cloned phone scams.
