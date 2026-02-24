import { Context, Next } from "hono";

interface RateLimitStore {
    [key: string]: number; // timestamp of last request
}

const store: RateLimitStore = {};
const WINDOW_MS = 60 * 1000; // 1 minute

export const rateLimitMiddleware = async (c: Context, next: Next) => {
    // Identify user by IP or User ID if authenticated
    // Using IP for now as a fallback, or user ID if available in context
    const user = c.get('user');
    const key = user ? `user:${user.sub}` : `ip:${c.req.header("cf-connecting-ip") || "unknown"}`;
    // Note: Hono doesn't give IP easily without trusted proxy, assuming standard headers or just basic key

    const now = Date.now();
    const lastRequest = store[key];

    if (lastRequest && (now - lastRequest) < WINDOW_MS) {
        const remaining = Math.ceil((WINDOW_MS - (now - lastRequest)) / 1000);
        return c.json({
            error: "Too Many Requests",
            message: `Please wait ${remaining} seconds before sending another SOS.`
        }, 429);
    }

    store[key] = now;

    // Cleanup old entries periodically (optional optimization, omitted for simplicity)

    await next();
};
