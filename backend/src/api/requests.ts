import { Hono } from "hono";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq, and, ne } from "drizzle-orm";

export const requestsRouter = new Hono();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

requestsRouter.post("/match-donors", async (c) => {
    try {
        const { blood_type, urgency, location } = await c.req.json();

        // 1. Fetch potential donors from DB (basic filtering)
        const donors = await db.select().from(users).where(
            eq(users.role, "DONOR")
            // In a real app, we'd add blood_type filtering here too
        );

        // 2. Mock donor data for AI analysis (since we don't have detailed history in basic user table)
        // In production, fetch this from a 'donor_profiles' table
        const donorProfiles = donors.map(d => ({
            id: d.id,
            name: d.full_name,
            blood_type: "O+", // Mocking matching blood type for now
            last_donation_days_ago: Math.floor(Math.random() * 180),
            distance_km: Math.floor(Math.random() * 20),
            health_status: "Good"
        }));

        // 3. AI Smart Ranking
        const prompt = `
            You are a Blood Bank Coordinator AI.
            Rank the following donors for a request:
            - Required Blood: ${blood_type}
            - Urgency: ${urgency}
            - Location: ${location}

            Donors:
            ${JSON.stringify(donorProfiles)}

            Rules:
            1. Donor must be eligible (> 90 days since last donation).
            2. Closer distance is better for HIGH urgency.
            3. Return the ID of the top 3 matches and a brief reason.

            Output JSON format:
            {
                "matches": [
                    {"donor_id": "string", "score": number, "reason": "string"}
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiAnalysis = JSON.parse(jsonStr);

        return c.json({
            matches: aiAnalysis.matches,
            all_donors_count: donors.length
        });

    } catch (error) {
        console.error("Smart Matching Error:", error);
        return c.json({ error: "Failed to match donors" }, 500);
    }
});

requestsRouter.post("/sos", async (c) => {
    try {
        const { latitude, longitude, blood_type, note } = await c.req.json();

        // In a real system:
        // 1. Store emergency request in DB
        // 2. Query users within 10km radius using PostGIS
        // 3. Send Push Notifications via FCM/OneSignal

        console.log(`[SOS TRIGGERED] Type: ${blood_type}, Loc: ${latitude},${longitude}, Note: ${note}`);

        // Mock response
        const nearbyDonorsCount = Math.floor(Math.random() * 15) + 5; // Mock 5-20 donors

        return c.json({
            status: "success",
            message: `Alert broadcasted to ${nearbyDonorsCount} nearby donors.`,
            donors_notified: nearbyDonorsCount
        });
    } catch (error) {
        console.error("SOS Error:", error);
        return c.json({ error: "Failed to broadcast SOS" }, 500);
    }
});
