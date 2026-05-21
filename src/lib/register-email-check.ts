import { and, desc, gt, lte, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { user, verification } from "@/db/schema/auth";

export type RegisterEmailStatus =
  | "available"
  | "pending_verification"
  | "pending_verification_expired"
  | "already_active";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function verificationIdentifierMatch(normalizedEmail: string) {
  return or(
    sql`lower(${verification.identifier}) = ${normalizedEmail}`,
    sql`lower(${verification.identifier}) = ${`email:${normalizedEmail}`}`,
  );
}

/** Non-expired verification token for this email (if any). */
export async function countActiveVerificationTokensForEmail(email: string): Promise<number> {
  const normalized = normalizeEmail(email);
  if (!normalized) return 0;

  const now = new Date();
  const rows = await db
    .select({ id: verification.id })
    .from(verification)
    .where(and(verificationIdentifierMatch(normalized), gt(verification.expiresAt, now)));

  return rows.length;
}

export async function getActiveVerificationForEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const now = new Date();
  const rows = await db
    .select({
      id: verification.id,
      expiresAt: verification.expiresAt,
      createdAt: verification.createdAt,
    })
    .from(verification)
    .where(and(verificationIdentifierMatch(normalized), gt(verification.expiresAt, now)))
    .orderBy(desc(verification.expiresAt))
    .limit(1);

  return rows[0] ?? null;
}

export async function deleteExpiredVerificationsForEmail(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!normalized) return;

  const now = new Date();
  await db
    .delete(verification)
    .where(and(verificationIdentifierMatch(normalized), lte(verification.expiresAt, now)));
}

export async function getRegisterEmailStatus(
  email: string,
): Promise<RegisterEmailStatus> {
  const normalized = normalizeEmail(email);
  if (!normalized) return "available";

  const rows = await db
    .select({ emailVerified: user.emailVerified })
    .from(user)
    .where(sql`lower(${user.email}) = ${normalized}`)
    .limit(1);

  const row = rows[0];
  if (!row) return "available";
  if (row.emailVerified) return "already_active";

  const active = await getActiveVerificationForEmail(normalized);
  if (active) return "pending_verification";

  return "pending_verification_expired";
}
