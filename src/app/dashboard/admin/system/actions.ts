"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  findUserIdByEmail,
  grantPlatformAdmin,
  revokePlatformAdminDbRow,
} from "@/lib/platform-admin";
import { createPlatformAdminInviteAndEmail } from "@/lib/platform-admin-invite";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin-session";

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
    targetUserId: userId.data,
  });

  if (!result.ok) {
    return { message: result.message, ok: false };
  }

  revalidatePath("/dashboard/admin/system");
  revalidatePath("/dashboard");
  return { message: "Admin access removed.", ok: true };
}
