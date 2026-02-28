import { config } from "dotenv";
config({ path: "../.env" });
import { db } from "./src/db/index.js";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Creating donation_status enum...");
    await db.execute(sql`
        DO $$ BEGIN
            CREATE TYPE donation_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    `);

    console.log("Creating donations table...");
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS donations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id),
            location TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            amount TEXT DEFAULT '450ml',
            status donation_status DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT NOW()
        );
    `);
    console.log("Database table 'donations' created successfully!");
    process.exit(0);
}

main().catch(console.error);
