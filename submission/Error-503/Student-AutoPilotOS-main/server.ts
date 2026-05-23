import express, { Request, Response } from "express";
import path from "path";
import multer from "multer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
let pdfParseLib = require("pdf-parse");
if (pdfParseLib && typeof pdfParseLib !== "function" && (pdfParseLib as any).default) {
  pdfParseLib = (pdfParseLib as any).default;
}

// Gracefully format Google Gemini API / rate limiting error dumps into helpful user-facing tips
function formatGeminiError(err: any): string {
  const errMsg = err instanceof Error ? err.message : String(err);
  if (
    errMsg.includes("429") ||
    errMsg.includes("RESOURCE_EXHAUSTED") ||
    errMsg.includes("quota") ||
    errMsg.includes("Quota exceeded") ||
    errMsg.includes("rate-limits")
  ) {
    return "The Academics AI service is currently at maximum capacity or your design/prompt exceeded the Gemini free-tier input limits. " +
           "Please wait 10-15 seconds and try again! For very large files, try copying only the key sections to reduce input tokens.";
  }
  return errMsg || "Failed to process lecture notes.";
}

// Safely truncate incredibly large texts to avoid exceeding token limit bounds
function safeTruncate(text: string, maxLength: number = 50000): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "\n\n[...Lecture material truncated to stay within API limit guidelines...]";
}

// Robust helper to parse buffer which falls back to clean binary-to-string extraction on failure
async function extractTextFromPdfOrBuffer(buffer: Buffer, mimetype: string, originalname?: string): Promise<string> {
  const isPdf = mimetype === "application/pdf" || originalname?.toLowerCase().endsWith(".pdf");
  let text = "";
  if (isPdf) {
    try {
      if (typeof pdfParseLib === "function") {
        const parsed = await pdfParseLib(buffer);
        if (parsed && typeof parsed === "object" && typeof parsed.text === "string" && parsed.text.trim().length > 0) {
          text = parsed.text;
        }
      }
    } catch (pdfErr) {
      console.warn("pdf-parse library failed, falling back to raw string decoding:", pdfErr);
    }
    // Fallback PDF text recovery: look for PDF text streams/blocks, clean control chars
    if (!text) {
      try {
        const rawText = buffer.toString("utf-8");
        // Strip most non-printable control characters, but keep standard spaces/newlines
        const cleaned = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "").trim();
        if (cleaned.length > 50) {
          text = cleaned;
        }
      } catch (fallbackErr) {
        console.error("Manual text stream extraction backup failed:", fallbackErr);
      }
    }
  } else {
    text = buffer.toString("utf-8");
  }
  return safeTruncate(text, 50000);
}

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Max file size: 10MB
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Lazy initialization of Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -----------------------------------------------------------------------------
// API Route 1: /api/summarize
// Receives either a copy-pasted text/notes or a PDF. Extracts content, sends to AI.
// -----------------------------------------------------------------------------
app.post("/api/summarize", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    let text = req.body.text || "";

    if (req.file) {
      text = await extractTextFromPdfOrBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
    }

    if (!text || text.trim().length === 0) {
      res.status(400).json({ error: "No lecture notes or PDF content was provided." });
      return;
    }
    text = safeTruncate(text, 50000);

    // Call Gemini to generate summarizing layout: title, summary, keyPoints, examNotes, formulas
    const ai = getGemini();
    const prompt = `You are an elite academic tutor and summarizer. You have been provided with the following student's lecture notes or material.
Analyze the material completely and extract and return a highly detailed study card package in JSON.
The JSON must follow this exact format:
{
  "title": "A short, descriptive, highly academic title for this note/topic",
  "summary": "A high-impact executive summary summarizing the core learnings (100-200 words)",
  "keyPoints": [
    "Crucial takeaway or conceptual highlight 1",
    "Crucial takeaway or conceptual highlight 2",
    "Crucial takeaway or conceptual highlight 3",
    "Crucial takeaway or conceptual highlight 4"
  ],
  "examNotes": "A very detailed, deep-dive section containing critical definitions, list items, comparison tables in Markdown syntax, and high-yield concepts most likely to appear on test day. Keep it highly detailed and helpful.",
  "formulas": [
    "Formula 1: description and variable meanings",
    "Formula 2: description and variable meanings"
  ]
}

If no obvious mathematical formulas are present in the text, extract key heuristic principles, core acronyms, or law summaries instead for the "formulas" section. Return strictly JSON.

Here is the student's study material:
-----------------------------
${text}
-----------------------------`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Zero response text returned from AI");
    }

    const data = JSON.parse(outputText.trim());
    res.json(data);
  } catch (err: any) {
    console.error("AI Summarizer Service error:", err);
    res.status(500).json({ error: formatGeminiError(err) });
  }
});

