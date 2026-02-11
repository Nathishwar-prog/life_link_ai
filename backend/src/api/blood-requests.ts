import { Hono } from "hono";
import { db } from "../db/index.js";
import { bloodRequests } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";

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
        console.log("Creating Blood Request, Body:", body);
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

// Get a single request
bloodRequestsRouter.get("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        const request = await db.select().from(bloodRequests).where(eq(bloodRequests.id, id));

        if (request.length === 0) {
            return c.json({ error: "Request not found" }, 404);
        }

        return c.json(request[0]);
    } catch (error) {
        console.error("Error fetching request:", error);
        return c.json({ error: "Failed to fetch request" }, 500);
    }
});

// Update a request
bloodRequestsRouter.put("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        const { patient_name, blood_type, units_needed, hospital_name, location, contact_number, urgency, status } = body;

        // Verify request exists
        const existingRequest = await db.select().from(bloodRequests).where(eq(bloodRequests.id, id));
        if (existingRequest.length === 0) {
            return c.json({ error: "Request not found" }, 404);
        }

        let updateData: any = {
            patient_name,
            blood_type,
            hospital_name,
            location,
            contact_number,
            urgency,
            status
        };

        if (units_needed) {
            updateData.units_needed = parseInt(units_needed);
        }

        const updatedRequest = await db.update(bloodRequests)
            .set(updateData)
            .where(eq(bloodRequests.id, id))
            .returning();

        return c.json(updatedRequest[0]);
    } catch (error) {
        console.error("Error updating request:", error);
        return c.json({ error: "Failed to update request" }, 500);
    }
});

// Delete a request
bloodRequestsRouter.delete("/:id", async (c) => {
    try {
        const id = c.req.param("id");

        const existingRequest = await db.select().from(bloodRequests).where(eq(bloodRequests.id, id));
        if (existingRequest.length === 0) {
            return c.json({ error: "Request not found" }, 404);
        }

        await db.delete(bloodRequests).where(eq(bloodRequests.id, id));

        return c.json({ message: "Request deleted successfully" });
    } catch (error) {
        console.error("Error deleting request:", error);
        return c.json({ error: "Failed to delete request" }, 500);
    }
});
