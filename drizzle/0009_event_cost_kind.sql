CREATE TYPE "public"."event_cost_kind" AS ENUM('free', 'paid');--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cost_kind" "event_cost_kind" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cost_notes" text;