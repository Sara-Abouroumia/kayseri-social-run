"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

type DashboardHeaderProps = {
  email: string;
  displayName: string;
  isPlatformAdmin: boolean;
};

export function DashboardHeader({
  email,
  displayName,
  isPlatformAdmin,
}: DashboardHeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <Image
              src="/kayserisocialrun_logo.png"
              alt="Kayseri Social Run"
              width={160}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right text-sm sm:block">
              <p className="truncate font-medium text-zinc-900">{displayName}</p>
              <p className="truncate text-zinc-500">{email}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="shrink-0 rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              Sign out
            </button>
          </div>
        </div>

        <nav
          className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-zinc-100 pt-3 text-sm font-medium text-zinc-700"
          aria-label="Dashboard"
        >
          <Link
            href="/dashboard"
            className="text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
          >
            Dashboard
          </Link>
          {isPlatformAdmin ? (
            <>
              <Link
                href="/dashboard/admin/events"
                className="text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
              >
                Events
              </Link>
              <Link
                href="/dashboard/admin/system"
                className="text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
              >
                System settings
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
