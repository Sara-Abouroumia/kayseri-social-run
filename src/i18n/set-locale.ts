"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";

import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";

export async function setLocaleAction(locale: Locale): Promise<void> {
  const next = isLocale(locale) ? locale : defaultLocale;
  (await cookies()).set(LOCALE_COOKIE, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 5,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user?.id) {
    await db
      .update(user)
      .set({ preferredLocale: next, updatedAt: new Date() })
      .where(eq(user.id, session.user.id));
  }

  revalidatePath("/", "layout");
}
