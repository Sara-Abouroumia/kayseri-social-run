import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";

import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";

const localeCookieOptions = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365 * 5,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

/** Persist Turkish when no locale cookie exists yet (first visit). */
async function ensureDefaultLocaleCookie(): Promise<void> {
  try {
    const store = await cookies();
    const raw = store.get(LOCALE_COOKIE)?.value;
    if (!isLocale(raw)) {
      store.set(LOCALE_COOKIE, defaultLocale, localeCookieOptions);
    }
  } catch {
    /* cookies() unavailable outside request */
  }
}

export async function getLocale(): Promise<Locale> {
  if (!process.env.DATABASE_URL?.trim()) {
    try {
      await ensureDefaultLocaleCookie();
      const raw = (await cookies()).get(LOCALE_COOKIE)?.value;
      return isLocale(raw) ? raw : defaultLocale;
    } catch {
      return defaultLocale;
    }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user?.id) {
    const rows = await db
      .select({ preferredLocale: user.preferredLocale })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);
    const saved = rows[0]?.preferredLocale;
    if (isLocale(saved)) return saved;
  }

  await ensureDefaultLocaleCookie();
  const raw = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : defaultLocale;
}
