import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";

import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";

export async function getLocale(): Promise<Locale> {
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

  const raw = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : defaultLocale;
}
