import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/platform-admin";

export async function requirePlatformAdminSession(): Promise<
  | { ok: false; message: string }
  | { ok: true; session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>> }
> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id || !session.user.email) {
    return { ok: false, message: "Unauthorized" };
  }
  const allowed = await isPlatformAdmin(session.user.id, session.user.email);
  if (!allowed) {
    return { ok: false, message: "Forbidden" };
  }
  return { ok: true, session };
}
