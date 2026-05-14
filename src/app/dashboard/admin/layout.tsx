import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/platform-admin";

export default async function AdminSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id || !session.user.email) {
    redirect("/login");
  }

  const allowed = await isPlatformAdmin(session.user.id, session.user.email);
  if (!allowed) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
