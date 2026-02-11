import { Hono } from "hono";
import { db } from "../db/index.js";
import { campaigns } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

export const campaignsRouter = new Hono();

// Get all campaigns
campaignsRouter.get("/", async (c) => {
    try {
        const allCampaigns = await db.select().from(campaigns).orderBy(desc(campaigns.start_date));
        return c.json(allCampaigns);
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        return c.json({ error: "Failed to fetch campaigns" }, 500);
    }
});

// Create a new campaign (Staff/Admin only)
campaignsRouter.post("/", async (c) => {
    try {
        const { title, description, location, start_date, end_date, organizer_id } = await c.req.json();

        const newCampaign = await db.insert(campaigns).values({
            title,
            description,
            location,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            organizer_id
        }).returning();

        return c.json(newCampaign[0], 201);
    } catch (error) {
        console.error("Error creating campaign:", error);
        return c.json({ error: "Failed to create campaign" }, 500);
    }
});
