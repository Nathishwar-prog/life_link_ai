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
        const lat = c.req.query("lat");
        const lon = c.req.query("lon");
        const radius = c.req.query("radius") || "50"; // Increased default radius to 50km

        if (lat && lon) {
            // Proximity search + City fallback search to ensure we catch donors without coords in same city
            // First, let's try to get the city of the search location via reverse geocoding or just rely on proximity for now
            // But if we want to BE SURE, we can search by proximity and ALSO by city if city is provided.
            
            const proximityQuery = sql`
                SELECT *,
                    CASE 
                        WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN
                            ST_Distance(
                                ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
                                ST_SetSRID(ST_MakePoint(${parseFloat(lon)}, ${parseFloat(lat)}), 4326)::geography
                            ) / 1000
                        ELSE NULL
                    END as distance_km
                FROM donors
                WHERE is_available = true
                ${bloodType ? sql`AND blood_type = ${bloodType}` : sql``}
                AND (
                    (latitude IS NOT NULL AND ST_Distance(
                        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
                        ST_SetSRID(ST_MakePoint(${parseFloat(lon)}, ${parseFloat(lat)}), 4326)::geography
                    ) <= ${parseFloat(radius) * 1000})
                    OR 
                    (city IS NOT NULL AND ${city ? sql`city ILIKE ${'%' + city + '%'}` : sql`FALSE`})
                )
                ORDER BY distance_km ASC NULLS LAST
            `;
            const results = await db.execute(proximityQuery);
            return c.json(results.rows);
        }

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

// Update donor location
donorsRouter.patch("/:id/location", async (c) => {
    try {
        const id = c.req.param("id");
        const { latitude, longitude } = await c.req.json();

        if (latitude === undefined || longitude === undefined) {
            return c.json({ error: "Latitude and longitude are required" }, 400);
        }

        const updated = await db.update(donors)
            .set({
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                last_location_update: new Date()
            })
            .where(eq(donors.id, id))
            .returning();

        if (updated.length === 0) {
            return c.json({ error: "Donor not found" }, 404);
        }

        return c.json(updated[0]);
    } catch (error) {
        console.error("Error updating location:", error);
        return c.json({ error: "Failed to update location" }, 500);
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
