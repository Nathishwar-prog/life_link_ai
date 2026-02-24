
import { Hono } from "hono";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";
import { bloodBanks, bloodInventory } from "../db/schema.js";
import jwt from "jsonwebtoken";
const { verify } = jwt;

export const searchRouter = new Hono();
const SECRET_KEY = process.env.JWT_SECRET || "fallback-secret-key";

searchRouter.post("/", async (c) => {
    try {
        const { latitude, longitude, blood_type, sort_by } = await c.req.json();

        // Auth check (Optional based on frontend logic, but good practice)
        // const authHeader = c.req.header("Authorization");
        // if (authHeader) { ... verify token ... }

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lon)) {
            return c.json({ detail: "Invalid coordinates" }, 422);
        }

        // Raw SQL for PostGIS distance calculation and Join
        // Drizzle's query builder is great, but for PostGIS + Complex Joins + JSON Aggregation, raw SQL is often cleaner or necessary currently.

        const query = sql`
        SELECT 
            bb.id,
            bb.name,
            bb.latitude,
            bb.longitude,
            bb.address,
            bb.contact_number,
            ST_Distance(
                ST_SetSRID(ST_MakePoint(bb.longitude, bb.latitude), 4326)::geography,
                ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography
            ) / 1000 as distance_km,
            bi.units_available,
            bi.last_updated
        FROM blood_banks bb
        JOIN blood_inventory bi ON bb.id = bi.blood_bank_id
        WHERE bb.is_active = true
          AND bi.blood_type = ${blood_type}
          AND bi.units_available > 0
    `;

        let result;
        try {
            result = await db.execute(query);
        } catch (dbErr) {
            console.error("DB Execution Error:", dbErr);
            const errObj = JSON.parse(JSON.stringify(dbErr, Object.getOwnPropertyNames(dbErr)));
            return c.json({ error: "Database Query Failed", details: String(dbErr), debug: errObj }, 500);
        }

        let rows = [];
        try {
            rows = result.rows.map((row: any) => ({
                ...row,
                distance_km: parseFloat(Number(row.distance_km).toFixed(2)),
                eta_minutes: Math.round(Number(row.distance_km) * 2.5),
                // inventory: {}, // Not needed for frontend map
                units_available: row.units_available || 0,
                updated_at: row.last_updated || null
            }));
        } catch (mapErr) {
            console.error("Mapping Error:", mapErr);
            return c.json({ error: "Search Mapping Failed", details: String(mapErr) }, 500);
        }

        if (sort_by === 'eta') {
            rows.sort((a, b) => a.eta_minutes - b.eta_minutes);
        } else {
            rows.sort((a, b) => a.distance_km - b.distance_km);
        }

        return c.json({ results: rows.slice(0, 5) });

    } catch (err) {
        console.error(err);
        return c.json({ detail: "Internal Server Error" }, 500);
    }
});


