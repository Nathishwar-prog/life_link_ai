import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

export let pool: pg.Pool;
export let db: NodePgDatabase<typeof schema>;

export async function initDB() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is missing");
    }

    // Use a Pool instead of a single Client for better stability in serverless/idle environments
    pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Increased for serverless cold starts
    });

    // Handle unexpected pool errors
    pool.on('error', (err) => {
        console.error('Unexpected error on idle database pool', err);
    });

    // Verify connection with retry logic for cold starts
    let retries = 5;
    while (retries > 0) {
        try {
            const client = await pool.connect();
            try {
                console.log("Database connected successfully!");
                await client.query("CREATE EXTENSION IF NOT EXISTS postgis");
                break; // Success
            } finally {
                client.release();
            }
        } catch (err) {
            retries--;
            console.error(`Database connection failed. Retrying... (${retries} retries left)`, err);
            if (retries === 0) throw err;
            await new Promise(res => setTimeout(res, 2000)); // Wait 2s before retry
        }
    }

    db = drizzle(pool, { schema });
}
