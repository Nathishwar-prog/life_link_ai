
import { Client } from "pg";
// import * as dotenv from "dotenv";
// dotenv.config({ path: ".env" });

async function reset() {
    console.log("Resetting database...");
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    // Drop public schema and recreate it
    await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;");
    await client.end();
    console.log("Database public schema reset.");
}

reset().catch(console.error);
