import {
  getGoingCount,
  getGoingGenderBreakdown,
  // getGoingSignupsByDay,
  listGoingParticipantsForAdmin,
  listPendingParticipantsForAdmin,
  listWaitlistedParticipantsForAdmin,
} from "@/lib/event-participation";
import type { Locale } from "@/i18n/config";
import type { EventStatsCopy } from "@/i18n/messages/event-stats";
import { cn } from "@/lib/utils";

import { PendingParticipantsPanel } from "./pending-participants-panel";
import { RegistrationAnswerInsights } from "./registration-answer-insights";

type Props = {
  eventId: string;
  className?: string;
  /** `card` = bordered panel (admin edit). `plain` = flows with the public event page. */
  variant?: "card" | "plain";
  copy: EventStatsCopy;
  locale: Locale;
};

function GenderBars(props: {
  breakdown: Awaited<ReturnType<typeof getGoingGenderBreakdown>>;
  copy: EventStatsCopy;
}) {
  const { breakdown, copy } = props;
  const entries = [
    { label: copy.genderBarFemale, value: breakdown.female, color: "bg-pink-500" },
    { label: copy.genderBarMale, value: breakdown.male, color: "bg-blue-600" },
  ];
  const max = Math.max(1, ...entries.map((e) => e.value));

  return (
    <div className="mt-4 space-y-2">
      {entries.map((row) => (
        <div key={row.label} className="flex items-center gap-3 text-sm">
          <span className="w-36 shrink-0 text-zinc-600">{row.label}</span>
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full rounded-full ${row.color}`}
              style={{ width: `${(100 * row.value) / max}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right font-medium tabular-nums text-zinc-900">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* Cumulative sign-ups chart — disabled for now
function formatDayLabel(isoDay: string, locale: Locale) {
  const d = new Date(`${isoDay}T12:00:00Z`);
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    month: "numeric",
    day: "numeric",
  }).format(d);
}

function CumulativeScatterChart(props: {
  points: Awaited<ReturnType<typeof getGoingSignupsByDay>>;
  copy: EventStatsCopy;
  locale: Locale;
}) {
  ...
}
*/

function genderLabel(copy: EventStatsCopy, gender: string) {
  if (gender === "female") return copy.genderBarFemale;
  if (gender === "male") return copy.genderBarMale;
  return gender.replace(/_/g, " ");
}

export async function EventParticipationInsights({
  eventId,
  className,
  variant = "card",
  copy,
  locale,
}: Props) {
  const sectionClass = cn(
    variant === "card" && (className ?? "mt-0"),
    variant === "card" && "rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6",
    variant === "plain" && (className ?? "mt-6"),
    variant === "plain" && "space-y-8",
  );
  const [goingCount, waitlisted, pending, breakdown, goingRows] = await Promise.all([
    getGoingCount(eventId),
    listWaitlistedParticipantsForAdmin(eventId),
    listPendingParticipantsForAdmin(eventId),
    getGoingGenderBreakdown(eventId),
    // getGoingSignupsByDay(eventId),
    listGoingParticipantsForAdmin(eventId),
  ]);

  const f = breakdown.female;
  const m = breakdown.male;
  const fmDenom = f + m;
  const femalePct = fmDenom ? Math.round((100 * f) / fmDenom) : null;
  const malePct = fmDenom ? Math.round((100 * m) / fmDenom) : null;

  return (
    <section className={sectionClass} aria-labelledby="insights-heading">
      <div className={variant === "plain" ? "sr-only" : undefined}>
        <h2 id="insights-heading" className="text-lg font-medium text-zinc-900">
          {copy.heading}
        </h2>
        <p className="mt-2 text-sm text-zinc-600">{copy.intro}</p>
      </div>

      <PendingParticipantsPanel
        eventId={eventId}
        rows={pending.map((r) => ({
          participantId: r.participantId,
          name: r.name,
          email: r.email,
        }))}
        copy={copy}
      />

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-zinc-100 bg-zinc-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {copy.signedUpGoing}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">{goingCount}</dd>
        </div>
        <div className="rounded-md border border-zinc-100 bg-zinc-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {copy.waitlist}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {waitlisted.length}
          </dd>
        </div>
        <div className="rounded-md border border-amber-100 bg-amber-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-amber-800">
            {copy.pending}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {pending.length}
          </dd>
        </div>
      </dl>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-zinc-900">{copy.genderHeading}</h3>
        {femalePct != null && malePct != null && fmDenom > 0 ? (
          <p className="mt-1 text-sm text-zinc-600">
            <span className="font-medium text-zinc-900">
              {copy.genderSplit
                .replace("{femalePct}", String(femalePct))
                .replace("{malePct}", String(malePct))
                .replace("{femaleLabel}", copy.femaleLabel)
                .replace("{maleLabel}", copy.maleLabel)}
            </span>
            <span className="text-zinc-500"> {copy.genderSplitNote}</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-zinc-500">{copy.genderSplitEmpty}</p>
        )}
        <GenderBars breakdown={breakdown} copy={copy} />
      </div>

      {/* Cumulative sign-ups — disabled for now
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-zinc-900">{copy.cumulativeHeading}</h3>
        <p className="mt-1 text-xs text-zinc-500">{copy.cumulativeHint}</p>
        <CumulativeScatterChart points={timeline} copy={copy} locale={locale} />
      </div>
      */}

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-zinc-900">{copy.participantListHeading}</h3>
        {goingRows.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">{copy.participantListEmpty}</p>
        ) : (
          <ul className="mt-3 max-h-56 divide-y divide-zinc-100 overflow-y-auto rounded-md border border-zinc-200 text-sm">
            {goingRows.map((r) => (
              <li
                key={r.userId}
                className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2"
              >
                <span className="font-medium text-zinc-900">{r.name}</span>
                <span className="text-xs text-zinc-500">{r.email}</span>
                <span className="text-xs text-zinc-500">{genderLabel(copy, String(r.gender))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {waitlisted.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-zinc-900">{copy.waitlistHeading}</h3>
          <ol className="mt-3 max-h-40 list-decimal divide-y divide-zinc-100 overflow-y-auto rounded-md border border-zinc-200 pl-8 pr-3 text-sm">
            {waitlisted.map((r) => (
              <li key={r.userId} className="py-2">
                <span className="font-medium text-zinc-900">{r.name}</span>
                <span className="text-zinc-500"> — {r.email}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <RegistrationAnswerInsights eventId={eventId} copy={copy} locale={locale} />
    </section>
  );
}
