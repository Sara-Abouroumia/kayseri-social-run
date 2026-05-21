CREATE TABLE "community_idea_read" (
	"admin_user_id" text NOT NULL,
	"idea_id" text NOT NULL,
	"read_at" timestamp NOT NULL,
	CONSTRAINT "community_idea_read_admin_user_id_idea_id_pk" PRIMARY KEY("admin_user_id","idea_id")
);
--> statement-breakpoint
ALTER TABLE "community_idea_read" ADD CONSTRAINT "community_idea_read_admin_user_id_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "community_idea_read" ADD CONSTRAINT "community_idea_read_idea_id_community_idea_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."community_idea"("id") ON DELETE cascade ON UPDATE no action;
