
console.log("Testing DB import...");
import { initDB, db } from "./src/db/index";
// import dotenv from "dotenv";
// dotenv.config({ path: "../.env" });

console.log("DB Imported successfully");
// Check if query works
(async () => {
    try {
        console.log("Initializing DB...");
        await initDB();
        console.log("Running query...");
        const res = await db.execute(require("drizzle-orm").sql`SELECT 1`);
        console.log("Query success:", res.rows);
        process.exit(0);
    } catch (e) {
        console.error("Query failed:", e);
        process.exit(1);
    }
})();
