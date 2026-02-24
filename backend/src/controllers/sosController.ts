import { Context } from "hono";
import { getEmergencyContacts } from "../services/contactService.js";
import { sendBulkSMS } from "../services/smsService.js";

interface SOSRequest {
    latitude?: number;
    longitude?: number;
    message?: string;
}

export const sendSOS = async (c: Context) => {
    try {
        const body: SOSRequest = await c.req.json();
        const { latitude, longitude, message } = body;

        // Construct the SOS message
        // Construct the SOS message
        let smsBody = `🚨 URGENT: BLOOD SOS ALERT 🚨\n\nSomeone is in critical need of help!`;

        if (message) {
            smsBody += `\n\nDETAILS: ${message}`;
        } else {
            smsBody += `\n\nNOTE: Immediate assistance is required. Please check the location.`;
        }

        if (latitude && longitude) {
            // Create a Google Maps link
            const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            smsBody += `\n\n📍 LOCATION: ${mapLink}`;
        }

        smsBody += `\n\n🙏 Please rush to help or contact emergency services immediately.`;

        // Fetch emergency contacts
        const contacts = await getEmergencyContacts();

        if (contacts.length === 0) {
            return c.json({
                success: false,
                message: "No emergency contacts found."
            }, 404);
        }

        // Send SMS to all contacts
        const results = await sendBulkSMS(contacts, smsBody);

        const successCount = results.filter(r => r.success).length;
        const failedCount = results.length - successCount;

        return c.json({
            success: true,
            message: `SOS sent to ${successCount} contacts.`,
            details: {
                total: results.length,
                success: successCount,
                failed: failedCount,
                results: results // Optional: Include detailed results for debugging
            }
        });

    } catch (error: any) {
        console.error("SOS Controller Error:", error);
        return c.json({
            success: false,
            message: "Failed to process SOS request.",
            error: error.message
        }, 500);
    }
};
