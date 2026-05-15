ALTER TABLE "user" ALTER COLUMN "gender" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "gender" SET DATA TYPE text USING "gender"::text;--> statement-breakpoint
UPDATE "user" SET "gender" = 'female' WHERE "gender" IS NULL OR "gender" NOT IN ('female', 'male');--> statement-breakpoint
DROP TYPE "public"."user_gender";--> statement-breakpoint
CREATE TYPE "public"."user_gender" AS ENUM('female', 'male');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "gender" SET DATA TYPE "public"."user_gender" USING "gender"::"public"."user_gender";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "gender" SET DEFAULT 'female'::"public"."user_gender";
