CREATE TYPE "public"."user_gender" AS ENUM('female', 'male', 'other', 'prefer_not_say');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "gender" "user_gender" DEFAULT 'prefer_not_say' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "event_participants_event_id_user_id_uidx" ON "event_participants" USING btree ("event_id","user_id");