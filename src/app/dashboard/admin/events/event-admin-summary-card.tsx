import Image from "next/image";
import Link from "next/link";

import { ActivityTypeDisplay } from "@/components/activity-type-display";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages/en";
import { getEventSchedulePhase } from "@/lib/event-schedule-phase";

type Copy = Messages["adminEventForm"];

export type EventAdminSummaryCardProps = {
  title: string;
  shareSlug: string;
  startsAt: Date;
  endsAt: Date | null;
  activityType: string;
  activityTypeEmoji: string | null;
  visibility: string;
  coverImageUrl: string | null;
  description: string | null;
  meetingPointName: string | null;
  coordinatorName: string | null;
  locale: Locale;
  copy: Copy;
  showPastBadge?: boolean;
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

export function EventAdminSummaryCard({
  title,
  shareSlug,
  startsAt,
  endsAt,
  activityType,
  activityTypeEmoji,
  visibility,
  coverImageUrl,
  description,
  meetingPointName,
  coordinatorName,
  locale,
  copy,
  showPastBadge,
}: EventAdminSummaryCardProps) {
  const phase = getEventSchedulePhase({ startsAt, endsAt }, new Date());
  const archived = showPastBadge ?? phase === "finished";
  const hasDetails =
    Boolean(description?.trim()) ||
    Boolean(meetingPointName?.trim()) ||
    Boolean(coordinatorName?.trim());

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={`/e/${shareSlug}`}
          prefetch={false}
          className="group relative block w-full shrink-0 overflow-hidden bg-zinc-100 sm:w-44 md:w-52"
        >
          <div className="relative aspect-[16/10] max-h-44 sm:aspect-[4/3] sm:max-h-none sm:min-h-[168px] sm:h-full">
            {coverImageUrl ? (
              <Image
                src={coverImageUrl}
                alt=""
                fill
                className="object-cover object-center transition duration-200 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, 208px"
                unoptimized
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 text-[10px] font-medium uppercase tracking-wide text-zinc-400"
                aria-hidden
              >
                {copy.noCover}
              </div>
            )}
            {archived ? (
              <span className="absolute left-2 top-2 rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                {copy.pastBadge}
              </span>
            ) : null}
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold leading-snug text-zinc-900 sm:text-xl">
              {title}
            </h2>
            <p className="text-sm text-zinc-600">
              {formatWhen(startsAt, locale)}
              {endsAt ? ` — ${formatWhen(endsAt, locale)}` : null}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
              <ActivityTypeDisplay
                activityType={activityType}
                activityTypeEmoji={activityTypeEmoji}
              />
              <span
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 capitalize"
                aria-label={copy.visibilityAria}
              >
                {formatVisibility(visibility)}
              </span>
            </div>
          </div>

          <Link
            href={`/e/${shareSlug}`}
            prefetch={false}
            className="text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900"
          >
            {copy.viewPublicPage}
          </Link>
        </div>
      </div>

      {hasDetails ? (
        <div className="space-y-2 border-t border-zinc-100 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-600 sm:px-5">
          {description?.trim() ? (
            <p className="line-clamp-4 whitespace-pre-wrap">{description.trim()}</p>
          ) : null}
          {meetingPointName?.trim() ? (
            <p>
              <span className="font-medium text-zinc-800">{copy.meetingPoint}:</span>{" "}
              {meetingPointName.trim()}
            </p>
          ) : null}
          {coordinatorName?.trim() ? (
            <p>
              <span className="font-medium text-zinc-800">{copy.coordinator}:</span>{" "}
              {coordinatorName.trim()}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
