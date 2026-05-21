import { sql } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";

export type RegisterEmailStatus =
  | "available"
  | "awaiting_verification"
  | "already_active";

export async function getRegisterEmailStatus(
  email: string,
): Promise<RegisterEmailStatus> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return "available";

  const rows = await db
    .select({ emailVerified: user.emailVerified })
    .from(user)
    .where(sql`lower(${user.email}) = ${normalized}`)
    .limit(1);

  const row = rows[0];
  if (!row) return "available";
  if (!row.emailVerified) return "awaiting_verification";
  return "already_active";
}
