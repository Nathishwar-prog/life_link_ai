import { db } from "../db/index.js";
import { donors } from "../db/schema.js";
import { isNotNull } from "drizzle-orm";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), "../.env") });

async function checkDonors() {
    try {
        const allDonors = await db
            .select({
                name: donors.full_name,
                phone: donors.phone_number
            })
            .from(donors)
            .where(isNotNull(donors.phone_number));

        console.log("--- DONOR PHONE NUMBERS ---");
        allDonors.forEach(d => {
            console.log(`${d.name}: ${d.phone}`);
        });
        console.log(`Total: ${allDonors.length}`);

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

checkDonors();
