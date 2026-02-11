import { Hono } from "hono";
import { db } from "../db/index.js";
import { donors } from "../db/schema.js";
import { eq, and, ilike } from "drizzle-orm";

export const donorsRouter = new Hono();

// Get all donors with filters
donorsRouter.get("/", async (c) => {
    try {
        const bloodType = c.req.query("blood_type");
        const city = c.req.query("city");

        let conditions = [];
        if (bloodType) conditions.push(eq(donors.blood_type, bloodType));
        if (city) conditions.push(ilike(donors.city, `%${city}%`));

        const query = db.select().from(donors);

        if (conditions.length > 0) {
            // @ts-ignore - Drizzle specific type handling
            const allDonors = await query.where(and(...conditions));
            return c.json(allDonors);
        } else {
            const allDonors = await query;
            return c.json(allDonors);
        }
    } catch (error) {
        console.error("Error fetching donors:", error);
        return c.json({ error: "Failed to fetch donors" }, 500);
    }
});

// Add a new donor (Admin/Staff only)
donorsRouter.post("/", async (c) => {
    try {
        const body = await c.req.json();
        const { full_name, blood_type, phone_number, email, city, address } = body;

        // Basic validation
        if (!full_name || !blood_type || !phone_number || !city) {
            return c.json({ error: "Missing required fields" }, 400);
        }

        const newDonor = await db.insert(donors).values({
            full_name,
            blood_type,
            phone_number,
            email,
            city,
            address,
            is_available: true
        }).returning();

        return c.json(newDonor[0], 201);
    } catch (error) {
        console.error("Error creating donor:", error);
        return c.json({ error: "Failed to create donor" }, 500);
    }
});
