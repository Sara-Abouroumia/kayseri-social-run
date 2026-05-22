import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { siteMainClass } from "@/lib/layout";
import { isPlatformAdmin } from "@/lib/platform-admin";
import {
  isPlatformDeveloper,
  parseBootstrapDeveloperEmails,
} from "@/lib/platform-developer";

import { countUnreadCommunityIdeasForAdmin } from "@/app/dashboard/idea-box-actions";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { listRegisteredUsersForAdmin } from "@/lib/registered-users";

import { AddAdminForm } from "./add-admin-form";
import { RegisteredUsersPanel } from "./registered-users-panel";

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

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const ideaBox = dict.ideaBox;
  const systemCopy = dict.systemAdmin;

  const registeredUsers = await listRegisteredUsersForAdmin();
  const isDeveloper = await isPlatformDeveloper(
    session.user.id,
    session.user.email,
  );
  const bootstrapDevelopers = parseBootstrapDeveloperEmails();
  const unreadIdeas = await countUnreadCommunityIdeasForAdmin(session.user.id);

  return (
    <main className={siteMainClass}>
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

      {isDeveloper ? (
        <section className="mb-10 rounded-lg border border-violet-200 bg-violet-50/80 p-6 shadow-sm">
          <h2 className="text-lg font-medium text-zinc-900">
            {dict.developerAnalytics.title}
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {dict.developerAnalytics.subtitle}
          </p>
          <div className="mt-4">
            <Link
              href="/dashboard/admin/developer/analytics"
              className="inline-flex rounded-md bg-violet-900 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800"
            >
              {dict.nav.developerUsage}
            </Link>
          </div>
        </section>
      ) : null}

      <div className="mb-10 flex flex-wrap items-stretch gap-6">
        <section
          className="min-w-[min(100%,17rem)] flex-1 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
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

        <section
          className="min-w-[min(100%,17rem)] flex-1 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
          aria-labelledby="ideas-heading"
        >
          <h2 id="ideas-heading" className="text-lg font-medium text-zinc-900">
            {ideaBox.systemIdeasHeading}
          </h2>
          <p className="mt-1 text-sm text-zinc-600">{ideaBox.systemIdeasBlurb}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/admin/ideas"
              className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              {ideaBox.openIdeaBox}
            </Link>
            {unreadIdeas > 0 ? (
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                {unreadIdeas}
              </span>
            ) : null}
          </div>
        </section>
      </div>

      {isDeveloper ? (
        bootstrapDevelopers.length > 0 ? (
          <p className="mb-8 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <strong>Bootstrap developers</strong> are set via{" "}
            <code className="rounded bg-amber-100/80 px-1">
              PLATFORM_DEVELOPER_EMAILS
            </code>{" "}
            in the environment. Those accounts are always admins; remove them only
            by editing env, not from this list.
          </p>
        ) : (
          <p className="mb-8 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            Optional: set{" "}
            <code className="rounded bg-white px-1">PLATFORM_DEVELOPER_EMAILS</code>{" "}
            (comma-separated) for break-glass developers that survive DB resets.
          </p>
        )
      ) : null}

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

      <section aria-labelledby="registered-users-heading">
        <h2
          id="registered-users-heading"
          className="text-lg font-medium text-zinc-900"
        >
          {systemCopy.registeredUsersHeading}
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          {systemCopy.registeredUsersIntro}
        </p>
        <div className="mt-4">
          <RegisteredUsersPanel
            users={registeredUsers}
            copy={systemCopy}
            locale={locale}
            currentUserId={session.user.id}
          />
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

