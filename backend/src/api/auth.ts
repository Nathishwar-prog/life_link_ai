
import { Hono } from "hono";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
const { sign } = jwt;
import bcrypt from "bcryptjs";
const { hash, compare } = bcrypt;


export const authRouter = new Hono();

authRouter.post("/register", async (c) => {
    const { email, password, full_name, role } = await c.req.json();

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
        return c.json({ detail: "Email already registered" }, 400);
    }

    const hashedPassword = await hash(password, 10);

    // Cast role string to enum compliant type if strict
    const newRole = role === "AGENCY" ? "STAFF" : (role || "PATIENT");

    const [newUser] = await db.insert(users).values({
        email,
        hashed_password: hashedPassword,
        full_name,
        role: newRole,
    }).returning();

    return c.json({ msg: "User created", role: newUser.role });
});

authRouter.post("/login", async (c) => {
    const { email, password } = await c.req.json();

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !(await compare(password, user.hashed_password))) {
        return c.json({ detail: "Invalid credentials" }, 401);
    }

    const SECRET_KEY = process.env.JWT_SECRET || "fallback-secret-key";
    const token = sign(
        { sub: user.id, role: user.role },
        SECRET_KEY,
        { expiresIn: "24h" }
    );

    return c.json({
        access_token: token,
        token_type: "bearer",
        role: user.role,
        full_name: user.full_name,
        id: user.id
    });
});


