import { sendSMS } from "../services/smsService.js";
import { config } from "dotenv";
import path from "path";

// Load env variables
config({ path: path.resolve(process.cwd(), "../.env") });

async function testVerified() {
    const verifiedNumber = "+919952315440"; // The number from the screenshot
    console.log(`Testing SMS to verified number: ${verifiedNumber}`);

    if (!process.env.TWILIO_ACCOUNT_SID) {
        console.error("❌ Twilio credentials missing from environment.");
        process.exit(1);
    }

    console.log("Using Twilio Number:", process.env.TWILIO_PHONE_NUMBER);

    const result = await sendSMS(verifiedNumber, "✅ SUCCESS! Your SOS System is sending messages correctly.");

    if (result.success) {
        console.log("✅ Message Sent Successfully!");
        console.log("SID:", result.sid);
    } else {
        console.error("❌ Message Failed:");
        console.error(result.error);
    }
}

testVerified();
