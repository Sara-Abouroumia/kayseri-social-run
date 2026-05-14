import { eq } from "drizzle-orm";

import { db } from "@/db";
import { events } from "@/db/schema/events";

function randomSuffix(length: number): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function slugBaseFromTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base.length > 0 ? base : "event";
}

export async function allocateUniqueShareSlug(title: string): Promise<string> {
  const base = slugBaseFromTitle(title);
  for (let attempt = 0; attempt < 12; attempt++) {
    const candidate =
      attempt === 0 ? base : `${base}-${randomSuffix(4 + attempt)}`;
    const trimmed = candidate.slice(0, 96);
    const taken = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.shareSlug, trimmed))
      .limit(1);
    if (!taken[0]) return trimmed;
  }
  return `${base}-${randomSuffix(10)}`.slice(0, 96);
}
