
import pg from "pg";
// import dotenv from "dotenv";
// dotenv.config({ path: "../.env" });

(async () => {
    console.log("Starting PG test...");
    if (!process.env.DATABASE_URL) {
        console.error("No DATABASE_URL");
        process.exit(1);
    }
    try {
        const client = new pg.Client({
            connectionString: process.env.DATABASE_URL
        });
        console.log("Connecting...");
        await client.connect();
        console.log("Connected successfully!");
        const res = await client.query("SELECT NOW()");
        console.log("Time:", res.rows[0]);
        await client.end();
        console.log("Done.");
    } catch (e) {
        console.error("Detailed Error:", e);
    }
})();
