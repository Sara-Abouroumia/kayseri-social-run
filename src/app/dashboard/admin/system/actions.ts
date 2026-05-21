"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  findUserIdByEmail,
  grantPlatformAdmin,
  revokePlatformAdminDbRow,
} from "@/lib/platform-admin";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { createPlatformAdminInviteAndEmail } from "@/lib/platform-admin-invite";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin-session";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

export type SystemUserActionState = { message?: string; ok?: boolean };

const emailSchema = z
  .string()
  .trim()
  .min(3)
  .max(320)
  .email("Enter a valid email address.");

export async function addPlatformAdminByEmailAction(
  _prev: { message?: string; ok?: boolean } | undefined,
  formData: FormData,
): Promise<{ message?: string; ok?: boolean }> {
  const gate = await requirePlatformAdminSession();
  if (!gate.ok) {
    return {
      message:
        gate.message === "Unauthorized"
          ? "You must be signed in."
          : "You do not have permission to manage admins.",
      ok: false,
    };
  }

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Invalid email.", ok: false };
  }

  const targetUserId = await findUserIdByEmail(parsed.data);
  if (!targetUserId) {
    const invited = await createPlatformAdminInviteAndEmail({
      email: parsed.data,
      invitedByUserId: gate.session.user.id,
    });
    if (!invited.ok) {
      return { message: invited.message, ok: false };
    }
    revalidatePath("/dashboard/admin/system");
    return {
      message:
        "No account yet for that address. We sent an invitation email with a registration link. After they register and verify their email, they become an admin automatically.",
      ok: true,
    };
  }
  const result = await grantPlatformAdmin({
    targetUserId,
    grantedByUserId: gate.session.user.id,
  });

  if (!result.ok) {
    return { message: result.message, ok: false };
  }

  revalidatePath("/dashboard/admin/system");
  revalidatePath("/dashboard");
  return { message: "Admin access granted.", ok: true };
}

export async function removePlatformAdminAction(
  _prev: { message?: string; ok?: boolean } | undefined,
  formData: FormData,
): Promise<{ message?: string; ok?: boolean }> {
  const gate = await requirePlatformAdminSession();
  if (!gate.ok) {
    return {
      message:
        gate.message === "Unauthorized"
          ? "You must be signed in."
          : "You do not have permission to manage admins.",
      ok: false,
    };
  }

  const userId = z.string().min(1).safeParse(formData.get("userId"));
  if (!userId.success) {
    return { message: "Invalid request.", ok: false };
  }

  const result = await revokePlatformAdminDbRow({
    actorUserId: gate.session.user.id,
    actorEmail: gate.session.user.email,
    targetUserId: userId.data,
  });

  if (!result.ok) {
    return { message: result.message, ok: false };
  }

  const target = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, userId.data))
    .limit(1);
  const displayName = target[0]?.name?.trim() || "User";
  const copy = getDictionary(await getLocale()).systemAdmin;

  revalidatePath("/dashboard/admin/system");
  revalidatePath("/dashboard");
  return {
    ok: true,
    message: copy.removeAdminSuccess.replace("{name}", displayName),
  };
}

export async function grantPlatformAdminByUserIdAction(
  _prev: SystemUserActionState | undefined,
  formData: FormData,
): Promise<SystemUserActionState> {
  const gate = await requirePlatformAdminSession();
  if (!gate.ok) {
    return {
      message:
        gate.message === "Unauthorized"
          ? "You must be signed in."
          : "You do not have permission to manage admins.",
      ok: false,
    };
  }

  const userId = z.string().min(1).safeParse(formData.get("userId"));
  if (!userId.success) {
    return { message: "Invalid request.", ok: false };
  }

  const result = await grantPlatformAdmin({
    targetUserId: userId.data,
    grantedByUserId: gate.session.user.id,
  });

  if (!result.ok) {
    return { message: result.message, ok: false };
  }

  const target = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, userId.data))
    .limit(1);
  const displayName = target[0]?.name?.trim() || "User";
  const copy = getDictionary(await getLocale()).systemAdmin;

  revalidatePath("/dashboard/admin/system");
  revalidatePath("/dashboard");
  return {
    ok: true,
    message: copy.makeAdminSuccess.replace("{name}", displayName),
  };
}
