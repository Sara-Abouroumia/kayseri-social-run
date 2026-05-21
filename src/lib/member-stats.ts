import { count } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";

/** Total registered accounts in the `user` table. */
export async function getRegisteredUserCount(): Promise<number> {
  const row = await db.select({ n: count() }).from(user);
  return Number(row[0]?.n ?? 0);
}

/** Under 100: exact count. At 100+: floor to nearest hundred with a trailing "+". */
export function formatMemberCountForDisplay(count: number): {
  target: number;
  plus: boolean;
} {
  const safe = Math.max(0, Math.floor(count));
  if (safe >= 100) {
    return { target: Math.floor(safe / 100) * 100, plus: true };
  }
  return { target: safe, plus: false };
}
