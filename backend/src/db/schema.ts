
import { pgTable, text, uuid, boolean, integer, timestamp, jsonb, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "DONOR", "PATIENT", "STAFF"]);

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    hashed_password: text("hashed_password").notNull(),
    full_name: text("full_name"),
    role: userRoleEnum("role").default("PATIENT").notNull(),
    created_at: timestamp("created_at").defaultNow(),
});

export const bloodBanks = pgTable("blood_banks", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    contact_number: text("contact_number"),
    is_active: boolean("is_active").default(true),
    // PostGIS location column needs raw SQL since Drizzle ORM doesn't have a native type yet for it in pg-core directly without extensions, 
    // but we can manage it via SQL or just keep lat/long for now and use SQL for calculations.
    // We will assume the existence of the column or query it using lat/lng.
    // Actually, let's keep it simple and use lat/lng for application logic and raw SQL for distance queries.
});

export const bloodInventory = pgTable("blood_inventory", {
    blood_bank_id: uuid("blood_bank_id").references(() => bloodBanks.id).notNull(),
    blood_type: text("blood_type").notNull(), // A+, O-, etc.
    units_available: integer("units_available").default(0).notNull(),
    last_updated: timestamp("last_updated").defaultNow(),
}, (table) => {
    return {
        pk: { columns: [table.blood_bank_id, table.blood_type] },
    }
});

export const campaigns = pgTable("campaigns", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    location: text("location").notNull(),
    start_date: timestamp("start_date").notNull(),
    end_date: timestamp("end_date").notNull(),
    organizer_id: uuid("organizer_id").references(() => users.id),
    created_at: timestamp("created_at").defaultNow(),
});

export const donors = pgTable("donors", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").references(() => users.id), // Optional link to system user
    full_name: text("full_name").notNull(),
    blood_type: text("blood_type").notNull(),
    phone_number: text("phone_number").notNull(),
    email: text("email"),
    city: text("city").notNull(),
    address: text("address"),
    last_donation_date: timestamp("last_donation_date"),
    is_available: boolean("is_available").default(true),
    created_at: timestamp("created_at").defaultNow(),
});

export const bloodRequestsEnum = pgEnum("request_status", ["PENDING", "FULFILLED", "CANCELLED"]);

export const bloodRequests = pgTable("blood_requests", {
    id: uuid("id").defaultRandom().primaryKey(),
    patient_name: text("patient_name").notNull(),
    blood_type: text("blood_type").notNull(),
    units_needed: integer("units_needed").notNull(),
    hospital_name: text("hospital_name").notNull(),
    location: text("location").notNull(), // Could be coords or text
    urgency: text("urgency").default("NORMAL"), // NORMAL, HIGH, CRITICAL
    status: bloodRequestsEnum("status").default("PENDING"),
    contact_number: text("contact_number").notNull(),
    requester_id: uuid("requester_id").references(() => users.id),
    created_at: timestamp("created_at").defaultNow(),
});
