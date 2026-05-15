CREATE TYPE "public"."join_approval_mode" AS ENUM('auto', 'manual', 'conditional');--> statement-breakpoint
CREATE TYPE "public"."registration_question_type" AS ENUM('checkbox', 'yes_no', 'text', 'number');--> statement-breakpoint
ALTER TYPE "public"."participation_status" ADD VALUE 'pending' BEFORE 'cancelled';--> statement-breakpoint
ALTER TYPE "public"."participation_status" ADD VALUE 'rejected' BEFORE 'cancelled';--> statement-breakpoint
CREATE TABLE "event_participant_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"participant_id" text NOT NULL,
	"question_id" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registration_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"label" text NOT NULL,
	"question_type" "registration_question_type" NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"options" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"depends_on_question_id" text,
	"depends_on_value" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "join_approval_mode" "join_approval_mode" DEFAULT 'auto' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "join_approval_config" jsonb;--> statement-breakpoint
ALTER TABLE "event_participant_answers" ADD CONSTRAINT "event_participant_answers_participant_id_event_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."event_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participant_answers" ADD CONSTRAINT "event_participant_answers_question_id_event_registration_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."event_registration_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration_questions" ADD CONSTRAINT "event_registration_questions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "event_participant_answers_participant_question_uidx" ON "event_participant_answers" USING btree ("participant_id","question_id");