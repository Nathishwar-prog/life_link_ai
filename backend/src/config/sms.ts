import { config } from 'dotenv';
import path from 'path';
import twilio from 'twilio';

// Load .env from project root (parent of backend)
config({ path: path.resolve(process.cwd(), '../.env') });
// Also try default location just in case
config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
export const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn("⚠️ Twilio credentials missing in .env file. SMS feature will not work.");
}

export const twilioClient = twilio(accountSid, authToken);
