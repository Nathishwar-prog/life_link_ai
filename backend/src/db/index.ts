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
        connectionTimeoutMillis: 2000,
    });

    // Handle unexpected pool errors
    pool.on('error', (err) => {
        console.error('Unexpected error on idle database pool', err);
    });

    // Verify connection
    const client = await pool.connect();
    try {
        await client.query("CREATE EXTENSION IF NOT EXISTS postgis");
    } finally {
        client.release();
    }

    db = drizzle(pool, { schema });
}
