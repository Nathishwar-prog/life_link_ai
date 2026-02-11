
console.log("Starting test...");
import { Hono } from "hono";
console.log("Hono imported");
import { serve } from "@hono/node-server";
console.log("Serve imported");
import pg from "pg";
console.log("pg imported");
import { drizzle } from "drizzle-orm/node-postgres";
console.log("drizzle imported");
import "dotenv/config";
console.log("dotenv imported");

const app = new Hono();
app.get("/", (c) => c.text("Hello"));

(async () => {
    try {
        console.log("Checking env...");
        // Log sensitive info masked
        console.log("DB URL exists:", !!process.env.DATABASE_URL);
        if (!process.env.DATABASE_URL) {
            // Try loading from parent
            console.log("Loading from ../.env");
            const result = require("dotenv").config({ path: "../.env" });
            console.log("Loaded:", result.parsed ? "Yes" : "No");
        }

        console.log("Connecting to DB...");
        const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        console.log("Connected to DB!");
        await client.end();

        serve({ fetch: app.fetch, port: 8001 });
        console.log("Server started on 8001");
        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    }
})();
