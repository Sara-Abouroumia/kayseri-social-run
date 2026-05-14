import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";

import { db } from "@/db";
import { events } from "@/db/schema/events";
import { getSiteUrl } from "@/lib/site-url";

import { ShareUrlButton } from "@/app/dashboard/share-url-button";

import { DeleteEventDialog } from "./delete-event-dialog";

export const metadata: Metadata = {
  title: "Events — Admin",
};

function formatWhen(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function AdminEventsPage() {
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      shareSlug: events.shareSlug,
      startsAt: events.startsAt,
      visibility: events.visibility,
    })
    .from(events)
    .orderBy(desc(events.startsAt));

  const siteOrigin = getSiteUrl();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900">Events</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Create activities, copy a share link for Instagram or WhatsApp, and
            manage details. Visitors can open the link; joining the club still
            happens on this site.
          </p>
        </div>
        <Link
          href="/dashboard/admin/events/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          New event
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600">
          No events yet.{" "}
          <Link href="/dashboard/admin/events/new" className="underline">
            Create the first one
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white shadow-sm">
          {rows.map((e) => (
            <li
              key={e.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900">{e.title}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {formatWhen(new Date(e.startsAt))} · {e.visibility.replace("_", " ")}
                </p>
                <p className="mt-1 truncate text-xs text-zinc-500">
                  <span className="font-medium text-zinc-600">Share:</span>{" "}
                  {siteOrigin}/e/{e.shareSlug}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
                <ShareUrlButton
                  url={`${siteOrigin}/e/${e.shareSlug}`}
                  label={`Copy share link for ${e.title}`}
                />
                <Link
                  href={`/e/${e.shareSlug}`}
                  prefetch={false}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                >
                  View event
                </Link>
                <Link
                  href={`/dashboard/admin/events/${e.id}/edit`}
                  className="text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900"
                >
                  Edit
                </Link>
                <DeleteEventDialog eventId={e.id} title={e.title} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 text-center text-sm text-zinc-500">
        <Link href="/dashboard/admin/system" className="underline hover:text-zinc-800">
          ← System settings
        </Link>
        {" · "}
        <Link href="/dashboard" className="underline hover:text-zinc-800">
          Dashboard
        </Link>
      </p>
    </main>
  );
}
