import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AuthenticatedDashboardHeader } from "@/components/authenticated-dashboard-header";
import { auth } from "@/lib/auth";

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

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-white">
      <AuthenticatedDashboardHeader />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
