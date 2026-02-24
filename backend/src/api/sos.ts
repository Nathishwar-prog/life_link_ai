import { Hono } from "hono";
import { sendSOS } from "../controllers/sosController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { rateLimitMiddleware } from "../middleware/rateLimitMiddleware.js";

export const sosRouter = new Hono();

// Apply Security Middleware
sosRouter.use("/", authMiddleware);
sosRouter.use("/", rateLimitMiddleware);

sosRouter.post("/", sendSOS);