// -----------------------------------------------------------------------------
// API Route 2: /api/quiz
// Receives material text and generates MCQs with options, explanations, and flashcards.
// -----------------------------------------------------------------------------
app.post("/api/quiz", async (req: Request, res: Response): Promise<void> => {
  try {
    let { text } = req.body;
    if (!text || text.trim().length === 0) {
      res.status(400).json({ error: "No study material provided to generate a quiz from." });
      return;
    }
    text = safeTruncate(text, 50000);

    const ai = getGemini();
    const prompt = `You are an expert AI Examiner. Create an interactive quiz matching the academic material provided below.
Provide a mixture of 5 high-yield Multiple-Choice Questions (MCQs), 5 conceptual Flashcards, and 3 oral Viva/vocal exam preparation questions.
You must return the response inside a JSON structure following this format:
{
  "title": "A custom title for this practice quiz",
  "questions": [
    {
      "id": 1,
      "question": "Full clear MCQ question string?",
      "options": ["Option A string", "Option B string", "Option C string", "Option D string"],
      "correctAnswer": "Option A string",
      "explanation": "Detailed explanation why this answer is correct academically"
    }
  ],
  "flashcards": [
    {
      "front": "Compact conceptual question or term, e.g. What is polymorphism?",
      "back": "Concise definition or quick code example explaining the term"
    }
  ],
  "vivaQuestions": [
    {
      "question": "Deep discussion question e.g. Contrast TCP vs UDP in terms of flow control.",
      "idealAnswer": "Key bullet points students should state during an oral examination or interview"
    }
  ]
}

Material to build quiz on:
-----------------------------
${text}
-----------------------------`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Zero response text returned from AI");
    }

    const data = JSON.parse(outputText.trim());
    res.json(data);
  } catch (err: any) {
    console.error("AI Quiz Generator error:", err);
    res.status(500).json({ error: formatGeminiError(err) });
  }
});

// -----------------------------------------------------------------------------
// API Route 3: /api/planner
// Inputs: subjects (string[]), examDates (string), availableStudyHours (number), weakSubjects (string[])
// -----------------------------------------------------------------------------
app.post("/api/planner", async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjects, examDates, availableStudyHours, weakSubjects } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      res.status(400).json({ error: "Please list at least one subject." });
      return;
    }

    const ai = getGemini();
    const prompt = `You are a professional study strategist and career coach.
Generate a highly detailed, realistic, and personalized daily/weekly study planner.
Inputs:
- Active Subjects: ${subjects.join(", ")}
- Critical Upcoming Exam Milestone: ${examDates || "Next Monthly Cycle"}
- Available daily study hours limit: ${availableStudyHours || 4} hours
- Student's Subjective Weak Areas: ${weakSubjects ? weakSubjects.join(", ") : "None stated"}

Generate a dynamic revision layout returned in JSON conforming to:
{
  "subjectPriorities": [
    {
      "subject": "Name of subject",
      "priority": "High" | "Medium" | "Low",
      "reason": "Strategic explanation for why this is prioritized (e.g. Weak target, near-term deadline)"
    }
  ],
  "dailySchedule": [
    {
      "time": "09:00 - 10:30",
      "activity": "Action-oriented task, e.g. Focus study on organic mechanics",
      "notes": "Action item: complete 3 sample problems with active recall"
    }
  ],
  "revisionPlan": [
    {
      "day": "Day 1 (Immediate)",
      "subject": "Subject Name",
      "topics": "Specific bullet point items (e.g., cell biology, integration by parts)",
      "hours": 2
    }
  ]
}

Ensure the planning hours fit within the daily availableStudyHours (${availableStudyHours}). Return strictly JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Zero response text returned from AI");
    }

    const data = JSON.parse(outputText.trim());
    res.json(data);
  } catch (err: any) {
    console.error("AI Study Planner error:", err);
    res.status(500).json({ error: formatGeminiError(err) });
  }
});

// -----------------------------------------------------------------------------
// API Route 4: /api/assignments/extract
// Extracts crucial variables (title, class, ISO date, priorities) from assignment PDFs/texts
// -----------------------------------------------------------------------------
app.post("/api/assignments/extract", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    let contentText = req.body.text || "";

    if (req.file) {
      contentText = await extractTextFromPdfOrBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
    } else {
      contentText = safeTruncate(contentText, 50000);
    }

    if (!contentText || contentText.trim().length === 0) {
      res.status(400).json({ error: "Please upload an assignment brief or paste assignment instructions." });
      return;
    }

    const ai = getGemini();
    const prompt = `You are a student assistant trained in document ingestion.
