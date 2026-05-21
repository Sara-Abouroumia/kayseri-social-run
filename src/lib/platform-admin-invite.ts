import { createHash, randomBytes } from "node:crypto";

import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/db";
import { platformAdminInvite } from "@/db/schema/platform-admin-invite";
import { getLocale } from "@/i18n/get-locale";
import { getTransactionalEmailCopy } from "@/i18n/messages/transactional-email";
import { buildAdminInviteEmail } from "@/lib/email-templates";
import { grantPlatformAdmin, isPlatformAdmin } from "@/lib/platform-admin";
import { sendTransactionalEmail } from "@/lib/send-email";
import { getSiteUrl } from "@/lib/site-url";

const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function isInviteTableMissingError(error: unknown): boolean {
  const walk = (e: unknown): boolean => {
    if (e == null || typeof e !== "object") return false;
    const o = e as Record<string, unknown>;
    if (o.code === "42P01") return true;
    const msg = String(o.message ?? "");
    if (/relation\s+"platform_admin_invite"\s+does not exist/i.test(msg))
      return true;
    if (o.cause != null) return walk(o.cause);
    return false;
  };
  return walk(error);
}

export function hashAdminInviteToken(raw: string): string {
  return createHash("sha256").update(raw.trim(), "utf8").digest("hex");
}

export async function getInviteEmailForRegisterToken(
  rawToken: string,
): Promise<string | null> {
  const hash = hashAdminInviteToken(rawToken);
  try {
    const rows = await db
      .select({ email: platformAdminInvite.email })
      .from(platformAdminInvite)
      .where(
        and(
          eq(platformAdminInvite.tokenHash, hash),
          isNull(platformAdminInvite.usedAt),
          gt(platformAdminInvite.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return rows[0]?.email ?? null;
  } catch (e) {
    if (isInviteTableMissingError(e)) return null;
    throw e;
  }
}

export async function createPlatformAdminInviteAndEmail(params: {
  email: string;
  invitedByUserId: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const email = params.email.trim().toLowerCase();
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashAdminInviteToken(rawToken);
  const id = randomBytes(16).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + INVITE_TTL_MS);

  try {
    await db
      .delete(platformAdminInvite)
      .where(eq(platformAdminInvite.email, email));
    await db.insert(platformAdminInvite).values({
      id,
      email,
      tokenHash,
      invitedByUserId: params.invitedByUserId,
      createdAt: now,
      expiresAt,
      usedAt: null,
    });
  } catch (e) {
    if (isInviteTableMissingError(e)) {
      return {
        ok: false,
        message:
          "Run `npm run db:migrate` so the platform_admin_invite table exists, then try again.",
      };
    }
    throw e;
  }

  const base = getSiteUrl();
  const registerUrl = `${base}/register?invite=${encodeURIComponent(rawToken)}`;
  const locale = await getLocale();
  const copy = getTransactionalEmailCopy(locale);
  const message = buildAdminInviteEmail({
    copy,
    siteUrl: base,
    registerUrl,
    inviteEmail: email,
  });

  sendTransactionalEmail({
    to: email,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  return { ok: true };
}

/**
 * Called from Better Auth after the user verifies their email.
 * If a pending admin invite exists for that email, grant platform admin and consume the invite.
 */
export async function redeemPendingAdminInviteAfterEmailVerification(
  userId: string,
  email: string,
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  let pending;
  try {
    pending = await db
      .select()
      .from(platformAdminInvite)
      .where(
        and(
          eq(platformAdminInvite.email, normalized),
          isNull(platformAdminInvite.usedAt),
          gt(platformAdminInvite.expiresAt, new Date()),
        ),
      )
      .limit(1);
  } catch (e) {
    if (isInviteTableMissingError(e)) return;
    throw e;
  }

  const row = pending[0];
  if (!row) return;

  if (await isPlatformAdmin(userId, email)) {
    await db
      .update(platformAdminInvite)
      .set({ usedAt: new Date() })
      .where(eq(platformAdminInvite.id, row.id));
    return;
  }

  const grant = await grantPlatformAdmin({
    targetUserId: userId,
    grantedByUserId: row.invitedByUserId ?? userId,
  });

  if (!grant.ok) {
    return;
  }

  await db
    .update(platformAdminInvite)
    .set({ usedAt: new Date() })
    .where(eq(platformAdminInvite.id, row.id));
}
