import type { Metadata } from "next";
import Link from "next/link";

import { siteMainClass } from "@/lib/layout";
import { getSiteUrl } from "@/lib/site-url";

import { EventForm } from "../event-form";

export const metadata: Metadata = {
  title: "New event — Admin",
};

export default function NewEventPage() {
  const siteOrigin = getSiteUrl();

  return (
    <main className={siteMainClass}>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">New event</h1>
        <p className="mt-2 text-sm text-zinc-600">
          After you save, you get a stable share link for social posts.
        </p>
      </div>

      <EventForm mode="create" siteOrigin={siteOrigin} />

      <p className="mt-10 text-center text-sm text-zinc-500">
        <Link href="/dashboard/admin/events" className="underline hover:text-zinc-800">
          ← All events
        </Link>
      </p>
    </main>
  );
}
