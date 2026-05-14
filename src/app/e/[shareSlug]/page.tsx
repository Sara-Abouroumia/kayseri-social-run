import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { events } from "@/db/schema/events";
import { getSiteUrl } from "@/lib/site-url";

type Props = {
  params: Promise<{ shareSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareSlug } = await params;
  const row = await db
    .select({ title: events.title })
    .from(events)
    .where(eq(events.shareSlug, shareSlug))
    .limit(1);
  if (!row[0]) return { title: "Activity not found" };
  return {
    title: row[0].title,
    description: `Activity on Kayseri Social Run — ${row[0].title}`,
  };
}

function formatWhen(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export default async function PublicEventPage({ params }: Props) {
  const { shareSlug } = await params;
  const row = await db.select().from(events).where(eq(events.shareSlug, shareSlug)).limit(1);
  if (!row[0]) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-zinc-900">Activity not found</h1>
        <p className="mt-2 text-sm text-zinc-600">
          This link may be wrong or the activity was removed.
        </p>
        <p className="mt-8">
          <Link href="/" className="text-sm font-medium text-zinc-900 underline">
            Home
          </Link>
        </p>
      </main>
    );
  }

  const e = row[0];
  const site = getSiteUrl();
  const registerHref = `/register?next=${encodeURIComponent(`/e/${shareSlug}`)}`;
  const loginHref = `/login?next=${encodeURIComponent(`/e/${shareSlug}`)}`;

  if (e.visibility === "private") {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900">{e.title}</h1>
        <p className="mt-4 text-sm text-zinc-600">
          This activity is private. If you are a member, sign in to see details
          from your dashboard when that is available.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={registerHref}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Create account
          </Link>
          <Link
            href={loginHref}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  if (e.visibility === "members_only") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Kayseri Social Run
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900">{e.title}</h1>
        <p className="mt-2 text-sm text-amber-900">
          Members only — sign in to see the full description, meeting details, and
          to join when participation opens.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-zinc-700">
          <li>
            <span className="font-medium text-zinc-900">When:</span>{" "}
            {formatWhen(new Date(e.startsAt))}
          </li>
          <li>
            <span className="font-medium text-zinc-900">Type:</span> {e.activityType}
          </li>
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={registerHref}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Register to see more
          </Link>
          <Link
            href={loginHref}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-10 text-center text-xs text-zinc-500">
          <Link href="/" className="underline">
            Home
          </Link>
          {" · "}
          <span>{site}</span>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Kayseri Social Run
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-zinc-900">{e.title}</h1>
      <p className="mt-1 text-sm text-zinc-600">
        {formatWhen(new Date(e.startsAt))}
        {e.endsAt ? ` – ${formatWhen(new Date(e.endsAt))}` : null}
      </p>

      {e.coverImageUrl ? (
        <div className="relative mt-6 aspect-[2/1] w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
          <Image
            src={e.coverImageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            unoptimized
            priority
          />
        </div>
      ) : null}

      <div className="mt-8 max-w-none">
        {e.description ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
            {e.description}
          </p>
        ) : null}

        <dl className="mt-8 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-zinc-900">Activity type</dt>
            <dd className="text-zinc-700">{e.activityType}</dd>
          </div>
          {e.meetingPointName || e.meetingPointAddress ? (
            <div>
              <dt className="font-medium text-zinc-900">Meeting point</dt>
              <dd className="text-zinc-700">
                {e.meetingPointName ? <>{e.meetingPointName}</> : null}
                {e.meetingPointName && e.meetingPointAddress ? <br /> : null}
                {e.meetingPointAddress ? <>{e.meetingPointAddress}</> : null}
              </dd>
            </div>
          ) : null}
          {e.distanceKm ? (
            <div>
              <dt className="font-medium text-zinc-900">Distance</dt>
              <dd className="text-zinc-700">{String(e.distanceKm)} km</dd>
            </div>
          ) : null}
          {e.paceLabel ? (
            <div>
              <dt className="font-medium text-zinc-900">Pace</dt>
              <dd className="text-zinc-700">{e.paceLabel}</dd>
            </div>
          ) : null}
          {e.difficulty ? (
            <div>
              <dt className="font-medium text-zinc-900">Difficulty</dt>
              <dd className="text-zinc-700">{e.difficulty}</dd>
            </div>
          ) : null}
          {e.requiredItems ? (
            <div>
              <dt className="font-medium text-zinc-900">Required items</dt>
              <dd className="whitespace-pre-wrap text-zinc-700">{e.requiredItems}</dd>
            </div>
          ) : null}
          {e.coordinatorName ? (
            <div>
              <dt className="font-medium text-zinc-900">Coordinator</dt>
              <dd className="text-zinc-700">{e.coordinatorName}</dd>
            </div>
          ) : null}
          {e.maxParticipants != null ? (
            <div>
              <dt className="font-medium text-zinc-900">Max participants</dt>
              <dd className="text-zinc-700">{e.maxParticipants}</dd>
            </div>
          ) : null}
          {e.joinDeadlineAt ? (
            <div>
              <dt className="font-medium text-zinc-900">Join deadline</dt>
              <dd className="text-zinc-700">
                {formatWhen(new Date(e.joinDeadlineAt))}
              </dd>
            </div>
          ) : null}
          {e.weatherInfo ? (
            <div>
              <dt className="font-medium text-zinc-900">Weather / conditions</dt>
              <dd className="whitespace-pre-wrap text-zinc-700">{e.weatherInfo}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <section className="mt-10 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h2 className="text-sm font-semibold text-zinc-900">Want to join?</h2>
        <p className="mt-1 text-sm text-zinc-600">
          RSVPs and participation tracking happen on this site. Create an account
          (and verify your email) to sign up when that flow is enabled.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={registerHref}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Register
          </Link>
          <Link
            href={loginHref}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Sign in
          </Link>
        </div>
      </section>

      <p className="mt-10 text-center text-xs text-zinc-500">
        <Link href="/" className="underline">
          Home
        </Link>
        {" · "}
        <span>{site}</span>
      </p>
    </main>
  );
}
