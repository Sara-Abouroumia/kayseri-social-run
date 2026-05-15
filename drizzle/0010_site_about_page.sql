CREATE TABLE "site_about_page" (
	"id" text PRIMARY KEY NOT NULL,
	"draft_blocks" jsonb NOT NULL,
	"published_blocks" jsonb NOT NULL,
	"draft_page_style" text DEFAULT 'default' NOT NULL,
	"published_page_style" text DEFAULT 'default' NOT NULL,
	"updated_at" timestamp NOT NULL,
	"published_at" timestamp,
	"draft_updated_by_user_id" text
);
--> statement-breakpoint
ALTER TABLE "site_about_page" ADD CONSTRAINT "site_about_page_draft_updated_by_user_id_user_id_fk" FOREIGN KEY ("draft_updated_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;