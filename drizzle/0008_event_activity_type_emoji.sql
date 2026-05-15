ALTER TABLE "events" ALTER COLUMN "activity_type" SET DEFAULT 'Run';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "activity_type_emoji" text;