Review this assignment task file or instruction brief.
Identify and extract:
1. Title or topic of the assignment
2. Main Subject / course code
3. Exact deadline or due date mentioned. Convert this directly into a yyyy-mm-dd ISO format string! If only standard terms are given (e.g. next Friday), estimate relative to current date (May 22, 2026).
4. Subjective priority ("High", "Medium", "Low") based on the work difficulty or near-term deadline.

Return the details in JSON following this template:
{
  "title": "Succinct title of assignment",
  "subject": "Course Name / Code",
  "deadline": "yyyy-mm-dd",
  "priority": "High" | "Medium" | "Low"
}

Material:
------------------
${contentText}
------------------`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Failed to extract details from prompt");
    }

    const data = JSON.parse(outputText.trim());
    res.json(data);
  } catch (err: any) {
    console.error("AI Assignment extractor error:", err);
    res.status(500).json({ error: formatGeminiError(err) });
  }
});

// -----------------------------------------------------------------------------
// API Route 5: /api/chat
// Centralized Chatbot assistant with knowledge of student context
// -----------------------------------------------------------------------------
app.post("/api/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history, studentStatus } = req.body;

    if (!message) {
      res.status(400).json({ error: "Missing required chat message" });
      return;
    }

    const ai = getGemini();

    // Setup clear system instructions with context
    const statusContext = studentStatus 
      ? `Student Details:
         - Display Name: ${studentStatus.displayName}
         - Streaks: ${studentStatus.streak} active days
         - Total study tracker hours: ${studentStatus.totalStudyHours} hrs
         - Ongoing student tasks/assignments count: ${studentStatus.assignmentsCount || 0}`
      : "No student stats synchronized yet.";

    const systemInstruction = `You are "AutoPilot AI", the virtual supervisor and smart coach of AutoPilot OS—a futuristic academic platform for innovators.
Provide actionable educational advise, summarize short questions, solve coding queries, and answer student workflow questions.
Use a modern, futuristic startup tone (slate greys, glow, supportive, energetic).
Keep answers relatively compact, useful, and formatted in Markdown.
Here is the current logged-in student's context:
${statusContext}`;

    // Format history list for GoogleGenAI chats API if possible, or build conversational prompt.
    // For simplicity and high compatibility, compile convo text block with length boundaries:
    let convoBlock = "";
    if (history && Array.isArray(history)) {
      history.slice(-8).forEach((h: any) => {
        convoBlock += `${h.role === "user" ? "Student" : "AutoPilot AI"}: ${safeTruncate(h.content, 4000)}\n`;
      });
    }
    convoBlock += `Student: ${safeTruncate(message, 4000)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: convoBlock,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    res.json({ reply: response.text || "I am processing your query, student." });
  } catch (err: any) {
    console.error("AI Chatbot service error:", err);
    res.status(500).json({ error: formatGeminiError(err) });
  }
});

// -----------------------------------------------------------------------------
// Vite and Static Assets Pipeline (Development & Production)
// -----------------------------------------------------------------------------
if (process.env.NODE_ENV !== "production") {
  const startVite = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  };
  startVite();
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`AutoPilot OS central engine listening on port ${PORT}`);
});
