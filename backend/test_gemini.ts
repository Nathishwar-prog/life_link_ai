import { config } from 'dotenv';
config({ path: '../.env' });
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function test() {
    try {
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are a helpful medical assistant for a Blood Bank. Answer questions about blood donation eligibility, process, and after-care. Be encouraging but medically accurate. If unsure, advise seeing a doctor." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I will assist donors with their queries regarding blood donation." }],
                }
            ],
        });

        const result = await chat.sendMessage("i have a chest pain");
        console.log("SUCCESS");
    } catch (error: any) {
        console.log("EXACT MESSAGE: " + error.message);
    }
}
test();
