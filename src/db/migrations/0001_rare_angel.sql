ALTER TABLE "invoices" ALTER COLUMN "value" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "useId" text NOT NULL;