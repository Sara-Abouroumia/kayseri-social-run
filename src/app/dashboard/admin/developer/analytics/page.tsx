import type { Metadata } from "next";
import Link from "next/link";

import { DeveloperAnalyticsDashboard } from "@/app/dashboard/admin/developer/analytics/developer-analytics-dashboard";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { siteMainClass } from "@/lib/layout";
import { requirePlatformDeveloper } from "@/lib/require-platform-developer";
import {
  getLocationMapPoints,
  getRecentPageViews,
  getTopDevices,
  getTopLocations,
  getTopPages,
  getTopPagesByTime,
  getUsageOverview,
  isUsageAnalyticsAvailable,
} from "@/lib/usage-analytics";

export const metadata: Metadata = {
  title: "Developer · Public usage",
};

const PERIOD_DAYS = 30;

export default async function DeveloperAnalyticsPage() {
  await requirePlatformDeveloper();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.developerAnalytics;

  const available = await isUsageAnalyticsAvailable();

  if (!available) {
    return (
      <main className={siteMainClass}>
        <h1 className="text-2xl font-semibold text-zinc-900">{t.title}</h1>
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {t.migrationHint}
        </p>
        <p className="mt-8 text-center text-sm text-zinc-500">
          <Link href="/dashboard/admin/system" className="underline hover:text-zinc-800">
            {t.backSystem}
          </Link>
        </p>
      </main>
    );
  }

  const [overview, mapPoints, topPages, topByTime, topLocations, topDevices, recent] =
    await Promise.all([
      getUsageOverview(PERIOD_DAYS),
      getLocationMapPoints(PERIOD_DAYS, 40),
      getTopPages(PERIOD_DAYS, 12),
      getTopPagesByTime(PERIOD_DAYS, 10),
      getTopLocations(PERIOD_DAYS, 12),
      getTopDevices(PERIOD_DAYS, 10),
      getRecentPageViews(60),
    ]);

  return (
    <main className={siteMainClass}>
      <DeveloperAnalyticsDashboard
        t={t}
        locale={locale}
        periodDays={PERIOD_DAYS}
        overview={overview}
        mapPoints={mapPoints}
        topPages={topPages}
        topByTime={topByTime}
        topLocations={topLocations}
        topDevices={topDevices}
        recent={recent}
      />
    </main>
  );
}
