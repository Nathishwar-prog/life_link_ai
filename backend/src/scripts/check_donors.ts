import { db } from "../db/index.js";
import { donors } from "../db/schema.js";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), "../.env") });

async function checkDonors() {
    try {
        const allDonors = await db
            .select()
            .from(donors);

        console.log("--- DONOR DATA ---");
        allDonors.forEach(d => {
            console.log(`- ${d.full_name}: City=${d.city}, Address=${d.address}, Lat=${d.latitude}, Lng=${d.longitude}`);
        });
        console.log(`Total: ${allDonors.length}`);

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

checkDonors();
