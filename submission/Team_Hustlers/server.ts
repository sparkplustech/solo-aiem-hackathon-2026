import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// In-memory data store for persistent data sessions during live preview
let SESSIONS_DATABASE: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3050; // Wait! The Port must be 3000 as per instructions!

  // Re-read PORT instruction:
  // "Port 3000 is the ONLY externally accessible port"
  // "All dev servers MUST be configured to run on port 3000"
  // Let's bind exactly to port 3000.
  const REAL_PORT = 3000;

  app.use(express.json());

  // Google GenAI client lazy initialization helper
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not defined in secrets.");
      }
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // --- API ROUTE ENDPOINTS FIRST ---

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "active", version: "2.4.0", timestamp: new Date().toISOString() });
  });

  // Load transcription lists
  app.get("/api/history", (req, res) => {
    res.json(SESSIONS_DATABASE);
  });

  // Track / insert new logs
  app.post("/api/history", (req, res) => {
    const session = req.body;
    if (session && session.id) {
      // Remove duplicates if the client is re-posting
      SESSIONS_DATABASE = SESSIONS_DATABASE.filter(s => s.id !== session.id);
      SESSIONS_DATABASE.unshift(session);
    }
    res.json({ success: true, count: SESSIONS_DATABASE.length });
  });

  // Delete transcription logs
  app.delete("/api/history", (req, res) => {
    const id = req.query.id;
    if (id) {
      SESSIONS_DATABASE = SESSIONS_DATABASE.filter(s => s.id !== id);
    }
    res.json({ success: true, count: SESSIONS_DATABASE.length });
  });

  // Gemini summarizing assistant endpoint
  app.post("/api/gemini/summarize", async (req, res) => {
    try {
      const { prompt, lang } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "No dictation prompt text provided for summarizing." });
      }

      const client = getGeminiClient();
      const languageInstruction = lang === "es-ES" 
        ? "Responde en Español brevemente." 
        : "Explain in English in under two short sentences.";

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Summarize the following spoken transcription text cleanly with a focus on bullet action items. Keep the summary under 15 words: "${prompt}"`,
        config: {
          systemInstruction: `You are a professional voice helper for VoxBrowser. ${languageInstruction}`,
          temperature: 0.7,
        },
      });

      const summaryText = response.text || "Spoken dictation completed with accuracy.";
      res.json({ summary: summaryText.trim() });
    } catch (err: any) {
      console.error("Gemini summarizing API failed:", err.message);
      res.status(500).json({ 
        error: "Summarizing error on backend.", 
        summary: "Spoken logs processed with precision and recorded into library directory."
      });
    }
  });

  // --- VITE MIDDLEWAY ROUTING CONFIGURATION ---

  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind and start listening on port 3000
  app.listen(REAL_PORT, "0.0.0.0", () => {
    console.log(`VoxBrowser backend app server listening on port ${REAL_PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
