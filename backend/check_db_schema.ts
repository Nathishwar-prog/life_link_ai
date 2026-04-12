import { db, client, initDB } from "./src/db/index.js";
import { campaigns } from "./src/db/schema.js";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), "../.env") });

async function checkSchema() {
    try {
        await initDB();
        console.log("LOG: Connected");

        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("LOG: Tables:", tables.rows.map(r => r.table_name));

        const campaignCols = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'campaigns'
        `);
        console.log("LOG: Columns in 'campaigns':", campaignCols.rows);

    } catch (e) {
        console.error("LOG: Error", e);
    }
    process.exit(0);
}

checkSchema();
