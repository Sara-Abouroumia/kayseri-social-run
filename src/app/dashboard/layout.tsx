import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/platform-admin";

import { DashboardHeader } from "./dashboard-header";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const displayName = user.name?.trim() || user.email;
  const userIsPlatformAdmin = await isPlatformAdmin(user.id, user.email);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="border-b border-zinc-100 bg-zinc-50/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-800">
            ← Home
          </Link>
          <span className="hidden sm:inline">Member area</span>
        </div>
      </div>

      <DashboardHeader
        email={user.email}
        displayName={displayName}
        isPlatformAdmin={userIsPlatformAdmin}
      />

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
