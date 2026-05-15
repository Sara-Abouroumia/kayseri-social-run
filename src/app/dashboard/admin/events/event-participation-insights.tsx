import {
  getGoingCount,
  getGoingGenderBreakdown,
  getGoingSignupsByDay,
  listGoingParticipantsForAdmin,
  listPendingParticipantsForAdmin,
  listWaitlistedParticipantsForAdmin,
} from "@/lib/event-participation";

import { PendingParticipantsPanel } from "./pending-participants-panel";

type Props = {
  eventId: string;
};

function GenderBars(props: {
  breakdown: Awaited<ReturnType<typeof getGoingGenderBreakdown>>;
}) {
  const { breakdown } = props;
  const entries = [
    { label: "Female", value: breakdown.female, color: "bg-rose-500" },
    { label: "Male", value: breakdown.male, color: "bg-sky-600" },
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

function CumulativeChart(props: { points: Awaited<ReturnType<typeof getGoingSignupsByDay>> }) {
  const { points } = props;
  if (points.length === 0) {
    return <p className="mt-2 text-sm text-zinc-500">No sign-ups yet.</p>;
  }
  const maxY = Math.max(1, ...points.map((p) => p.count));
  const h = 120;

  return (
    <div className="mt-4">
      <svg
        viewBox={`0 0 ${Math.max(240, points.length * 36)} ${h + 24}`}
        className="w-full text-zinc-900"
        role="img"
        aria-label="Cumulative sign-ups over time"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-zinc-900"
          points={points
            .map((p, i) => {
              const x = 8 + i * 36;
              const y = h - 4 - ((h - 8) * p.count) / maxY;
              return `${x},${y}`;
            })
            .join(" ")}
        />
        {points.map((p, i) => {
          const x = 8 + i * 36;
          const y = h - 4 - ((h - 8) * p.count) / maxY;
          return <circle key={p.day} cx={x} cy={y} r="3" className="fill-zinc-900" />;
        })}
        {points.map((p, i) => {
          const x = 8 + i * 36;
          return (
            <text
              key={`${p.day}-label`}
              x={x}
              y={h + 14}
              textAnchor="middle"
              className="fill-zinc-500 text-[9px]"
            >
              {p.day.slice(5)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export async function EventParticipationInsights({ eventId }: Props) {
  const [goingCount, waitlisted, pending, breakdown, timeline, goingRows] = await Promise.all([
    getGoingCount(eventId),
    listWaitlistedParticipantsForAdmin(eventId),
    listPendingParticipantsForAdmin(eventId),
    getGoingGenderBreakdown(eventId),
    getGoingSignupsByDay(eventId),
    listGoingParticipantsForAdmin(eventId),
  ]);

  const f = breakdown.female;
  const m = breakdown.male;
  const fmDenom = f + m;
  const femalePct = fmDenom ? Math.round((100 * f) / fmDenom) : null;
  const malePct = fmDenom ? Math.round((100 * m) / fmDenom) : null;

  return (
    <section
      className="mt-10 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
      aria-labelledby="insights-heading"
    >
      <h2 id="insights-heading" className="text-lg font-medium text-zinc-900">
        Sign-ups &amp; insights
      </h2>
      <p className="mt-2 text-sm text-zinc-600">
        Going and waitlisted participants for this activity, plus self-reported gender
        breakdown among people who signed up.
      </p>

      <PendingParticipantsPanel
        eventId={eventId}
        rows={pending.map((r) => ({
          participantId: r.participantId,
          name: r.name,
          email: r.email,
        }))}
      />

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-zinc-100 bg-zinc-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Signed up (going)
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">{goingCount}</dd>
        </div>
        <div className="rounded-md border border-zinc-100 bg-zinc-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Waitlist</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {waitlisted.length}
          </dd>
        </div>
        <div className="rounded-md border border-amber-100 bg-amber-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-amber-800">
            Pending
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {pending.length}
          </dd>
        </div>
      </dl>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-zinc-900">Gender (going)</h3>
        {femalePct != null && malePct != null && fmDenom > 0 ? (
          <p className="mt-1 text-sm text-zinc-600">
            <span className="font-medium text-zinc-900">{femalePct}% female</span> ·{" "}
            <span className="font-medium text-zinc-900">{malePct}% male</span>
            <span className="text-zinc-500"> (among signed-up participants)</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-zinc-500">
            Not enough sign-ups yet to show a female/male split.
          </p>
        )}
        <GenderBars breakdown={breakdown} />
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-zinc-900">Cumulative sign-ups</h3>
        <p className="mt-1 text-xs text-zinc-500">By calendar day (UTC) when each person joined.</p>
        <CumulativeChart points={timeline} />
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-zinc-900">Participant list (going)</h3>
        {goingRows.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No one has signed up yet.</p>
        ) : (
          <ul className="mt-3 max-h-56 divide-y divide-zinc-100 overflow-y-auto rounded-md border border-zinc-200 text-sm">
            {goingRows.map((r) => (
              <li key={r.userId} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2">
                <span className="font-medium text-zinc-900">{r.name}</span>
                <span className="text-xs text-zinc-500">{r.email}</span>
                <span className="text-xs text-zinc-500">{String(r.gender).replace(/_/g, " ")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {waitlisted.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-zinc-900">Waitlist (order)</h3>
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
    </section>
  );
}
