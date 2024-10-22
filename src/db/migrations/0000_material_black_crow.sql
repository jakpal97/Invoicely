CREATE TYPE "public"."status" AS ENUM('open', 'paid', 'void');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"createTs" timestamp DEFAULT now() NOT NULL,
	"value" integer,
	"description" text NOT NULL,
	"status" "status" NOT NULL
);
