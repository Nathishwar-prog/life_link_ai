import { db } from "./src/db/index.js";
import { donors } from "./src/db/schema.js";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

config({ path: path.resolve(process.cwd(), "../.env") });

async function checkDonors() {
    try {
        const allDonors = await db
            .select()
            .from(donors);

        let output = "--- DONOR DATA ---\n";
        allDonors.forEach(d => {
            output += `- ${d.full_name}: City=${d.city}, Address=${d.address}, Lat=${d.latitude}, Lng=${d.longitude}\n`;
        });
        output += `Total: ${allDonors.length}\n`;

        fs.writeFileSync("db_dump.txt", output);
        console.log("Dump saved to db_dump.txt");

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

checkDonors();
