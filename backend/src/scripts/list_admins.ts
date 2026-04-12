import { db, initDB } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), "../.env") });

async function listAdmins() {
    try {
        await initDB();
        const admins = await db.select().from(users).where(eq(users.role, "ADMIN"));
        console.log(JSON.stringify(admins, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

listAdmins();
