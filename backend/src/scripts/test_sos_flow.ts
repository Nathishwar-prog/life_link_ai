import { getEmergencyContacts } from "../services/contactService.js";
import { sendBulkSMS } from "../services/smsService.js";
import { initDB } from "../db/index.js";
import { config } from "dotenv";
import path from "path";

// Load env variables
// Assuming running from 'backend' folder: .env is in parent root
config({ path: path.resolve(process.cwd(), "../.env") });

async function testSOS() {
    console.log("1. Initializing DB...");
    try {
        await initDB();
        console.log("DB Connected.");
    } catch (e) {
        console.error("DB Connection failed:", e);
        // Continue to test SMS logic even if DB fails, though contacts fetch will fail
    }

    console.log("\n2. Testing Contact Fetching...");
    let contacts: string[] = [];
    try {
        contacts = await getEmergencyContacts();
        console.log("Contacts found:", contacts);
    } catch (e) {
        console.error("Failed to fetch contacts:", e);
    }

    if (contacts.length === 0) {
        console.log("No contacts found. Adding dummy contacts for SMS test path.");
        contacts.push("+15550000000");
    }

    console.log("\n3. Testing SMS Service...");
    const message = "🚨 TEST SOS ALERT: This is a verification test.";

    if (!process.env.TWILIO_ACCOUNT_SID) {
        console.log("Twilio credentials missing in loaded env. Skipping actual SMS send.");
    } else {
        const results = await sendBulkSMS(contacts, message);
        console.log("SMS Results:", JSON.stringify(results, null, 2));
    }

    process.exit(0);
}

testSOS();
