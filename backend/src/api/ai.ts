import { Hono } from "hono";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../db/index.js";
import { bloodInventory } from "../db/schema.js";
import { sql } from "drizzle-orm";

export const aiRouter = new Hono();

// Initialize Gemini lazily to avoid ES module import hoisting issues with dotenv
const getModel = () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

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

        const result = await getModel().generateContent(prompt);
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
        const { message, history } = await c.req.json();

        // format history for gemini if provided
        // type the msg to any since we just need role and content
        const formattedHistory = history ? history.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        })) : [];

        const chat = getModel().startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are a helpful and professional medical assistant for a Blood Bank. Your ONLY purpose is to answer questions about blood donation eligibility, the blood donation process, after-care, and general health tips related to blood and wellbeing. You MUST absolutely refuse to answer any questions that are not related to healthcare, medicine, or blood donation. If the user asks about programming, general knowledge, or anything outside your strict medical scope, respond politely stating that you are a specialized health assistant and can only answer health-related queries. Be encouraging but medically accurate. Important Rule: Keep your responses extremely short, punchy, and fast to read (1-3 sentences maximum). Get straight to the point without any fluff." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I will provide short, quick, and concise assistance for blood donation queries." }],
                },
                ...formattedHistory
            ],
            generationConfig: {
                maxOutputTokens: 800,
            },
        });

        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        let retries = 3;
        let responseText = "";

        while (retries > 0) {
            try {
                const result = await chat.sendMessage(message);
                const response = await result.response;
                responseText = response.text();
                break; // Success, exit loop
            } catch (err: any) {
                if (err.message && err.message.includes("503") && retries > 1) {
                    console.log(`Gemini API 503 Error. Retrying in 1s... (${retries - 1} attempts left)`);
                    await delay(1000);
                    retries--;
                } else {
                    throw err; // Re-throw if it's not a 503 or we're out of retries
                }
            }
        }

        return c.json({ reply: responseText });
    } catch (error: any) {
        console.error("AI Chat Error:", error);
        let errorMsg = "Failed to process message";
        if (error.message) {
            if (error.message.includes("API key expired") || error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID")) {
                errorMsg = "Your Gemini API Key is invalid or expired. Please update it in the .env file.";
            } else if (error.message.includes("quota")) {
                errorMsg = "Gemini API quota exceeded.";
            } else {
                errorMsg = `AI Error: ${error.message}`;
            }
        }
        return c.json({ error: errorMsg }, 500);
    }
});
