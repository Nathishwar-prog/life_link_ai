import { Hono } from "hono";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../db/index.js";
import { bloodInventory } from "../db/schema.js";
import { sql } from "drizzle-orm";

export const aiRouter = new Hono();

// Initialize Gemini lazily to avoid ES module import hoisting issues with dotenv
const getModel = () => {
    // gemini-2.5-flash is the modern stable version
    const modelName = "gemini-2.5-flash"; 
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    return genAI.getGenerativeModel({ model: modelName });
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
                    parts: [{ text: `You are "LifeLink AI", a warm, professional, and knowledgeable health assistant for a Blood Bank. 
                    
                    YOUR PERSONALITY:
                    - Empathetic, encouraging, and medically responsible.
                    - Proactive (if a user is eligible, gently encourage them to find a nearby camp).
                    
                    YOUR SCOPE:
                    - PRIMARY: Answer questions about blood donation eligibility, process, after-care, and blood health (hemoglobin, iron, etc.).
                    - SECONDARY: General wellbeing tips related to recovery from donation.
                    - STRICT LIMIT: Refuse all non-medical/non-blood-bank queries (coding, politics, general knowledge) politely but firmly.
                    
                    RESPONSE STYLE:
                    - Helpful but concise (2-4 clear sentences).
                    - Use a friendly tone, addressing the user as a hero for considering donation.` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Hello! I am LifeLink AI. I'm here to help you understand the blood donation process and how you can save lives. What can I answer for you today?" }],
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
                const errorMsg = err.message || "";
                const isRateLimit = errorMsg.includes("429") || errorMsg.toLowerCase().includes("too many requests");
                const isServiceUnavailable = errorMsg.includes("503") || errorMsg.toLowerCase().includes("overloaded");

                if ((isRateLimit || isServiceUnavailable) && retries > 1) {
                    const waitTime = isRateLimit ? 3000 : 1000;
                    console.log(`Gemini API Error (${isRateLimit ? "429" : "503"}). Retrying in ${waitTime/1000}s... (${retries - 1} attempts left)`);
                    await delay(waitTime);
                    retries--;
                } else {
                    throw err; // Re-throw if it's not a retryable error or we're out of retries
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

aiRouter.post("/voice-chat", async (c) => {
    try {
        const body = await c.req.json();
        const audioFile = body.audio as string; // Expecting base64 string
        const language = (body.language as string) || "auto";

        console.log("Received Voice Chat Request - Language:", language);
        
        if (!audioFile) {
            console.error("Voice Chat Error: No audio data in body");
            return c.json({ error: "No audio data provided" }, 400);
        }

        const model = getModel();
        
        const systemPrompt = `
            You are a helpful and professional medical assistant for a Blood Bank named "LifeLink AI". 
            You are interacting primarily via VOICE. 
            
            CORE MISSION:
            Answer questions about blood donation eligibility, the donation process, after-care, and general health tips.
            
            VOICE INTERACTION RULES:
            1. MULTILINGUAL: Detect the user's language automatically. If they speak Tamil, reply in Tamil. If English, reply in English. If they use a mix, stay consistent with their primary language.
            2. BREVITY: Keep responses extremely short (1-2 clear sentences). Avoid long lists or complex medical jargon.
            3. PRONUNCIATION: Write responses that sound natural when spoken by Text-to-Speech engines.
            4. SCOPE: Be firm but polite about your scope. Refuse to answer non-medical or non-blood-bank related questions.
            5. TONE: Warm, encouraging, and medically responsible.
        `;

        const promptPart = "Listen carefully to this audio and provide a helpful, very short response in the same language.";

        const result = await model.generateContent([
            systemPrompt,
            {
                inlineData: {
                    data: audioFile.split(',')[1] || audioFile, // Handle possible data URL prefix
                    mimeType: "audio/webm"
                }
            },
            promptPart
        ]);

        const response = await result.response;
        const text = response.text();

        return c.json({ reply: text });
    } catch (error: any) {
        console.error("AI Voice Chat Error:", error);
        return c.json({ error: "Failed to process voice message: " + error.message }, 500);
    }
});
