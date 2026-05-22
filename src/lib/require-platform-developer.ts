import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isPlatformDeveloper } from "@/lib/platform-developer";

export async function requirePlatformDeveloper() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id || !session.user.email) {
    redirect("/login?next=/dashboard/admin/developer/analytics");
  }

  const allowed = await isPlatformDeveloper(
    session.user.id,
    session.user.email,
  );
  if (!allowed) {
    redirect("/dashboard");
  }

  return session;
}
