import { config } from 'dotenv';
config({ path: '../.env' });
import { db, initDB } from "./src/db/index.js";
import { sql } from "drizzle-orm";

async function run() {
    try {
        await initDB();
        const blood_type = 'O+';

        const lat = 0;
        const lon = 0;

        console.log("Running Query...");
        const query = sql`
        SELECT 
            bb.id,
            bb.name,
            ST_Distance(
                ST_SetSRID(ST_MakePoint(bb.longitude, bb.latitude), 4326)::geography, 
                ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography
            ) / 1000 as distance_km,
            (
                SELECT json_build_object(
                    'units', units_available,
                    'updated_at', last_updated
                )
                FROM blood_inventory 
                WHERE blood_bank_id = bb.id AND blood_type = ${blood_type}
            ) as stock_info
        FROM blood_banks bb
        WHERE bb.is_active = true
        LIMIT 1
    `;

        const result = await db.execute(query);
        const row = result.rows[0];
        console.log("Row:", row);
        if (row) {
            console.log("distance_km type:", typeof row.distance_km);
            console.log("stock_info type:", typeof row.stock_info);
        }
        process.exit(0);

    } catch (err) {
        console.error("Query Failed:", err);
        process.exit(1);
    }
}

run();
