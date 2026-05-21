import type { Locale } from "@/i18n/config";
import type { EventStatsCopy } from "@/i18n/messages/event-stats";
import {
  fetchEventRegistrationResponseData,
  type ChoiceBucket,
  type EventRegistrationResponseData,
  type QuestionAggregate,
} from "@/lib/event-registration-stats";
import { cn } from "@/lib/utils";

import { RegistrationResponsesTable } from "./registration-responses-table";

type Props = {
  eventId: string;
  copy: EventStatsCopy;
  locale: Locale;
  className?: string;
};

function ChoiceBars({
  buckets,
  total,
}: {
  buckets: ChoiceBucket[];
  total: number;
}) {
  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="mt-3 space-y-2">
      {buckets.map((row) => {
        const pct = total > 0 ? Math.round((100 * row.count) / total) : 0;
        return (
          <div key={row.key} className="flex items-center gap-3 text-sm">
            <span className="w-28 shrink-0 text-zinc-600">{row.label}</span>
            <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-violet-600"
                style={{ width: `${(100 * row.count) / max}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right tabular-nums text-zinc-900">
              {row.count}
              <span className="text-zinc-500"> ({pct}%)</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function NumberSummary({
  agg,
  copy,
  locale,
}: {
  agg: Extract<QuestionAggregate, { kind: "number" }>;
  copy: EventStatsCopy;
  locale: Locale;
}) {
  const fmt = new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    maximumFractionDigits: 2,
  });

  if (agg.count === 0) {
    return <p className="mt-2 text-sm text-zinc-500">{copy.numberStatsEmpty}</p>;
  }

  return (
    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
      <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2">
        <dt className="text-xs text-zinc-500">{copy.numberResponses}</dt>
        <dd className="font-semibold tabular-nums text-zinc-900">{agg.count}</dd>
      </div>
      {agg.avg != null ? (
        <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2">
          <dt className="text-xs text-zinc-500">{copy.numberAverage}</dt>
          <dd className="font-semibold tabular-nums text-zinc-900">{fmt.format(agg.avg)}</dd>
        </div>
      ) : null}
      {agg.min != null && agg.max != null ? (
        <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2">
          <dt className="text-xs text-zinc-500">{copy.numberRange}</dt>
          <dd className="font-semibold tabular-nums text-zinc-900">
            {fmt.format(agg.min)} – {fmt.format(agg.max)}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

function QuestionStatsBlock({
  data,
  copy,
  locale,
}: {
  data: EventRegistrationResponseData;
  copy: EventStatsCopy;
  locale: Locale;
}) {
  const aggById = new Map(data.aggregates.map((a) => [a.questionId, a]));

  return (
    <div className="space-y-8">
      {data.questions.map((q) => {
        const agg = aggById.get(q.id);
        if (!agg) return null;

        return (
          <div
            key={q.id}
            className="rounded-md border border-zinc-100 bg-zinc-50/50 p-4"
          >
            <h4 className="text-sm font-semibold text-zinc-900">{q.label}</h4>
            {agg.kind === "choice" ? (
              agg.total === 0 ? (
                <p className="mt-2 text-sm text-zinc-500">{copy.choiceStatsEmpty}</p>
              ) : (
                <ChoiceBars buckets={agg.buckets} total={agg.total} />
              )
            ) : agg.kind === "number" ? (
              <NumberSummary agg={agg} copy={copy} locale={locale} />
            ) : (
              <p className="mt-2 text-sm text-zinc-600">
                {copy.textResponseCount.replace("{count}", String(agg.count))}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export async function RegistrationAnswerInsights({
  eventId,
  copy,
  locale,
  className,
}: Props) {
  const displayLabels = {
    yes: copy.answerYes,
    no: copy.answerNo,
    checked: copy.answerChecked,
    unchecked: copy.answerUnchecked,
  };

  let data: EventRegistrationResponseData | null = null;
  let loadError: string | null = null;
  try {
    data = await fetchEventRegistrationResponseData(eventId, displayLabels);
  } catch (err) {
    console.error("[RegistrationAnswerInsights]", err);
    loadError = copy.registrationStatsLoadError;
  }
  if (!data && !loadError) return null;

  return (
    <div className={cn("mt-8 border-t border-zinc-200 pt-8", className)}>
      <h3 className="text-sm font-semibold text-zinc-900">{copy.registrationStatsHeading}</h3>
      <p className="mt-1 text-sm text-zinc-600">{copy.registrationStatsIntro}</p>

      {loadError ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {loadError}
        </p>
      ) : null}

      {data ? (
        <>
          <div className="mt-6">
            <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {copy.registrationChartsHeading}
            </h4>
            <p className="mt-1 text-xs text-zinc-500">{copy.registrationChartsHint}</p>
            <div className="mt-4">
              <QuestionStatsBlock data={data} copy={copy} locale={locale} />
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {copy.responsesTableHeading}
            </h4>
            <p className="mt-1 text-xs text-zinc-500">{copy.responsesTableHint}</p>
            <RegistrationResponsesTable eventId={eventId} data={data} copy={copy} />
          </div>
        </>
      ) : null}
    </div>
  );
}
