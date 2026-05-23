# Project Title

## Team Name
Team_Hustlers

## Team Members
- Member 1 : Diwyesh Nerkar
- Member 2 : Saish Chandroji


## Selected Domain
AI Automation

## Problem Statement
Manual web browsing is inefficient for users who want to interact with websites and access information without typing or clicking. Current browsing workflows are slow for hands-free users and do not leverage voice interaction to improve productivity.

## Solution
VoxBrowser provides a voice-powered AI browser assistant that lets users navigate the web, manage browsing sessions, and summarize content using natural speech commands. The app combines voice interaction, session history, and AI summarization in a modern React-based interface.

## Tech Stack Used
- React 19, Vite, TypeScript
- Node.js, Express
- Tailwind CSS, Lucide React
- Gemini, Google AI Studio integration

## AI Tools Used
- Google Gemini via `@google/genai`
- AI Studio app hosting reference

## Features
- Voice-enabled browsing assistant interface
- Demo sign-in and sign-up flow
- Session history management with add/delete support
- Gemini-powered transcription summarization endpoint
- Dark mode and user settings panel

## How to Run the Project
1. Install dependencies:
   `npm install`
2. Create an `.env.local` file and set:
   `GEMINI_API_KEY=your_gemini_api_key_here`
3. Run the development server:
   `npm run dev`
4. Open the app in your browser at:
   `http://localhost:3000`

## Additional Documentation
This repository also includes the following documentation files:
- [Project Structure](docs/PROJECT_STRUCTURE.md)
- [Setup Instructions](docs/SETUP_INSTRUCTIONS.md)
- [Implementation Details](docs/IMPLEMENTATION_DETAILS.md)
- [Final Working Updates](docs/FINAL_WORKING_UPDATES.md)
- [Evaluation Guide](docs/EVALUATION_GUIDE.md)

____________________________________________________________________________________________________________________________________________________________________

**Markdown**
# VoxBrowser - AI Voice Browser Assistant

**AIEM × SOLO Open Innovation Hackathon 2026**  
**Domain:** AI Automation


 📋 Project Overview

**VoxBrowser** is an intelligent voice assistant specifically designed for web browsers. It allows users to control their browsing experience using natural voice commands — eliminating the need for manual clicking, typing, or navigation.

Whether you're a student, professional, or someone with accessibility needs, VoxBrowser makes web interaction faster, smarter, and more intuitive.


✨ Key Features

- **Voice Navigation** — Open websites, go back/forward, refresh, switch tabs
- **Smart Search** — Search Google, YouTube, or any site using voice
- **Page Interaction** — Click elements, fill forms, scroll, and read content aloud
- **Voice Commands** — Natural language understanding (e.g., "Open YouTube and play trending videos")
- **Text-to-Speech** — Read webpage content aloud
- **Hands-free Experience** — Full browser control without keyboard/mouse
- **Real-time AI Processing** — Powered by modern AI tools


🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Voice Recognition:** Web Speech API (SpeechRecognition)
- **Text-to-Speech:** Web Speech API (SpeechSynthesis)
- **AI Integration:** Gemini AI / Google AI Studio (for intent understanding & smart responses)
- **Browser Automation:** Custom DOM manipulation + potential future Chrome Extension
- **Development Tools:** Gemini CLI, GitHub


🚀 Setup Instructions

Prerequisites
- Modern web browser (Chrome recommended)
- Microphone access enabled

Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/VoxBrowser-AIEM-Hackathon-2026.git


2. Navigate to the project directory:
   ```bash
   cd VoxBrowser-AIEM-Hackathon-2026
   

3. Open `index.html` in your browser

4. Allow microphone permission when prompted

5. Click the **🎤 Start Listening** button and begin giving voice commands!



🎯 How It Works

1. User speaks → Browser captures audio
2. Speech is converted to text using Web Speech API
3. Text is processed by AI (Gemini) for intent understanding
4. Appropriate browser action is executed
5. System provides voice feedback



📂 Project Structure


VoxBrowser-AIEM-Hackathon-2026/
├── index.html
├── style.css
├── script.js
├── README.md
├── assets/
│   └── icons/
├── docs/
│   └── commands-list.md
└── demo/




🔗 Demo & Screenshots





🤖 AI Usage

This project heavily utilizes **Google Gemini AI** for:
- Understanding natural language voice commands
- Smart intent classification
- Contextual responses
- Future scope: personalized user behavior learning



📌 Hackathon Submission Details

- **Event:** AIEM × SOLO Open Innovation Hackathon 2026
- **Domain:** AI Automation
- **Team:** Team Hustlers
- **Members:** Diwyesh Nerkar, Saish Chandroji



🔮 Future Scope

- Chrome Extension version
- Multi-language support
- Integration with browser history & bookmarks
- Accessibility mode for specially-abled users
- AI-powered summarization of webpages



📄 License

This project is developed as part of the AIEM × SOLO Hackathon 2026.
