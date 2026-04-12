import { db, initDB } from "./src/db/index.js";
import { campaigns } from "./src/db/schema.js";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), "../.env") });

async function run() {
    try {
        await initDB();
        console.log("LOG:Connected");
        
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        const testCases = [
            { title: "Normal", organizer_id: "77777777-7777-7777-7777-777777777777" }, // This might fail if user doesn't exist, but we check sanitization first
            { title: "Empty String", organizer_id: "" },
            { title: "Invalid UUID", organizer_id: "not-a-uuid" },
            { title: "Undefined", organizer_id: undefined }
        ];

        for (const tc of testCases) {
            let oid: any = tc.organizer_id;
            if (!oid || (typeof oid === 'string' && !uuidRegex.test(oid))) {
                oid = null;
            }
            console.log(`LOG:Sanitized ${tc.title}: ${oid}`);
            
            try {
                const res = await db.insert(campaigns).values({
                    title: "Test " + tc.title,
                    description: "Test",
                    location: "Test",
                    start_date: new Date(),
                    end_date: new Date(),
                    organizer_id: oid
                }).returning();
                console.log(`LOG:Inserted ${tc.title}: ${res[0].id}`);
            } catch (e: any) {
                console.log(`LOG:Failed ${tc.title}: ${e.message}`);
            }
        }

    } catch (e: any) {
        console.log("LOG:Error:" + e.message);
    }
    process.exit(0);
}
run();
