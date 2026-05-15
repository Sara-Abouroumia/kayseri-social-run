"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";

const genderSchema = z.enum(["female", "male"]);

export type ProfileActionState = { ok?: boolean; message?: string };

export async function updateProfileGenderAction(
  _prev: ProfileActionState | undefined,
  formData: FormData,
): Promise<ProfileActionState> {
  const dict = getDictionary(await getLocale());

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return { ok: false, message: dict.profileActions.mustSignIn };
  }

  const [row] = await db
    .select({ genderChosenAt: user.genderChosenAt })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (row?.genderChosenAt) {
    return { ok: false, message: dict.profileActions.genderAlreadySet };
  }

  const raw = formData.get("gender");
  const parsed = genderSchema.safeParse(typeof raw === "string" ? raw : "");
  if (!parsed.success) {
    return { ok: false, message: dict.profileActions.invalidGender };
  }

  const now = new Date();
  await db
    .update(user)
    .set({ gender: parsed.data, genderChosenAt: now, updatedAt: now })
    .where(eq(user.id, session.user.id));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  return { ok: true, message: dict.profileActions.updated };
}
