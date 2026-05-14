import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  isPlatformAdmin,
  listPlatformAdmins,
  parseBootstrapAdminEmails,
} from "@/lib/platform-admin";

import { AddAdminForm } from "./add-admin-form";
import { AdminList } from "./admin-list";

export const metadata: Metadata = {
  title: "System settings",
};

export default async function AdminSystemPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id || !session.user.email) {
    redirect("/login");
  }

  if (!(await isPlatformAdmin(session.user.id, session.user.email))) {
    redirect("/dashboard");
  }

  const admins = await listPlatformAdmins();
  const bootstrap = parseBootstrapAdminEmails();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
          System settings
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Add platform admins by email. If they already have an account, access is
          granted immediately. If not, we send an invitation to register; after they
          verify their email, admin access is applied automatically.
        </p>
      </div>

      <section
        className="mb-10 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
        aria-labelledby="events-heading"
      >
        <h2 id="events-heading" className="text-lg font-medium text-zinc-900">
          Published activities
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Create shareable links (Instagram, WhatsApp) with cover images. Visitors
          open the activity page; joining still requires an account on this site.
        </p>
        <div className="mt-4">
          <Link
            href="/dashboard/admin/events"
            className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Manage events
          </Link>
        </div>
      </section>

      {bootstrap.length > 0 ? (
        <p className="mb-8 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <strong>Bootstrap admins</strong> are also set via{" "}
          <code className="rounded bg-amber-100/80 px-1">PLATFORM_ADMIN_EMAILS</code>{" "}
          in the environment. Those accounts are always admins; remove them only by
          editing env, not from this list.
        </p>
      ) : (
        <p className="mb-8 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
          Optional: set{" "}
          <code className="rounded bg-white px-1">PLATFORM_ADMIN_EMAILS</code>{" "}
          (comma-separated) for break-glass admins that survive DB resets.
        </p>
      )}

      <section
        className="mb-10 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
        aria-labelledby="add-admin-heading"
      >
        <h2 id="add-admin-heading" className="text-lg font-medium text-zinc-900">
          Add admin by email
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          If the address already has an account, we grant admin right away. If
          not, we email an invitation with a registration link. Everyone must
          verify their email (link in inbox) before signing in; invited admins get
          admin rights right after verification.
        </p>
        <div className="mt-4">
          <AddAdminForm />
        </div>
      </section>

      <section aria-labelledby="admins-heading">
        <h2 id="admins-heading" className="text-lg font-medium text-zinc-900">
          Platform admins
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          {admins.length === 0
            ? "No admins found. Set PLATFORM_ADMIN_EMAILS or add one below."
            : `${admins.length} admin${admins.length === 1 ? "" : "s"}.`}
        </p>
        <div className="mt-4">
          <AdminList admins={admins} />
        </div>
      </section>

      <p className="mt-10 text-center text-sm text-zinc-500">
        <Link href="/dashboard" className="underline hover:text-zinc-800">
          ← Back to dashboard
        </Link>
      </p>
    </main>
  );
}
