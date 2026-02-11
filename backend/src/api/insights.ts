
import { Hono } from "hono";

export const insightsRouter = new Hono();

insightsRouter.get("/iron-absorption", (c) => {
    return c.json({
        title: "Tips for Improving Iron Absorption",
        content: [
            "Consume Vitamin C rich foods (citrus fruits, bell peppers) with iron-rich meals.",
            "Avoid drinking tea or coffee with meals as tannins can inhibit iron absorption.",
            "Cook in cast iron skillets to increase iron content in food.",
            "Include lean meats, poultry, and fish in your diet as they contain heme iron which is easily absorbed.",
            "Soak beans and grains before cooking to reduce phytates which can block iron absorption."
        ],
        source: "General Health Guidelines"
    });
});

insightsRouter.get("/donor-recovery", (c) => {
    return c.json({
        title: "Post-Donation Recovery Advice",
        content: [
            "Drink plenty of fluids for the next 24-48 hours.",
            "Avoid strenuous physical activity or heavy lifting for the rest of the day.",
            "Keep the bandage on for the next 5 hours.",
            "If you feel lightheaded, lie down with your feet up until the feeling passes.",
            "Eat a healthy meal rich in iron and protein."
        ],
        source: "Blood Donation Center Protocols"
    });
});

insightsRouter.post("/compatibility", async (c) => {
    const { blood_type } = await c.req.json();
    const type = blood_type.toUpperCase().replace(" ", "");

    const chart: Record<string, { give: string[], receive: string[] }> = {
        "O-": { "give": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], "receive": ["O-"] },
        "O+": { "give": ["O+", "A+", "B+", "AB+"], "receive": ["O+", "O-"] },
        "A-": { "give": ["A-", "A+", "AB-", "AB+"], "receive": ["A-", "O-"] },
        "A+": { "give": ["A+", "AB+"], "receive": ["A+", "A-", "O+", "O-"] },
        "B-": { "give": ["B-", "B+", "AB-", "AB+"], "receive": ["B-", "O-"] },
        "B+": { "give": ["B+", "AB+"], "receive": ["B+", "B-", "O+", "O-"] },
        "AB-": { "give": ["AB-", "AB+"], "receive": ["AB-", "A-", "B-", "O-"] },
        "AB+": { "give": ["AB+"], "receive": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] }
    };

    if (!chart[type]) {
        return c.json({ detail: "Invalid blood type" }, 400);
    }

    return c.json({
        blood_type: type,
        can_give_to: chart[type].give,
        can_receive_from: chart[type].receive
    });
});


