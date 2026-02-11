import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

export let client: pg.Client;
export let db: NodePgDatabase<typeof schema>;

export async function initDB() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is missing");
    }

    // Check if check_db_schema script was run from backend dir or root? 
    // Just rely on raw env

    client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    // Enable PostGIS extension if not already enabled
    await client.query("CREATE EXTENSION IF NOT EXISTS postgis");

    db = drizzle(client, { schema });
}
