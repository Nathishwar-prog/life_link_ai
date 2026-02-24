import { db } from "../db/index.js";
import { donors } from "../db/schema.js";
import { isNotNull } from "drizzle-orm";

/**
 * Normalizes phone numbers to E.164 format.
 * Defaults to +91 (India) if 10 digits and no country code.
 */
function normalizePhoneNumber(phone: string): string | null {
    // Remove all non-numeric characters except +
    const cleaned = phone.replace(/[^+\d]/g, '');

    if (!cleaned) return null;

    // Check if it already has a country code (starts with +)
    if (cleaned.startsWith('+')) {
        // Basic E.164 check: + followed by 10-15 digits
        if (cleaned.length >= 11 && cleaned.length <= 16) {
            return cleaned;
        }
    } else {
        // Assume it's a local number.
        // If 10 digits, assume India (+91) as default for this project context
        if (cleaned.length === 10) {
            return `+91${cleaned}`;
        }
    }

    console.warn(`[ContactService] Skipping invalid phone number format: ${phone} -> ${cleaned}`);
    return null;
}

/**
 * Fetches all valid phone numbers from the donors table to use as emergency contacts.
 */
/**
 * Fetches emergency contacts (Hardcoded for now).
 */
export async function getEmergencyContacts(): Promise<string[]> {
    return [
        "+919952315440",
        "+917010325228",
        "+919080408302"
    ];

    /* 
    try {
        const allDonors = await db
            .select({ phoneNumber: donors.phone_number })
            .from(donors)
            .where(isNotNull(donors.phone_number));

        // Filter and clean phone numbers (ensure unique)
        const phoneNumbers = allDonors
            .map(d => normalizePhoneNumber(d.phoneNumber))
            .filter((num): num is string => num !== null);

        const uniqueNumbers = [...new Set(phoneNumbers)];
        
        console.log(`[ContactService] Fetched ${uniqueNumbers.length} valid contacts from ${allDonors.length} records.`);
        
        return uniqueNumbers; 
    } catch (error) {
        console.error("Error fetching emergency contacts:", error);
        return [];
    }
    */
}
