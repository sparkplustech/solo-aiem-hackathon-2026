import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const AIService = {
  /**
   * Transcribe and Analyze audio directly using Gemini 1.5 Multimodal capabilities
   */
  async processAudioMeeting(audioBuffer: Buffer, mimeType: string) {
    // Convert buffer to base64 for Gemini multimodal input
    const base64Audio = audioBuffer.toString('base64');

    const prompt = `
      You are an expert executive assistant. Listen to this meeting audio and provide a highly accurate structured analysis.
      
      Required output format (JSON only):
      {
        "transcript": "Full accurate transcription of the conversation",
        "summary": "Concise executive summary",
        "actionItems": [
          { "task": "Task description", "owner": "Name", "deadline": "Optional date", "priority": "high/medium/low" }
        ],
        "risks": [
          { "description": "Risk description", "severity": "high/medium/low" }
        ],
        "decisions": ["Key decision 1", "Key decision 2"]
      }
    `;

    const result = await geminiModel.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Audio
        }
      },
      { text: prompt }
    ]);

    const response = await result.response;
    let text = response.text();
    
    // Cleanup markdown code blocks if returned
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse Gemini JSON output:", text);
      throw new Error("AI analysis resulted in invalid data format.");
    }
  },

  /**
   * Analyze existing text transcript using Gemini
   */
  async analyzeTextMeeting(transcript: string) {
    const prompt = `
      Analyze the following meeting transcript and provide a structured JSON response.
      
      Transcript:
      "${transcript}"

      Required output format (JSON only):
      {
        "summary": "Concise executive summary",
        "actionItems": [
          { "task": "Task description", "owner": "Name", "deadline": "Optional date", "priority": "high/medium/low" }
        ],
        "risks": [
          { "description": "Risk description", "severity": "high/medium/low" }
        ],
        "decisions": ["Key decision 1", "Key decision 2"]
      }
    `;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  }
};
