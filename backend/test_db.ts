import { client, initDB } from "./src/db/index.js";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), "../.env") });

async function run() {
    try {
        await initDB();
        console.log("LOG:Connected");
        const res = await client.query("SELECT count(*) FROM campaigns");
        console.log("LOG:Count:" + res.rows[0].count);
    } catch (e: any) {
        console.log("LOG:Error:" + e.message);
    }
    process.exit(0);
}
run();
