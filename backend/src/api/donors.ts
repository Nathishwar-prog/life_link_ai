import { Hono } from "hono";
import { db } from "../db/index.js";
import { donors } from "../db/schema.js";
import { eq, and, ilike, sql } from "drizzle-orm";

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

// Get total donor count
donorsRouter.get("/count", async (c) => {
    try {
        const result = await db.select({ count: sql<number>`count(*)` }).from(donors);
        return c.json({ count: Number(result[0].count) });
    } catch (error) {
        console.error("Error fetching donor count:", error);
        return c.json({ error: "Failed to fetch donor count" }, 500);
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

// Get a single donor by ID
donorsRouter.get("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        const donor = await db.select().from(donors).where(eq(donors.id, id));

        if (donor.length === 0) {
            return c.json({ error: "Donor not found" }, 404);
        }

        return c.json(donor[0]);
    } catch (error) {
        console.error("Error fetching donor:", error);
        return c.json({ error: "Failed to fetch donor" }, 500);
    }
});

// Update a donor (Admin/Staff only)
donorsRouter.put("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        const { full_name, blood_type, phone_number, email, city, address, is_available } = body;

        // Verify donor exists
        const existingDonor = await db.select().from(donors).where(eq(donors.id, id));
        if (existingDonor.length === 0) {
            return c.json({ error: "Donor not found" }, 404);
        }

        const updatedDonor = await db.update(donors)
            .set({
                full_name,
                blood_type,
                phone_number,
                email,
                city,
                address,
                is_available,
                // last_donation_date could be updated via a separate specific endpoint or here if passed
            })
            .where(eq(donors.id, id))
            .returning();

        return c.json(updatedDonor[0]);
    } catch (error) {
        console.error("Error updating donor:", error);
        return c.json({ error: "Failed to update donor" }, 500);
    }
});

// Delete a donor (Admin only)
donorsRouter.delete("/:id", async (c) => {
    try {
        const id = c.req.param("id");

        const existingDonor = await db.select().from(donors).where(eq(donors.id, id));
        if (existingDonor.length === 0) {
            return c.json({ error: "Donor not found" }, 404);
        }

        await db.delete(donors).where(eq(donors.id, id));

        return c.json({ message: "Donor deleted successfully" });
    } catch (error) {
        console.error("Error deleting donor:", error);
        return c.json({ error: "Failed to delete donor" }, 500);
    }
});
