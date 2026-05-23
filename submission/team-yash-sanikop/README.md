# SyncOS: The AI Meeting-to-Action Operating System

![SyncOS Banner](https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge)
![AI-Powered](https://img.shields.io/badge/AI-Gemini--Native-blue?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-Supabase-3ecf8e?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-React--19-61dafb?style=for-the-badge)

**SyncOS** is not just a meeting summarizer—it is an intelligent execution platform. It transforms conversations into actionable workflows automatically using Google Gemini's multimodal intelligence.

> **"From Discussion to Delivery in a Single Click."**

---

## 🚀 Vision
SyncOS solves the "Post-Meeting Void." Too many decisions and action items are lost in transcripts. SyncOS acts as the central intelligence layer for team execution:
1. **Ingest**: Live audio capture or file uploads.
2. **Analyze**: Gemini 1.5 Flash processes audio directly (multimodal) to extract logic.
3. **Execute**: Action items are automatically injected into a persistent Kanban workflow.
4. **Govern**: Risks and blockers are detected and flagged before they derail projects.

---

## ✨ Key Features

### 🎙️ Intelligent Meeting Ingestion
- **Live Microphone Input**: Real-time browser-based recording.
- **Multimodal AI**: Unlike traditional tools that require Whisper (speech-to-text) then GPT (text-to-logic), SyncOS uses **Gemini 1.5 Flash** to analyze audio bytes directly for higher context retention.
- **Smart Transcription**: High-fidelity logs with automatic speaker differentiation.

### 🧠 AI Execution Engine
- **Automated Task Extraction**: AI detects tasks like *"Rahul will fix the API by Friday"* and creates a trackable ticket.
- **Risk & Blocker Detection**: Identifies unresolved topics, vague ownership, and unrealistic deadlines.
- **Executive Summaries**: High-signal, concise recaps for rapid stakeholder alignment.

### 📊 Modern Dashboard & Analytics
- **Execution Score**: Real-time tracking of team velocity and decision clarity.
- **Participation Parity**: Visualizes speaking distribution to ensure balanced team input.
- **Interactive Kanban**: A fully integrated task management system synced with AI outputs.

### 🌓 Premium Design System
- **Dual-Theme Support**: Polished Dark and Light modes.
- **Glassmorphism**: A futuristic, high-end enterprise aesthetic.
- **Framer Motion**: Fluid, "magical" transitions and interactions.

---

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4 (High-performance CSS-first engine)
- **State Management**: Zustand (Reactive store with API hydration)
- **Animations**: Framer Motion
- **Charts**: Recharts (Dynamic data visualization)

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **AI Core**: Google Generative AI (Gemini 1.5 Flash)
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Security**: Helmet, JWT, Multer (Secure file handling)

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- Google AI Studio API Key ([Get it here](https://aistudio.google.com/app/apikey))
- Supabase Project ([Create one here](https://supabase.com/))

### 1. Database Setup
Run the following SQL in your Supabase SQL Editor:
```sql
-- Create Meetings Table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  transcript TEXT,
  summary TEXT,
  action_items JSONB,
  risks JSONB,
  decisions JSONB,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  assignee TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'blocked', 'done')),
  deadline TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Backend Configuration
Navigate to `/backend`, create a `.env` file:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_secret_here

GEMINI_API_KEY=your_google_ai_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```
Then install and run:
```bash
npm install
npm run dev
```

### 3. Frontend Configuration
Navigate to `/frontend`:
```bash
npm install
npm run dev
```

---

## 🎨 UI Preview
SyncOS is built with a "Billion-Dollar Startup" aesthetic:
- **Dashboard**: `http://localhost:5173/dashboard`
- **Live Meeting**: `http://localhost:5173/meetings/live`
- **Kanban Tasks**: `http://localhost:5173/tasks`

---

## 🛡️ Security & Scalability
- **Data Persistence**: No data is lost; all AI insights are stored in PostgreSQL via Supabase.
- **Stateless Backend**: Designed for easy containerization and deployment.
- **Type Safety**: End-to-end TypeScript implementation.

---
Built with 💜 by **Elite Startup-Grade AI Engineer**
