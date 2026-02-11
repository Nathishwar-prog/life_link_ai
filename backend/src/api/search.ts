
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
            (
                SELECT jsonb_object_agg(blood_type, units_available)
                FROM blood_inventory
                WHERE blood_bank_id = bb.id
            ) as full_inventory,
            (
                SELECT units_available 
                FROM blood_inventory 
                WHERE blood_bank_id = bb.id AND blood_type = ${blood_type}
            ) as requested_units
        FROM blood_banks bb
        WHERE bb.is_active = true
          AND EXISTS (
              SELECT 1 FROM blood_inventory 
              WHERE blood_bank_id = bb.id 
              AND blood_type = ${blood_type} 
              AND units_available > 0
          )
    `;

        const result = await db.execute(query);

        let rows = result.rows.map((row: any) => ({
            ...row,
            distance_km: parseFloat(row.distance_km.toFixed(2)),
            eta_minutes: Math.round(row.distance_km * 2.5),
            inventory: row.full_inventory || {},
            units_available: row.requested_units || 0
        }));

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


