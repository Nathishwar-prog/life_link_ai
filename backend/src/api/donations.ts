import { Hono } from "hono";
import { db } from "../db/index.js";
import { donations } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import jwt from "jsonwebtoken";

export const donationsRouter = new Hono();

// Get user's donations
donationsRouter.get("/my-donations", async (c) => {
    try {
        const authHeader = c.req.header("Authorization");
        if (!authHeader) return c.json({ error: "Unauthorized" }, 401);

        // A realistic app would decode JWT here to get user_id.
        // For simplicity, we assume the frontend passes user_id in headers or we decode.
        // Let's decode the JWT properly to get userId.
        const token = authHeader.split(" ")[1];
        if (!token) return c.json({ error: "Unauthorized" }, 401);

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string };
        const userId = decoded.id;

        const userDonations = await db.select()
            .from(donations)
            .where(eq(donations.user_id, userId))
            .orderBy(desc(donations.created_at));

        return c.json(userDonations);
    } catch (error) {
        console.error("Error fetching donations:", error);
        return c.json({ error: "Failed to fetch donations" }, 500);
    }
});

// Schedule a new donation
donationsRouter.post("/schedule", async (c) => {
    try {
        const authHeader = c.req.header("Authorization");
        if (!authHeader) return c.json({ error: "Unauthorized" }, 401);

        const token = authHeader.split(" ")[1];
        if (!token) return c.json({ error: "Unauthorized" }, 401);

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string };
        const userId = decoded.id;

        const body = await c.req.json();
        const { date, location, time } = body;

        if (!date || !location || !time) {
            return c.json({ error: "Missing required fields" }, 400);
        }

        const newDonation = await db.insert(donations).values({
            user_id: userId,
            date,
            time,
            location,
            amount: "450ml",
            status: "PENDING"
        }).returning();

        return c.json(newDonation[0], 201);
    } catch (error) {
        console.error("Error scheduling donation:", error);
        return c.json({ error: "Failed to schedule donation" }, 500);
    }
});
