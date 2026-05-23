# AutoPilot OS 🚀

An AI-powered academic operating system for students that automates friction from studying, note processing, exam revisions, assignment tracking, focus management, and metrics.

Built for the **AIEM × SOLO Open Innovation Hackathon 2026** under the **Education + AI Automation** domain.

---
# 👥  TEAM
Team Name: Error 503
Members:

Areeb Shaikh
Sarthak Kerkar
Vithal Yedage

# Selected Domain

Education + AI Automation

---

## 🌌 Problem Statement
Students face an overwhelming amount of fragmented academic information. They jump between PDF viewers for reading, separate calendar apps for tracking homework deadlines, standalone timer apps for focus, and flashcard tools for test prep. This modular scattering leads to:
1. **Inefficient Study Prep**: Summarizing 80-page textbook PDFs is tedious and slow.
2. **Missed Milestones**: Tracking assignment criteria and deadlines often fails when manual systems clutter.
3. **Imperfect Memory Retention**: Static manual notes lack active recall mechanics like flashcards or custom quiz boards.

## 💡 The Solution: AutoPilot OS
AutoPilot OS is a unified, full-stack, glassmorphic student platform that integrates all study workflows under one responsive academic core. Driven by **Gemini 3.5 Core** and backed by a **Zero-Trust Firebase Security Architecture**, it acts as an intelligent supervisor assisting the student's daily lifecycle.

---

## ✨ Core Features
- **AI PDF & Notes Summarizer**: Upload lecture PDFs or paste raw text. Gemini extracts executive summaries, exam-focused notes, and complex mathematical formulas instantly.
- **AI Quiz Generator**: Convert summaries directly into Multiple Choice Questions (with validator answers & explanations), flipped interactive flashcards, or viva verbal prep questions.
- **Smart Study Planner**: Maps exam dates and target courses against available study hours to generate optimized, resilient daily timetables.
- **Assignment Milestone Tracker**: Features direct countdown alerts, progress sliders, and an **AI PDF Extraction Helper** that scrapes due dates from assignment guidelines.
- **Immersive Focus Room**: Fullscreen Pomodoro clock with low-pass brown wave ambient humming noises to filter distractions, rewarding completed slots with score multipliers.
- **Historic Analytics Dashboard**: Displays study trends, focal curves, and subject weights using interactive graphs styled in Recharts.
- **Floating AI Chat Companion**: An active conversational guide capable of organizing tasks and answering syllabus questions on the fly.

---

## 🛠️ Technology Stack
- **Frontend**: React.js 19, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database + Auth**: Firebase Firestore Database, Google Authentication.
- **AI Engine**: @google/genai SDK (lazy initialized server-side).

---

## 📐 Project Architecture & Zero-Trust Verification

AutoPilot OS separates concerns to keep secrets safe from browser inspection.
```
┌────────────────────────────────────────────────────────┐
│                      Client View                       │
│  React.js UI / Framer Motion / Recharts / AuthContext  │
└───────────────────────────┬────────────────────────────┘
                            │
               POST API Query Requests / API
                            │
┌───────────────────────────▼────────────────────────────┐
│                  Express Proxy Server                  │
│       Vite Middleware / @google/genAI / multer         │
└───────────────────────────┬────────────────────────────┘
                            │
                   Secure Admin Queries
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Google Firestore                    │
│      Protected by Global firestore.rules Safety        │
└────────────────────────────────────────────────────────┘
```

---

## 🧪 Best Demo Flow (Judges Walkthrough)
1. **Boot OS**: Boot into the system with Google Federated Sign In.
2. **Synthesize Summaries**: Go to the **AI Note Summary** tab. Drag/drop a lesson PDF or paste conceptual notes. Click *Synthesize AI Study Bundle*.
3. **Diagnostic Testing**: Click *Generate Practice Quiz*. Practice dynamic multiple-choice questions, flip active flashcards, or study viva口试 questions.
4. **Resilient Scheduling**: Head to the **Smart Study Planner** tab. Input courses and exam timelines, then slide study hours to click *Synthesize Custom Agenda*.
5. **Autoset Milestones**: Open the **Assignments** tab. Upload homework instructions to see due dates, subject categories, and priorities auto-populate.
6. **Isolated Focus**: Open the **Focus Room**. Toggle *Ambient Sine Wave* low-hum, click *Start study*, and focus on your syllabus milestone!
7. **View Analytics**: Navigate to the **Academic Metrics** tab to review your performance charts!

---

## 🛡️ License
AutoPilot OS is distributed under the Apache-2.0 License.
