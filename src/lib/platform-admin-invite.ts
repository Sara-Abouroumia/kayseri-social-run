import { createHash, randomBytes } from "node:crypto";

import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/db";
import { platformAdminInvite } from "@/db/schema/platform-admin-invite";
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

function escapeHtmlLite(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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

  sendTransactionalEmail({
    to: email,
    subject: "Invitation: Kayseri Social Run admin access",
    text: `You have been invited to register as a platform admin for Kayseri Social Run.

Use this exact email when you create your account: ${email}

Register here (link expires in 14 days):
${registerUrl}

After you sign up, you will receive a second email with a link to verify your email address. When you complete verification, admin access is turned on automatically.

— Kayseri Social Run
`,
    html: `<p>You have been invited to register as a <strong>platform admin</strong> for Kayseri Social Run.</p>
<p>Use this exact email when you create your account: <strong>${escapeHtmlLite(email)}</strong></p>
<p><a href="${registerUrl}">Register here</a> (expires in 14 days)</p>
<p>After you sign up, you will receive an email with a link to <strong>verify your email</strong>. When verification completes, admin access is enabled automatically.</p>`,
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
