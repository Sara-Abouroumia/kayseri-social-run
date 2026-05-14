import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getUpcomingEventsForDashboard } from "@/lib/upcoming-events";
import { getSiteUrl } from "@/lib/site-url";

import { ShareUrlButton } from "./share-url-button";

export const metadata: Metadata = {
  title: "Dashboard",
};

function formatWhen(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const firstName = session.user.name?.split(/\s+/)[0] ?? "there";
  const upcoming = await getUpcomingEventsForDashboard({
    userId: session.user.id,
    email: session.user.email,
  });
  const siteOrigin = getSiteUrl();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Hi, {firstName}
      </h1>
      <p className="mt-2 text-zinc-600">
        This is your home base for club runs and meetups. More tools will land
        here as we build the MVP.
      </p>

      <div className="mt-10 space-y-6">
        <section
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
          aria-labelledby="upcoming-heading"
        >
          <h2 id="upcoming-heading" className="text-lg font-medium text-zinc-900">
            Upcoming activities
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600">
              No upcoming published activities yet. When admins add events, they
              appear here with a link to share and preview.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-100">
              {upcoming.map((e) => {
                const shareUrl = `${siteOrigin}/e/${e.shareSlug}`;
                return (
                  <li
                    key={e.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 gap-3">
                      {e.coverImageUrl ? (
                        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded border border-zinc-200 bg-zinc-100">
                          <Image
                            src={e.coverImageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="96px"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div
                          className="flex h-16 w-24 shrink-0 items-center justify-center rounded border border-dashed border-zinc-200 bg-zinc-50 text-xs text-zinc-400"
                          aria-hidden
                        >
                          No image
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-900">{e.title}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {formatWhen(new Date(e.startsAt))} · {e.activityType} ·{" "}
                          {e.visibility.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                      <ShareUrlButton
                        url={shareUrl}
                        label={`Copy share link for ${e.title}`}
                      />
                      <Link
                        href={`/e/${e.shareSlug}`}
                        prefetch={false}
                        className="inline-flex rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                      >
                        View event
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 text-xs text-zinc-500">
            RSVP and join flows will plug in here next.
          </p>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <section
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
            aria-labelledby="club-heading"
          >
            <h2 id="club-heading" className="text-lg font-medium text-zinc-900">
              Your club
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              A public club profile and member directory will live here (Kayseri
              Runners first, then reusable for other clubs).
            </p>
            <p className="mt-4 text-xs text-zinc-500">
              Next: club page + roles (member / coordinator / admin).
            </p>
          </section>

          <section
            className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 p-6"
            aria-labelledby="coord-heading"
          >
            <h2 id="coord-heading" className="text-lg font-medium text-zinc-900">
              Coordinators
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Create runs, see who is coming, and share meeting points. That flow is
              not wired yet.
            </p>
            <p className="mt-4 text-xs text-zinc-500">
              Next: participant list and map pin (see{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700">
                docs/APP.md
              </code>
              ).
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
