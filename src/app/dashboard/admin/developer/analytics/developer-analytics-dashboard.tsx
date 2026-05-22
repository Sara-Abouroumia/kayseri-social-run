import Link from "next/link";
import type { ReactNode } from "react";

import type { DeveloperAnalyticsCopy } from "@/i18n/messages/developer-analytics";
import type {
  LocationMapPoint,
  RecentPageViewRow,
  TopLocationRow,
  TopPageRow,
  UsageOverview,
} from "@/lib/usage-analytics";
import { cn } from "@/lib/utils";

import { formatDuration, formatWhen } from "./analytics-format";
import { UsageVisitorMap } from "./usage-visitor-map";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900">
        {value}
      </p>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <header className="mb-4">
        <h2 className="text-lg font-medium text-zinc-900">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function DataTable({
  headers,
  rows,
  emptyColSpan,
  emptyLabel,
  hasRows,
}: {
  headers: ReactNode;
  rows: ReactNode;
  emptyColSpan: number;
  emptyLabel: string;
  hasRows: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            {headers}
          </tr>
        </thead>
        <tbody>
          {hasRows ? (
            rows
          ) : (
            <tr>
              <td colSpan={emptyColSpan} className="py-8 text-center text-zinc-500">
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export type DeveloperAnalyticsDashboardProps = {
  t: DeveloperAnalyticsCopy;
  locale: string;
  periodDays: number;
  overview: UsageOverview;
  mapPoints: LocationMapPoint[];
  topPages: TopPageRow[];
  topByTime: TopPageRow[];
  topLocations: TopLocationRow[];
  recent: RecentPageViewRow[];
};

export function DeveloperAnalyticsDashboard({
  t,
  locale,
  periodDays,
  overview,
  mapPoints,
  topPages,
  topByTime,
  topLocations,
  recent,
}: DeveloperAnalyticsDashboardProps) {
  const periodLabel = t.periodDays.replace("{days}", String(periodDays));
  const empty = "—";

  return (
    <div className="space-y-8">
      <header className="border-b border-zinc-200/80 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">
          Developer
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
          {t.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600">
          {t.subtitle}
        </p>
        <p className="mt-2 inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
          {periodLabel}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label={t.stats.totalViews} value={overview.totalViews} />
        <StatCard label={t.stats.uniqueVisitors} value={overview.uniqueVisitors} />
        <StatCard label={t.stats.registeredViews} value={overview.registeredViews} />
        <StatCard label={t.stats.anonymousViews} value={overview.anonymousViews} />
        <StatCard
          label={t.stats.uniqueMembers}
          value={overview.uniqueRegisteredVisitors}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm lg:col-span-2">
            <UsageVisitorMap
              points={mapPoints}
              title={t.visitorMap}
              hint={t.visitorMapHint}
              emptyLabel={t.mapEmpty}
              viewsLabel={t.table.views}
              visitorsLabel={t.table.visitors}
            />
        </section>

        <Panel title={t.topLocations} subtitle={t.topLocationsHint}>
          <ul className="space-y-3">
            {topLocations.length === 0 ? (
              <li className="text-sm text-zinc-500">{empty}</li>
            ) : (
              topLocations.map((row, i) => {
                const maxViews = topLocations[0]?.views ?? 1;
                const pct = Math.round((row.views / maxViews) * 100);
                return (
                  <li key={row.location}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-medium text-zinc-800">
                        <span className="mr-2 tabular-nums text-zinc-400">
                          {i + 1}.
                        </span>
                        {row.location}
                      </span>
                      <span className="shrink-0 tabular-nums text-zinc-500">
                        {row.views}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-violet-500/80"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {row.uniqueVisitors} {t.table.visitors.toLowerCase()}
                    </p>
                  </li>
                );
              })
            )}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title={t.topPages}>
          <DataTable
            hasRows={topPages.length > 0}
            emptyColSpan={4}
            emptyLabel={empty}
            headers={
              <>
                <th className="py-2 pr-3">{t.table.page}</th>
                <th className="py-2 pr-3 text-right">{t.table.views}</th>
                <th className="py-2 pr-3 text-right">{t.table.visitors}</th>
                <th className="py-2 text-right">{t.table.avgTime}</th>
              </>
            }
            rows={topPages.map((row) => (
              <tr key={row.pathname} className="border-b border-zinc-50">
                <td className="max-w-[16rem] truncate py-2.5 pr-3 font-mono text-xs text-zinc-800">
                  {row.pathname}
                </td>
                <td className="py-2.5 pr-3 text-right tabular-nums">{row.views}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums">
                  {row.uniqueVisitors}
                </td>
                <td className="py-2.5 text-right tabular-nums text-zinc-600">
                  {formatDuration(row.avgDurationMs)}
                </td>
              </tr>
            ))}
          />
        </Panel>

        <Panel title={t.topTime}>
          <DataTable
            hasRows={topByTime.length > 0}
            emptyColSpan={3}
            emptyLabel={empty}
            headers={
              <>
                <th className="py-2 pr-3">{t.table.page}</th>
                <th className="py-2 pr-3 text-right">{t.table.avgTime}</th>
                <th className="py-2 text-right">{t.table.totalTime}</th>
              </>
            }
            rows={topByTime.map((row) => (
              <tr key={row.pathname} className="border-b border-zinc-50">
                <td className="max-w-[16rem] truncate py-2.5 pr-3 font-mono text-xs text-zinc-800">
                  {row.pathname}
                </td>
                <td className="py-2.5 pr-3 text-right tabular-nums">
                  {formatDuration(row.avgDurationMs)}
                </td>
                <td className="py-2.5 text-right tabular-nums text-zinc-600">
                  {formatDuration(row.totalDurationMs)}
                </td>
              </tr>
            ))}
          />
        </Panel>
      </div>

      <Panel title={t.recent} subtitle={t.recentHint}>
        <DataTable
          hasRows={recent.length > 0}
          emptyColSpan={6}
          emptyLabel={empty}
          headers={
            <>
              <th className="py-2 pr-3">{t.table.when}</th>
              <th className="py-2 pr-3">{t.table.page}</th>
              <th className="py-2 pr-3">{t.table.visitor}</th>
              <th className="py-2 pr-3">{t.table.location}</th>
              <th className="py-2 pr-3">{t.table.ip}</th>
              <th className="py-2 text-right">{t.table.avgTime}</th>
            </>
          }
          rows={recent.map((row) => (
            <tr key={row.id} className="border-b border-zinc-50 align-top">
              <td className="whitespace-nowrap py-2.5 pr-3 text-zinc-600">
                {formatWhen(row.createdAt, locale)}
              </td>
              <td className="max-w-[12rem] truncate py-2.5 pr-3 font-mono text-xs">
                {row.pathname}
              </td>
              <td className="py-2.5 pr-3">
                {row.userEmail ? (
                  <span>
                    <span className="font-medium text-zinc-900">
                      {row.userName ?? row.userEmail}
                    </span>
                    <br />
                    <span className="text-xs text-zinc-500">{row.userEmail}</span>
                  </span>
                ) : (
                  <span className="text-zinc-600">
                    {t.table.guest}
                    <br />
                    <span className="font-mono text-xs text-zinc-400">
                      {row.visitorId.slice(0, 8)}…
                    </span>
                  </span>
                )}
              </td>
              <td className="py-2.5 pr-3 text-zinc-700">{row.location}</td>
              <td className="py-2.5 pr-3 font-mono text-xs text-zinc-500">
                {row.ipAddress ?? "—"}
              </td>
              <td className="py-2.5 text-right tabular-nums text-zinc-600">
                {row.durationMs != null ? formatDuration(row.durationMs) : "—"}
              </td>
            </tr>
          ))}
        />
      </Panel>

      <p className="text-xs leading-relaxed text-zinc-500">{t.privacyNote}</p>

      <p className="text-center text-sm text-zinc-500">
        <Link href="/dashboard/admin/system" className="underline hover:text-zinc-800">
          {t.backSystem}
        </Link>
      </p>
    </div>
  );
}
