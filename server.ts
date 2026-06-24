import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for estimating wait time
  app.post("/api/estimateWaitTime", async (req, res) => {
    try {
      const { departmentName, serviceName, peopleAhead, defaultEstimatedWaitMinutes, historicalAvgWaitTime } = req.body;
      
      const prompt = `You are an AI queue manager for Taita Taveta County.
Calculate an estimated wait time in minutes for a citizen.
Department: ${departmentName}
Service: ${serviceName}
People ahead in queue: ${peopleAhead}
Default service time per person: ${defaultEstimatedWaitMinutes} mins
Historical average wait time per person for this department: ${historicalAvgWaitTime || defaultEstimatedWaitMinutes} mins

Return ONLY a JSON object with a single field "estimatedWaitTimeMinutes" containing an integer representing the total estimated wait time in minutes. Factor in standard queue theory if needed, but keep it realistic. Do not output markdown code blocks. Just the raw JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text || "{}";
      const data = JSON.parse(text);
      res.json({ estimatedWaitTimeMinutes: data.estimatedWaitTimeMinutes || (peopleAhead * defaultEstimatedWaitMinutes) });

    } catch (error: any) {
      console.warn("Gemini API Error, falling back to simple calculation:", error?.message || error);
      res.json({ estimatedWaitTimeMinutes: (peopleAhead + 1) * defaultEstimatedWaitMinutes });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
