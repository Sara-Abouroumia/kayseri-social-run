"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { ShareUrlButton } from "@/app/dashboard/share-url-button";
import { ActivityTypeDisplay } from "@/components/activity-type-display";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages/en";

import { DeleteEventDialog } from "./delete-event-dialog";

type FormCopy = Messages["adminEventForm"];

export type AdminEventRow = {
  id: string;
  title: string;
  shareSlug: string;
  startsAt: Date;
  visibility: string;
  coverImageUrl: string | null;
  activityType: string;
  activityTypeEmoji: string | null;
};

type AdminEventsViewProps = {
  upcoming: AdminEventRow[];
  past: AdminEventRow[];
  siteOrigin: string;
  locale: Locale;
  copy: FormCopy;
  copyShareLinkLabel: string;
  shareLabel: string;
  copiedLabel: string;
  header: ReactNode;
};

function formatWhen(d: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatVisibility(visibility: string) {
  return visibility.replaceAll("_", " ");
}

function EventCard({
  event: e,
  siteOrigin,
  locale,
  copy,
  archived,
  copyShareLinkLabel,
  shareLabel,
  copiedLabel,
}: {
  event: AdminEventRow;
  siteOrigin: string;
  locale: Locale;
  copy: FormCopy;
  archived?: boolean;
  copyShareLinkLabel: string;
  shareLabel: string;
  copiedLabel: string;
}) {
  const shareUrl = `${siteOrigin}/e/${e.shareSlug}`;
  const editHref = `/dashboard/admin/events/${e.id}/edit`;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <Link
        href={`/e/${e.shareSlug}`}
        prefetch={false}
        className="group relative block aspect-[3/2] overflow-hidden bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200"
      >
        {e.coverImageUrl ? (
          <Image
            src={e.coverImageUrl}
            alt=""
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-xs font-medium uppercase tracking-wide text-zinc-400"
            aria-hidden
          >
            {copy.noCover}
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5"
          aria-hidden
        />
        {archived ? (
          <span className="absolute left-3 top-3 rounded-full bg-zinc-900/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            {copy.pastBadge}
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3 pt-14">
          <p className="line-clamp-2 text-base font-semibold leading-snug text-white drop-shadow-sm">
            {e.title}
          </p>
          <p className="text-xs font-medium text-white/90 drop-shadow-sm">
            {formatWhen(e.startsAt, locale)}
          </p>
          <p className="text-xs text-white/85 drop-shadow-sm">
            <ActivityTypeDisplay
              activityType={e.activityType}
              activityTypeEmoji={e.activityTypeEmoji}
              className="inline text-white/85"
            />
          </p>
          <span className="inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/90 backdrop-blur-sm capitalize">
            {formatVisibility(e.visibility)}
          </span>
        </div>
      </Link>

      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 bg-white p-3">
        <ShareUrlButton
          url={shareUrl}
          label={`${copyShareLinkLabel} ${e.title}`}
          shareLabel={shareLabel}
          copiedLabel={copiedLabel}
        />
        <Link
          href={`/e/${e.shareSlug}`}
          prefetch={false}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          {copy.view}
        </Link>
        <Link
          href={editHref}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          {archived ? copy.details : copy.edit}
        </Link>
        <DeleteEventDialog eventId={e.id} title={e.title} copy={copy} />
      </div>
    </article>
  );
}

export function AdminEventsView({
  upcoming,
  past,
  siteOrigin,
  locale,
  copy,
  copyShareLinkLabel,
  shareLabel,
  copiedLabel,
  header,
}: AdminEventsViewProps) {
  const [view, setView] = useState<"upcoming" | "past">("upcoming");
  const showingPast = view === "past";
  const rows = showingPast ? past : upcoming;

  return (
    <>
      <div className="mb-8 space-y-6">
        <div>{header}</div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/admin/events/new"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {copy.newEvent}
          </Link>
          <button
            type="button"
            onClick={() => setView((v) => (v === "upcoming" ? "past" : "upcoming"))}
            className={
              showingPast
                ? "rounded-md border border-zinc-900 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900"
                : "rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            }
            aria-pressed={showingPast}
          >
            {showingPast ? copy.showUpcomingEvents : copy.showPastEvents}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
          {showingPast ? copy.pastSection : copy.upcomingSection}
          {rows.length > 0 ? (
            <span className="ml-2 font-normal normal-case text-zinc-400">
              ({rows.length})
            </span>
          ) : null}
        </p>

        {rows.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-600">
            {showingPast ? (
              copy.noPastEvents
            ) : (
              <>
                {copy.noUpcomingEvents}{" "}
                <Link href="/dashboard/admin/events/new" className="underline">
                  {copy.createOne}
                </Link>
                {past.length > 0 ? (
                  <>
                    {" "}
                    {copy.emptyOr}{" "}
                    <button
                      type="button"
                      className="underline"
                      onClick={() => setView("past")}
                    >
                      {copy.viewPastEvents}
                    </button>
                  </>
                ) : null}
                .
              </>
            )}
          </p>
        ) : (
          <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((e) => (
              <li key={e.id} className="min-w-0">
                <EventCard
                  event={e}
                  siteOrigin={siteOrigin}
                  locale={locale}
                  copy={copy}
                  archived={showingPast}
                  copyShareLinkLabel={copyShareLinkLabel}
                  shareLabel={shareLabel}
                  copiedLabel={copiedLabel}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
