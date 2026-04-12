import { db } from "../db/index.js";
import { donors } from "../db/schema.js";
import { isNull, sql, eq } from "drizzle-orm";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), "../.env") });

async function geocodeDonors() {
    try {
        const donorsToGeocode = await db
            .select()
            .from(donors)
            .where(isNull(donors.latitude));

        console.log(`Found ${donorsToGeocode.length} donors to geocode.`);

        for (const donor of donorsToGeocode) {
            const query = `${donor.address ? donor.address + ', ' : ''}${donor.city}`;
            console.log(`Geocoding: ${donor.full_name} (${query})...`);

            try {
                // Nominatim expects a User-Agent
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
                    headers: { 'User-Agent': 'LifeLinkAI-Geocoder' }
                });
                const data = await res.json() as any[];

                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);

                    // Add a tiny bit of jitter to avoid perfect overlap if multiple donors are in same city
                    const jitterLat = lat + (Math.random() - 0.5) * 0.01;
                    const jitterLon = lon + (Math.random() - 0.5) * 0.01;

                    await db.update(donors)
                        .set({
                            latitude: jitterLat,
                            longitude: jitterLon,
                            last_location_update: new Date()
                        })
                        .where(eq(donors.id, donor.id));

                    console.log(`  Success: ${jitterLat}, ${jitterLon}`);
                } else {
                    console.warn(`  No results found for ${query}`);
                }
            } catch (err) {
                console.error(`  Failed to geocode ${donor.full_name}:`, err);
            }

            // Respect Nominatim usage policy (1 request per second)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log("Geocoding complete.");

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

geocodeDonors();
