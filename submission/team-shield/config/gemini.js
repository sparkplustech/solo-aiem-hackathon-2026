// Gemini API Configuration
// Note: In production, store API keys in environment variables or secure storage
export const GEMINI_CONFIG = {
  apiKey: "AIzaSyCBg7YWwpQUjB6U9kbjrKji1r9ongu2Pjg",
  model: "gemini-1.5-flash", // Using stable model for better compatibility
  
  // Default conversation settings
  generationConfig: {
    temperature: 0.7,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1024,
  },
  
  // Safety settings for mental health conversations
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH", 
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
  
  // System prompt for mental health support chatbot
  systemPrompt: `You are a compassionate mental health support chatbot designed to help students with their emotional well-being. 

Your role is to:
- Provide empathetic listening and emotional support
- Offer practical coping strategies and mindfulness techniques
- Suggest healthy habits and self-care practices
- Encourage professional help when needed
- Maintain a warm, non-judgmental tone

Important guidelines:
- Always prioritize user safety and well-being
- If someone expresses thoughts of self-harm or suicide, encourage them to seek immediate professional help
- Don't attempt to diagnose mental health conditions
- Keep responses supportive, concise, and actionable
- Remember this is supplemental support, not a replacement for professional therapy

Respond in a caring, understanding manner while providing helpful guidance for student mental health challenges.`
};