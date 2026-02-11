import pg from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const sql = `CREATE TYPE "public"."request_status" AS ENUM('PENDING', 'FULFILLED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'DONOR', 'PATIENT', 'STAFF');--> statement-breakpoint
CREATE TABLE "blood_banks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"contact_number" text,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "blood_inventory" (
	"blood_bank_id" uuid NOT NULL,
	"blood_type" text NOT NULL,
	"units_available" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blood_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_name" text NOT NULL,
	"blood_type" text NOT NULL,
	"units_needed" integer NOT NULL,
	"hospital_name" text NOT NULL,
	"location" text NOT NULL,
	"urgency" text DEFAULT 'NORMAL',
	"status" "request_status" DEFAULT 'PENDING',
	"contact_number" text NOT NULL,
	"requester_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"organizer_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "donors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"full_name" text NOT NULL,
	"blood_type" text NOT NULL,
	"phone_number" text NOT NULL,
	"email" text,
	"city" text NOT NULL,
	"address" text,
	"last_donation_date" timestamp,
	"is_available" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"hashed_password" text NOT NULL,
	"full_name" text,
	"role" "user_role" DEFAULT 'PATIENT' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "blood_inventory" ADD CONSTRAINT "blood_inventory_blood_bank_id_blood_banks_id_fk" FOREIGN KEY ("blood_bank_id") REFERENCES "public"."blood_banks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donors" ADD CONSTRAINT "donors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;`;

async function migrate() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL missing");
        return;
    }
    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
    });
    await client.connect();

    const statements = sql.split("--> statement-breakpoint");

    for (const stmt of statements) {
        const trimmed = stmt.trim();
        if (trimmed) {
            console.log("Executing:", trimmed.substring(0, 50) + "...");
            try {
                await client.query(trimmed);
            } catch (err: any) {
                // Ignore "already exists" errors to make it idempotent-ish
                if (err.code === '42P07' || err.code === '42710' || err.code === '42704') {
                    console.log("  -> Already exists/skipped.");
                } else {
                    console.error("  -> Error:", err.message);
                }
            }
        }
    }

    console.log("Migration complete.");
    await client.end();
}

migrate().catch(console.error);
