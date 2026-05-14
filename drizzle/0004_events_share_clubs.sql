CREATE TABLE "clubs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "clubs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
INSERT INTO "clubs" ("id", "name", "slug", "created_at", "updated_at")
VALUES (
	'club_kayseri_runners',
	'Kayseri Runners Club',
	'kayseri-runners',
	now(),
	now()
)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "share_slug" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "club_id" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "required_items" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "coordinator_name" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "join_deadline_at" timestamp;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "weather_info" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cover_image_url" text;
--> statement-breakpoint
UPDATE "events" SET "share_slug" = 'share-' || "id" WHERE "share_slug" IS NULL;
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "share_slug" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_share_slug_unique" UNIQUE("share_slug");
--> statement-breakpoint
UPDATE "events" SET "club_id" = 'club_kayseri_runners' WHERE "club_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE set null ON UPDATE no action;
