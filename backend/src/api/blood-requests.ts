import { Hono } from "hono";
import { db } from "../db/index.js";
import { bloodRequests } from "../db/schema.js";
import { desc } from "drizzle-orm";

export const bloodRequestsRouter = new Hono();

// Get all requests
bloodRequestsRouter.get("/", async (c) => {
    try {
        const allRequests = await db.select().from(bloodRequests).orderBy(desc(bloodRequests.created_at));
        return c.json(allRequests);
    } catch (error) {
        console.error("Error fetching requests:", error);
        return c.json({ error: "Failed to fetch requests" }, 500);
    }
});

// Create a new request
bloodRequestsRouter.post("/", async (c) => {
    try {
        const body = await c.req.json();
        const { patient_name, blood_type, units_needed, hospital_name, location, contact_number, urgency, requester_id } = body;

        if (!patient_name || !blood_type || !units_needed || !hospital_name || !contact_number) {
            return c.json({ error: "Missing required fields" }, 400);
        }

        const units = parseInt(units_needed);
        if (isNaN(units) || units <= 0) {
            return c.json({ error: "Units needed must be a positive number" }, 400);
        }

        // Handle requester_id: if provided but invalid UUID, DB will throw. 
        // If user session is stale, this happens. We can try to catch it.

        const newRequest = await db.insert(bloodRequests).values({
            patient_name,
            blood_type,
            units_needed: units,
            hospital_name,
            location,
            contact_number,
            urgency: urgency || "NORMAL",
            requester_id: requester_id || null // Ensure null if undefined/empty
        }).returning();

        return c.json(newRequest[0], 201);
    } catch (error: any) {
        console.error("Error creating request (FULL):", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        if (error.code === '23503' || (error.cause && error.cause.code === '23503')) {
            return c.json({ error: "Invalid User ID (Requester). Please log out and back in." }, 400);
        }
        if (error.code === '22P02' ||
            (error.cause && error.cause.code === '22P02') ||
            (error.message && error.message.includes('invalid input syntax for type uuid')) ||
            (error.routine === 'string_to_uuid')
        ) {
            return c.json({ error: "Invalid ID format. Please log out and back in." }, 400);
        }
        return c.json({ error: "Failed to create request" }, 500);
    }
});
