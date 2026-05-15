import { headers } from "next/headers";

import { AppHeader } from "@/components/app-header";
import { AuthenticatedDashboardHeader } from "@/components/authenticated-dashboard-header";
import { auth } from "@/lib/auth";

export default async function PublicEventShareLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-white">
      {session?.user ? <AuthenticatedDashboardHeader /> : <AppHeader />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
