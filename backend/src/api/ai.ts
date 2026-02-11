import { Hono } from "hono";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../db/index.js";
import { bloodInventory } from "../db/schema.js";
import { sql } from "drizzle-orm";

export const aiRouter = new Hono();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

aiRouter.post("/predict-shortage", async (c) => {
    try {
        // Fetch current inventory
        const inventory = await db.select().from(bloodInventory);

        // Prepare prompt
        const inventorySummary = inventory.map(item =>
            `${item.blood_type}: ${item.units_available} units (Last Updated: ${item.last_updated})`
        ).join("\n");

        const prompt = `
            You are an AI assistant for a Blood Bank. 
            Analyze the following inventory and predict potential shortages in the next 7 days.
            Consider that O+ and A+ are high demand.
            
            Current Inventory:
            ${inventorySummary}
            
            Return a JSON response with this format:
            {
                "analysis": "Brief summary of the situation",
                "alerts": [
                    {"blood_type": "string", "severity": "LOW|MEDIUM|CRITICAL", "message": "string"}
                ],
                "recommendations": ["string"]
            }
            Do not include markdown formatting, just raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return c.json(JSON.parse(jsonStr));
    } catch (error) {
        console.error("AI Prediction Error:", error);
        return c.json({ error: "Failed to generate prediction" }, 500);
    }
});

aiRouter.post("/donor-chat", async (c) => {
    try {
        const { message, context } = await c.req.json();

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are a helpful medical assistant for a Blood Bank. Answer questions about blood donation eligibility, process, and after-care. Be encouraging but medically accurate. If unsure, advise seeing a doctor." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I will assist donors with their queries regarding blood donation." }],
                }
            ],
            generationConfig: {
                maxOutputTokens: 200,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return c.json({ reply: response.text() });
    } catch (error) {
        console.error("AI Chat Error:", error);
        return c.json({ error: "Failed to process message" }, 500);
    }
});
