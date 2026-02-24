import { twilioClient, twilioPhoneNumber } from "../config/sms.js";
import { getEmergencyContacts } from "../services/contactService.js";
import { initDB } from "../db/index.js";
import { config } from "dotenv";
import path from "path";

// Load env variables
config({ path: path.resolve(process.cwd(), "../.env") });

async function debugSMS() {
    console.log("--- SMS DEBUGGER ---");

    // 1. Check Config
    console.log("1. Checking Environment Variables:");
    console.log("   TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "SET" : "MISSING");
    console.log("   TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "SET" : "MISSING");
    console.log("   TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER);

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.error("❌ CRITICAL: Twilio credentials are missing!");
        process.exit(1);
    }

    try {
        await initDB();
        console.log("✅ DB Connected.");
    } catch (e) {
        console.error("❌ DB Connection failed:", e);
        process.exit(1);
    }

    // 2. Check Contacts
    console.log("\n2. Fetching Contacts...");
    const contacts = await getEmergencyContacts();
    console.log(`   Found ${contacts.length} contacts.`);
    if (contacts.length > 0) {
        console.log("   Sample contacts:", contacts.slice(0, 3));
        console.log("   Are they in E.164 format? (e.g., +1234567890)");
    } else {
        console.warn("⚠️ No contacts found in DB.");
    }

    // 3. Test Send (Interactive or Hardcoded)
    if (contacts.length > 0) {
        const testNumber = contacts[0];
        console.log(`\n3. Attempting to send test SMS to FIRST contact: ${testNumber}`);
        try {
            const msg = await twilioClient.messages.create({
                body: "🔍 SOS Debug Message: Verification Test",
                from: twilioPhoneNumber,
                to: testNumber
            });
            console.log("✅ Twilio Accepted Request:");
            console.log("   SID:", msg.sid);
            console.log("   Status:", msg.status);
        } catch (error: any) {
            console.error("❌ Twilio Send Failed:");
            console.error("   Code:", error.code);
            console.error("   Message:", error.message);
            console.error("   More Info:", error.moreInfo);
        }
    } else {
        console.log("\n3. Skipping send test (no contacts).");
    }

    process.exit(0);
}

debugSMS();
