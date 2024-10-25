ALTER TABLE "invoices" ADD COLUMN "userId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "useId";