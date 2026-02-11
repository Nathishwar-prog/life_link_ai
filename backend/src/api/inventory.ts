
import { Hono } from "hono";
import { db } from "../db/index.js";
import { bloodInventory, bloodBanks } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

export const inventoryRouter = new Hono();

// GET /api/inventory - usage: fetches aggregated inventory
inventoryRouter.get("/", async (c) => {
    try {
        // For MVP, we aggregate across all blood banks or just return raw list
        // Let's return aggregated by blood type
        const stock = await db
            .select({
                blood_type: bloodInventory.blood_type,
                units: sql<number>`sum(${bloodInventory.units_available})`.mapWith(Number)
            })
            .from(bloodInventory)
            .groupBy(bloodInventory.blood_type);

        // Ensure all types are represented
        const allTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const result = allTypes.map(type => ({
            blood_type: type,
            units: stock.find(s => s.blood_type === type)?.units || 0
        }));

        return c.json(result);
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return c.json({ error: "Failed to fetch inventory" }, 500);
    }
});

// POST /api/inventory/update - usage: updates specific stock
inventoryRouter.post("/update", async (c) => {
    try {
        const { blood_type, units, action } = await c.req.json();

        // validates inputs
        if (!['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(blood_type)) {
            return c.json({ error: "Invalid blood type" }, 400);
        }

        // Get default blood bank (first one)
        const banks = await db.select().from(bloodBanks).limit(1);
        let bankId;

        if (banks.length === 0) {
            // Create a default one if none exists
            const [newBank] = await db.insert(bloodBanks).values({
                name: "Central Blood Bank",
                address: "Main Street",
                latitude: 0,
                longitude: 0,
                contact_number: "555-0123"
            }).returning();
            bankId = newBank.id;
        } else {
            bankId = banks[0].id;
        }

        // Check if item exists
        const existingItem = await db.select()
            .from(bloodInventory)
            .where(and(
                eq(bloodInventory.blood_bank_id, bankId),
                eq(bloodInventory.blood_type, blood_type)
            ));

        let currentUnits = existingItem.length > 0 ? existingItem[0].units_available : 0;
        let newUnits = action === 'ADD' ? currentUnits + units : Math.max(0, currentUnits - units);

        if (existingItem.length > 0) {
            await db.update(bloodInventory)
                .set({ units_available: newUnits, last_updated: new Date() })
                .where(and(
                    eq(bloodInventory.blood_bank_id, bankId),
                    eq(bloodInventory.blood_type, blood_type)
                ));
        } else {
            await db.insert(bloodInventory).values({
                blood_bank_id: bankId,
                blood_type,
                units_available: newUnits,
                last_updated: new Date()
            });
        }

        return c.json({ success: true, blood_type, units: newUnits });

    } catch (error) {
        console.error("Error updating inventory:", error);
        return c.json({ error: "Failed to update inventory" }, 500);
    }
});
