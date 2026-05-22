CREATE TABLE "usage_page_views" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"visitor_id" text NOT NULL,
	"user_id" text,
	"pathname" text NOT NULL,
	"referrer" text,
	"duration_ms" integer,
	"ip_address" text,
	"country" text,
	"region" text,
	"city" text,
	"user_agent" text
);
--> statement-breakpoint
ALTER TABLE "usage_page_views" ADD CONSTRAINT "usage_page_views_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "usage_page_views_created_at_idx" ON "usage_page_views" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "usage_page_views_pathname_idx" ON "usage_page_views" USING btree ("pathname");
