import { Context, Next } from "hono";
import jwt from "jsonwebtoken";
const { verify } = jwt;

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");
    console.log("AuthMiddleware: Header received:", authHeader ? `${authHeader.substring(0, 15)}...` : "NONE");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized: Missing or invalid token" }, 401);
    }

    const token = authHeader.split(" ")[1];

    // Read secret key inside the function to ensure env vars are loaded
    const SECRET_KEY = process.env.JWT_SECRET || "fallback-secret-key";
    console.log("AuthMiddleware: Using Secret:", SECRET_KEY.substring(0, 5) + "...");

    try {
        const decoded = verify(token, SECRET_KEY);
        // Attach user to context if needed, though Hono context is immutable-ish usually we set variable
        c.set('user', decoded);
        await next();
    } catch (err: any) {
        console.error("AuthMiddleware: Token verification failed:", err.message);
        return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }
};
