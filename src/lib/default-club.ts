import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clubs } from "@/db/schema/clubs";

export const DEFAULT_CLUB_SLUG = "kayseri-runners";
export const DEFAULT_CLUB_ID = "club_kayseri_runners";

export async function getOrCreateDefaultClubId(): Promise<string> {
  const existing = await db
    .select({ id: clubs.id })
    .from(clubs)
    .where(eq(clubs.slug, DEFAULT_CLUB_SLUG))
    .limit(1);
  if (existing[0]) return existing[0].id;

  const now = new Date();
  await db
    .insert(clubs)
    .values({
      id: DEFAULT_CLUB_ID,
      name: "Kayseri Runners Club",
      slug: DEFAULT_CLUB_SLUG,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: clubs.slug });

  const again = await db
    .select({ id: clubs.id })
    .from(clubs)
    .where(eq(clubs.slug, DEFAULT_CLUB_SLUG))
    .limit(1);

  if (!again[0]) {
    throw new Error("Could not create or load the default club row.");
  }
  return again[0].id;
}
