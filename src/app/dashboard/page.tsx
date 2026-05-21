import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ActivityTypeDisplay } from "@/components/activity-type-display";
import { getMyUpcomingRsvps } from "@/lib/event-participation";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import type { Locale } from "@/i18n/config";
import { getUpcomingEventsForDashboard } from "@/lib/upcoming-events";
import { siteMainClass } from "@/lib/layout";
import { getSiteUrl } from "@/lib/site-url";

import { listMyCommunityIdeas } from "./idea-box-actions";
import { IdeaBoxSection } from "./idea-box-section";
import { ShareUrlButton } from "./share-url-button";

export const metadata: Metadata = {
  title: "Dashboard",
};

function formatWhen(d: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
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

  const locale = await getLocale();
  const dict = getDictionary(locale);

  const firstName = session.user.name?.split(/\s+/)[0] ?? "there";

  const upcoming = await getUpcomingEventsForDashboard({
    userId: session.user.id,
    email: session.user.email,
  });
  const myRsvps = await getMyUpcomingRsvps(session.user.id);
  const myIdeas = await listMyCommunityIdeas(session.user.id);
  const siteOrigin = getSiteUrl();
  const d = dict.dashboard;

  return (
    <main className={siteMainClass}>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {d.hi}, {firstName}
      </h1>
      <p className="mt-2 text-zinc-600">{d.homeBase}</p>

      <div className="mt-10 space-y-6">
        <section
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
          aria-labelledby="rsvp-heading"
        >
          <h2 id="rsvp-heading" className="text-lg font-medium text-zinc-900">
            {d.yourSignups}
          </h2>
          {myRsvps.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600">{d.noSignups}</p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-100">
              {myRsvps.map((r) => (
                <li
                  key={r.eventId}
                  className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{r.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatWhen(new Date(r.startsAt), locale)} ·{" "}
                      {r.status === "waitlisted"
                        ? d.waitlisted
                        : r.status === "pending"
                          ? d.pending
                          : d.going}
                    </p>
                  </div>
                  <Link
                    href={`/e/${r.shareSlug}`}
                    prefetch={false}
                    className="inline-flex shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                  >
                    {d.viewActivity}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
          aria-labelledby="upcoming-heading"
        >
          <h2 id="upcoming-heading" className="text-lg font-medium text-zinc-900">
            {d.upcomingActivities}
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600">{d.noUpcoming}</p>
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
                          {d.noImage}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-900">{e.title}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {formatWhen(new Date(e.startsAt), locale)} ·{" "}
                          <ActivityTypeDisplay
                            activityType={e.activityType}
                            activityTypeEmoji={e.activityTypeEmoji}
                            className="inline"
                          />{" "}
                          · {e.visibility.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                      <ShareUrlButton
                        url={shareUrl}
                        label={`${d.copyShareLink} ${e.title}`}
                        shareLabel={d.share}
                        copiedLabel={d.copied}
                      />
                      <Link
                        href={`/e/${e.shareSlug}`}
                        prefetch={false}
                        className="inline-flex rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                      >
                        {d.viewEvent}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <IdeaBoxSection copy={dict.ideaBox} ideas={myIdeas} locale={locale} />
      </div>
    </main>
  );
}
