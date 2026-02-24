

import { config } from 'dotenv';
config({ path: '../.env' });

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRouter } from "./api/auth.js";
import { searchRouter } from "./api/search.js";
import { insightsRouter } from "./api/insights.js";
import { aiRouter } from "./api/ai.js";
import { requestsRouter } from "./api/requests.js";
import { campaignsRouter } from "./api/campaigns.js";
import { donorsRouter } from "./api/donors.js";
import { bloodRequestsRouter } from "./api/blood-requests.js";
import { inventoryRouter } from "./api/inventory.js";
import { sosRouter } from "./api/sos.js";

import { initDB } from "./db/index.js";

const app = new Hono();

app.use("/*", cors());

app.get("/health", (c) => c.json({ status: "healthy" }));

app.route("/api/auth", authRouter);
app.route("/api/search-blood", searchRouter);
app.route("/api/insights", insightsRouter);
app.route("/api/ai", aiRouter);
app.route("/api/requests", requestsRouter); // Smart Matching / SOS
app.route("/api/campaigns", campaignsRouter);
app.route("/api/donors", donorsRouter);
app.route("/api/blood-requests", bloodRequestsRouter);
app.route("/api/inventory", inventoryRouter);
app.route("/api/sos", sosRouter);

const port = 8000;
console.log("Starting server...");
(async () => {
    try {
        await initDB();
        console.log("Database connected!");

        console.log(`Server is running on port ${port}`);
        serve({
            fetch: app.fetch,
            port,
        });
    } catch (e) {
        console.error("Failed to start server:", e);
        process.exit(1);
    }
})();
