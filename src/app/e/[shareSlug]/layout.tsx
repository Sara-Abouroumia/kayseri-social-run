import { headers } from "next/headers";
import Link from "next/link";

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
    <>
      {session?.user ? (
        <div className="border-b border-zinc-200 bg-zinc-100 px-4 py-2.5 text-center text-sm text-zinc-800">
          <span className="text-zinc-600">Signed in as </span>
          <span className="font-medium text-zinc-900">{session.user.email}</span>
          <span className="text-zinc-500"> · </span>
          <Link
            href="/dashboard"
            className="font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-900"
          >
            Back to dashboard
          </Link>
        </div>
      ) : null}
      {children}
    </>
  );
}
