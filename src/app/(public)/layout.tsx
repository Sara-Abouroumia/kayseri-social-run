import { headers } from "next/headers";

import { AuthenticatedDashboardHeader } from "@/components/authenticated-dashboard-header";
import { LandingNav } from "@/components/site-page/landing-nav";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const loggedIn = Boolean(session?.user);

  return (
    <div
      className={cn(
        "ksr-public-shell flex min-w-0 flex-col",
        loggedIn && "ksr-public-shell--auth",
      )}
    >
      {loggedIn ? <AuthenticatedDashboardHeader /> : <LandingNav />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
