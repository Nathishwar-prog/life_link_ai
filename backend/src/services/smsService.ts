import { twilioClient, twilioPhoneNumber } from "../config/sms.js";

interface SendSMSResult {
    success: boolean;
    sid?: string;
    error?: string;
    to: string;
}

/**
 * Sends an SMS to a single phone number.
 */
export async function sendSMS(to: string, body: string): Promise<SendSMSResult> {
    try {
        const message = await twilioClient.messages.create({
            body,
            from: twilioPhoneNumber,
            to
        });
        return { success: true, sid: message.sid, to };
    } catch (error: any) {
        console.error(`Failed to send SMS to ${to}:`, error);
        return { success: false, error: error.message, to };
    }
}

/**
 * Sends SMS to multiple phone numbers.
 */
export async function sendBulkSMS(phoneNumbers: string[], message: string): Promise<SendSMSResult[]> {
    const results = await Promise.all(
        phoneNumbers.map(number => sendSMS(number, message))
    );
    return results;
}
