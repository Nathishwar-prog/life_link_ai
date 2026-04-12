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
        const body = await c.req.json();
        console.log("Creating campaign request body:", JSON.stringify(body, null, 2));

        const { title, description, location, start_date, end_date } = body;
        let { organizer_id } = body;

        // Sanitize organizer_id: if empty or not a valid UUID format, use null
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!organizer_id || (typeof organizer_id === 'string' && !uuidRegex.test(organizer_id))) {
            console.warn("Invalid or missing organizer_id, setting to null:", organizer_id);
            organizer_id = null;
        }

        const startDateObj = new Date(start_date);
        const endDateObj = new Date(end_date);

        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            console.error("Invalid date format received:", { start_date, end_date });
            return c.json({ error: "Invalid date format. Please use YYYY-MM-DDTHH:mm." }, 400);
        }

        const newCampaign = await db.insert(campaigns).values({
            title,
            description,
            location,
            start_date: startDateObj,
            end_date: endDateObj,
            organizer_id
        }).returning();

        if (!newCampaign || newCampaign.length === 0) {
            throw new Error("Insert operation failed to return the new campaign.");
        }

        console.log("Campaign created successfully:", newCampaign[0].id);
        return c.json(newCampaign[0], 201);
    } catch (error: any) {
        console.error("CRITICAL: Error in POST /api/campaigns:", error);
        return c.json({ 
            error: "Failed to create campaign", 
            details: error.message 
        }, 500);
    }
});

// Delete a campaign (Staff/Admin only)
campaignsRouter.delete("/:id", async (c) => {
    try {
        const id = c.req.param("id");

        const existingCampaign = await db.select().from(campaigns).where(eq(campaigns.id, id));
        if (existingCampaign.length === 0) {
            return c.json({ error: "Campaign not found" }, 404);
        }

        await db.delete(campaigns).where(eq(campaigns.id, id));

        return c.json({ message: "Campaign deleted successfully" });
    } catch (error) {
        console.error("Error deleting campaign:", error);
        return c.json({ error: "Failed to delete campaign" }, 500);
    }
});
