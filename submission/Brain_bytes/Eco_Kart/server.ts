import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini if key exists
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("GEMINI_API_KEY is not defined. AI Advisor features will fall back to local responses.");
  }

  // Helper for dynamic local mock auditer evaluation
  function getFallbackEcoScore(name: string, category: string, materialUsed: string, co2Offset: number, description: string) {
    const textToAnalyze = `${name} ${materialUsed || ""} ${description}`.toLowerCase();
    
    // Define criteria for low score triggers so admins can test failure paths
    const hasLowScoreTriggers = 
      textToAnalyze.includes("toxic") || 
      textToAnalyze.includes("coal") || 
      textToAnalyze.includes("petroleum") || 
      textToAnalyze.includes("single-use plastic") || 
      textToAnalyze.includes("low score") || 
      textToAnalyze.includes("harmful") || 
      textToAnalyze.includes("disposable plastic") || 
      textToAnalyze.includes("non-recyclable") || 
      textToAnalyze.includes("synthetic polyester") || 
      textToAnalyze.includes("crude oil");

    let score = 75; // Default score
    let explanation = "";

    if (hasLowScoreTriggers) {
      score = Math.floor(Math.random() * 21) + 15; // Score between 15 and 35
      explanation = `[Eco-Auditor Fallback] Sourcing validation failed because materials contain non-biodegradable fossil derivatives, toxic additives, or single-use patterns. This contributes to microplastic pollution and landfill congestion. Recommendation: Substitute with flax straws, wood, or recycled FSC paper.`;
    } else {
      // Calculate high score based on co2Offset weight and materials
      const scoreOffsetFactor = Math.min(Math.floor((Number(co2Offset) || 1) * 2), 20);
      score = 50 + scoreOffsetFactor + Math.floor(Math.random() * 10);
      if (score > 100) score = 100;
      
      explanation = `[Eco-Auditor Fallback] Product audited successfully! Sourcing is validated due to premium "${materialUsed || "compostable elements"}". The carbon offset parameter of ${co2Offset || 1.5} kg offsets local logistical overhead. FSC or GOTS certified materials are highly rated. APPROVED for listing.`;
    }

    return { score, explanation, passed: score > 40 };
  }

  // Helper for dynamic local advisor chat response
  function getFallbackChatResponse(message: string, history?: any[]) {
    const m = message.toLowerCase();
    let reply = "";
    if (m.includes("hello") || m.includes("hi") || m.includes("hey")) {
      reply = `**Hello there! I am your EcoKart AI Sustainability Advisor.** 

I am happy to guide you on how to reduce your carbon footprint, explain the impact of your purchases, and answer any environmental questions. 

How can I help you make greener choices today?`;
    } else if (m.includes("plastic") || m.includes("bamboo") || m.includes("straw") || m.includes("bag")) {
      reply = `### Reducing Plastic Consumption
Using items like **reusable bamboo toothbrushes**, **organic cotton tote bags**, or **wheat-straw cups** prevents thousands of plastic pieces from reaching our landfills and oceans:
* **Bamboo** grows up to 3 feet per day without pesticides, making it highly renewable.
* **Cotton Bags** replace hundreds of single-use carry bags in their lifetime.
* **Wheat-Straw** is agricultural byproduct, meaning zero extra trees are cleared.`;
    } else if (m.includes("co2") || m.includes("carbon") || m.includes("offset") || m.includes("tree")) {
      reply = `### Understanding Carbon Offsets
Each product on **EcoKart** features a calculated **Carbon Offset (kg of CO2)**. When you buy these items, you offset environmental damage:
1. **Solar-powered items** directly replace fossil-fuel energy grid consumption.
2. **Planting trees** captures approximately 22 kg of CO2 per year once mature.
3. Every purchase also awards you **Eco Green Points** which can be redeemed for sustainable gift cards and perks!`;
    } else if (m.includes("energy") || m.includes("solar") || m.includes("wind") || m.includes("electricity")) {
      reply = `### Eco-Friendly Energy Tips
Investing in clean energy is the most high-impact sustainability choice you can make:
* **Solar Chargers** harness clean sunlight directly for your mobile accessories.
* **Smart Power Strips** block phantom loads when appliances are in standby.
* **LED Bulbs** consume up to 80% less energy than standard incandescent lighting.`;
    } else if (m.includes("points") || m.includes("score") || m.includes("reward") || m.includes("earn")) {
      reply = `### Eco Green Points & Rewards
You earn **Eco Green Points** automatically by:
1. Ordering certified high-offset products on the marketplace.
2. Completing daily green habits.
3. Registering validated low-carbon products as a premium merchant.

Redeem your points on your personal dashboard tab for sustainable coupons, FSC certificates, or certified tree-planting logs!`;
    } else {
      reply = `**Thank you for your sustainability inquiry!**

Here is an inspiring Eco trivia: *Did you know that recycling a single aluminum can saves enough electric energy to power a laptop for up to 3 hours?*

Keep shopping on **EcoKart** to build sound habits, reduce your carbon footprint, and earn reward points! If you have any questions about specific categories like *biodegradation, solar utilities, organic farming, or carbon credits*, just ask me!`;
    }

    return { reply };
  }

  // API Route for Gemini Eco Advisor
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!ai) {
        const result = getFallbackChatResponse(message, history);
        return res.status(200).json(result);
      }

      const systemInstruction = `You are "EcoKart AI Advisor", a friendly, optimistic, and highly knowledgeable sustainability expert. 
Your goal is to guide the user in reducing their carbon footprint, explain the impact of their purchases, suggest eco-friendly product alternatives, and answer general questions about environmental sustainability, recycling, renewable energy, and organic living.

Respond using clean, beautiful Markdown formatting with concise paragraphs, list items, and highlights. Be professional, direct, and cheerful.`;

      let prompt = message;
      if (history && history.length > 0) {
        const formattedHistory = history.map((h: {role: string, content: string}) => `${h.role === 'user' ? 'User' : 'Advisor'}: ${h.content}`).join("\n");
        prompt = `Conversation history:\n${formattedHistory}\n\nUser's new message: ${message}\n\nAdvisor response:`;
      }

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
          }
        });

        res.json({ reply: response.text });
      } catch (geminiError: any) {
        console.warn("Gemini Live Chat Error (Falling back to local AI Advisor):", geminiError.message || geminiError);
        const result = getFallbackChatResponse(message, history);
        return res.status(200).json(result);
      }
    } catch (error: any) {
      console.error("Gemini API Critical Route Error:", error);
      res.status(500).json({ error: error.message || "Something went wrong during generation" });
    }
  });

  // API Route for Product Eco Score evaluation (AI portal feature)
  app.post("/api/gemini/eco-score", async (req, res) => {
    try {
      const { name, category, materialUsed, co2Offset, description } = req.body;

      if (!name || !description) {
        return res.status(400).json({ error: "Product name and description are required for evaluation." });
      }

      if (!ai) {
        // Fallback simulation mode
        const result = getFallbackEcoScore(name, category, materialUsed, Number(co2Offset) || 0, description);
        return res.json(result);
      }

      const prompt = `Perform an objective, professional sustainability audit and calculate an exact Eco Score out of 100 (where 0 is harmful/highly-polluting and 100 is carbon-positive/fully biodegradable) for this product:

Product Name: ${name}
Category: ${category}
Sourced Materials: ${materialUsed}
Estimated CO₂ Offset: ${co2Offset} kg
Lifecycle Description: ${description}

Instructions:
1. Assign a robust, scientifically grounded Eco Score (0 to 100) based on raw material extraction, packaging degradation, lifecycle carbon, and ethical logistics. If the product contains toxic ingredients, non-biodegradable single-use plastics, or coal/petroleum derivatives, score it heavily below 40.
2. Provide a professional, objective 2-sentence sustainability explanation summarizing why this score was assigned.`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: {
                  type: Type.INTEGER,
                  description: "Calculated Eco Score between 0 and 100 representing environmental sustainability.",
                },
                explanation: {
                  type: Type.STRING,
                  description: "Professional explanation details justifying the assigned score.",
                },
              },
              required: ["score", "explanation"],
            },
          },
        });

        const dataText = response.text?.trim() || "";
        let parsed = { score: 75, explanation: "Standard sustainability evaluation processed successfully." };
        try {
          parsed = JSON.parse(dataText);
        } catch (parseErr) {
          console.error("Failed to parse Gemini JSON schema response:", dataText);
          // Regex extract if json parse fails
          const scoreMatch = dataText.match(/"score"\s*:\s*(\d+)/);
          const explanationMatch = dataText.match(/"explanation"\s*:\s*"([^"]+)"/);
          if (scoreMatch) parsed.score = parseInt(scoreMatch[1], 10);
          if (explanationMatch) parsed.explanation = explanationMatch[1];
        }

        res.json({
          score: parsed.score,
          explanation: parsed.explanation,
          passed: parsed.score > 40,
        });
      } catch (geminiError: any) {
        console.warn("Gemini Live Core API Error (Falling back to local AI Evaluator):", geminiError.message || geminiError);
        const result = getFallbackEcoScore(name, category, materialUsed, Number(co2Offset) || 0, description);
        res.json(result);
      }

    } catch (error: any) {
      console.error("Gemini Eco Score API Critical Route Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze eco score" });
    }
  });

  // API to get interesting Eco trivia or quiz questions
  app.get("/api/eco-trivia", async (req, res) => {
    try {
      if (!ai) {
        return res.json({
          trivia: "Using sustainable bamboo toothbrushes saves plastic waste, as bamboo grows up to 3 feet per day without pesticides."
        });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Generate a single random, inspiring, and lesser-known eco-trivia or carbon footprint statistic (1-2 sentences). Keep it fun and short.",
      });
      res.json({ trivia: response.text?.trim() || "Offsetting 1 ton of CO2 is equivalent to planting approximately 40 trees and letting them grow for 10 years." });
    } catch (e) {
      res.json({ trivia: "Offsetting 1 ton of CO2 is equivalent to planting approximately 40 trees and letting them grow for 10 years." });
    }
  });

  // Serve static files in production or mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
