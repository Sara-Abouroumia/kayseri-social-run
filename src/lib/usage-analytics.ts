import { randomBytes } from "node:crypto";

import { and, count, desc, eq, gte, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { usagePageViews } from "@/db/schema/usage-analytics";
import { resolveGeoCoordinates } from "@/lib/geo-coordinates";
import { parseUserAgent } from "@/lib/parse-user-agent";
import type { ClientRequestInfo } from "@/lib/request-client-info";
import { formatLocationLabel } from "@/lib/request-client-info";

export const USAGE_VISITOR_COOKIE = "ksr_visitor_id";
const MAX_DURATION_MS = 30 * 60 * 1000;

export function newVisitorId(): string {
  return randomBytes(16).toString("hex");
}

export function shouldTrackPathname(pathname: string): boolean {
  if (!pathname || !pathname.startsWith("/")) return false;
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/_next")) return false;
  if (pathname.includes(".")) return false;
  return true;
}

export async function recordPageView(params: {
  visitorId: string;
  userId: string | null;
  pathname: string;
  referrer: string | null;
  durationMs: number | null;
  client: ClientRequestInfo;
}): Promise<void> {
  const durationMs =
    params.durationMs != null
      ? Math.min(Math.max(0, Math.floor(params.durationMs)), MAX_DURATION_MS)
      : null;

  await db.insert(usagePageViews).values({
    id: randomBytes(16).toString("hex"),
    createdAt: new Date(),
    visitorId: params.visitorId,
    userId: params.userId,
    pathname: params.pathname.slice(0, 500),
    referrer: params.referrer?.slice(0, 500) ?? null,
    durationMs,
    ipAddress: params.client.ipAddress?.slice(0, 64) ?? null,
    country: params.client.country?.slice(0, 8) ?? null,
    region: params.client.region?.slice(0, 64) ?? null,
    city: params.client.city?.slice(0, 128) ?? null,
    userAgent: params.client.userAgent?.slice(0, 512) ?? null,
  });
}

function sinceDays(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export type UsageOverview = {
  totalViews: number;
  uniqueVisitors: number;
  registeredViews: number;
  anonymousViews: number;
  uniqueRegisteredVisitors: number;
};

export async function getUsageOverview(days: number): Promise<UsageOverview> {
  const since = sinceDays(days);

  const [totals] = await db
    .select({
      totalViews: count(),
      uniqueVisitors: sql<number>`count(distinct ${usagePageViews.visitorId})`.mapWith(
        Number,
      ),
      registeredViews: sql<number>`count(*) filter (where ${usagePageViews.userId} is not null)`.mapWith(
        Number,
      ),
      uniqueRegisteredVisitors: sql<number>`count(distinct ${usagePageViews.userId}) filter (where ${usagePageViews.userId} is not null)`.mapWith(
        Number,
      ),
    })
    .from(usagePageViews)
    .where(gte(usagePageViews.createdAt, since));

  const totalViews = Number(totals?.totalViews ?? 0);
  const registeredViews = Number(totals?.registeredViews ?? 0);

  return {
    totalViews,
    uniqueVisitors: Number(totals?.uniqueVisitors ?? 0),
    registeredViews,
    anonymousViews: totalViews - registeredViews,
    uniqueRegisteredVisitors: Number(totals?.uniqueRegisteredVisitors ?? 0),
  };
}

export type TopPageRow = {
  pathname: string;
  views: number;
  uniqueVisitors: number;
  totalDurationMs: number;
  avgDurationMs: number;
};

export async function getTopPages(
  days: number,
  limit = 15,
): Promise<TopPageRow[]> {
  const since = sinceDays(days);

  const rows = await db
    .select({
      pathname: usagePageViews.pathname,
      views: count(),
      uniqueVisitors: sql<number>`count(distinct ${usagePageViews.visitorId})`.mapWith(
        Number,
      ),
      totalDurationMs: sql<number>`coalesce(sum(${usagePageViews.durationMs}), 0)`.mapWith(
        Number,
      ),
    })
    .from(usagePageViews)
    .where(gte(usagePageViews.createdAt, since))
    .groupBy(usagePageViews.pathname)
    .orderBy(desc(count()))
    .limit(limit);

  return rows.map((row) => {
    const views = Number(row.views);
    const totalDurationMs = Number(row.totalDurationMs);
    return {
      pathname: row.pathname,
      views,
      uniqueVisitors: Number(row.uniqueVisitors),
      totalDurationMs,
      avgDurationMs: views > 0 ? Math.round(totalDurationMs / views) : 0,
    };
  });
}

export type TopLocationRow = {
  location: string;
  views: number;
  uniqueVisitors: number;
};

export type TopDeviceRow = {
  device: string;
  views: number;
  uniqueVisitors: number;
};

export type LocationMapPoint = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  views: number;
  uniqueVisitors: number;
};

export async function getTopLocations(
  days: number,
  limit = 12,
): Promise<TopLocationRow[]> {
  const since = sinceDays(days);

  const rows = await db
    .select({
      country: usagePageViews.country,
      region: usagePageViews.region,
      city: usagePageViews.city,
      views: count(),
      uniqueVisitors: sql<number>`count(distinct ${usagePageViews.visitorId})`.mapWith(
        Number,
      ),
    })
    .from(usagePageViews)
    .where(gte(usagePageViews.createdAt, since))
    .groupBy(
      usagePageViews.country,
      usagePageViews.region,
      usagePageViews.city,
    )
    .orderBy(desc(count()))
    .limit(limit);

  return rows.map((row) => ({
    location: formatLocationLabel({
      city: row.city,
      region: row.region,
      country: row.country,
    }),
    views: Number(row.views),
    uniqueVisitors: Number(row.uniqueVisitors),
  }));
}

/** Devices / browsers from User-Agent strings (merged by parsed label). */
export async function getTopDevices(
  days: number,
  limit = 10,
): Promise<TopDeviceRow[]> {
  const since = sinceDays(days);

  const rows = await db
    .select({
      userAgent: usagePageViews.userAgent,
      views: count(),
      uniqueVisitors: sql<number>`count(distinct ${usagePageViews.visitorId})`.mapWith(
        Number,
      ),
    })
    .from(usagePageViews)
    .where(gte(usagePageViews.createdAt, since))
    .groupBy(usagePageViews.userAgent)
    .orderBy(desc(count()));

  const merged = new Map<string, TopDeviceRow>();

  for (const row of rows) {
    const { label } = parseUserAgent(row.userAgent);
    const views = Number(row.views);
    const uniqueVisitors = Number(row.uniqueVisitors);
    const prev = merged.get(label);
    if (prev) {
      prev.views += views;
      prev.uniqueVisitors += uniqueVisitors;
    } else {
      merged.set(label, { device: label, views, uniqueVisitors });
    }
  }

  return [...merged.values()]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

/** Aggregated dots for the visitor map (city when known, else country centroid). */
export async function getLocationMapPoints(
  days: number,
  limit = 40,
): Promise<LocationMapPoint[]> {
  const since = sinceDays(days);

  const rows = await db
    .select({
      country: usagePageViews.country,
      region: usagePageViews.region,
      city: usagePageViews.city,
      views: count(),
      uniqueVisitors: sql<number>`count(distinct ${usagePageViews.visitorId})`.mapWith(
        Number,
      ),
    })
    .from(usagePageViews)
    .where(gte(usagePageViews.createdAt, since))
    .groupBy(
      usagePageViews.country,
      usagePageViews.region,
      usagePageViews.city,
    )
    .orderBy(desc(count()));

  const points: LocationMapPoint[] = [];

  for (const row of rows) {
    const coords = resolveGeoCoordinates(row.country, row.city, row.region);
    if (!coords) continue;

    const label = formatLocationLabel({
      city: row.city,
      region: row.region,
      country: row.country,
    });
    const id = [row.country ?? "", row.region ?? "", row.city ?? ""].join("|");

    points.push({
      id,
      lat: coords.lat,
      lng: coords.lng,
      label,
      views: Number(row.views),
      uniqueVisitors: Number(row.uniqueVisitors),
    });

    if (points.length >= limit) break;
  }

  return points;
}

export type RecentPageViewRow = {
  id: string;
  createdAt: Date;
  pathname: string;
  referrer: string | null;
  durationMs: number | null;
  visitorId: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  ipAddress: string | null;
  location: string;
  device: string;
  userAgent: string | null;
};

export async function getRecentPageViews(limit = 80): Promise<RecentPageViewRow[]> {
  const rows = await db
    .select({
      id: usagePageViews.id,
      createdAt: usagePageViews.createdAt,
      pathname: usagePageViews.pathname,
      referrer: usagePageViews.referrer,
      durationMs: usagePageViews.durationMs,
      visitorId: usagePageViews.visitorId,
      userId: usagePageViews.userId,
      userName: user.name,
      userEmail: user.email,
      ipAddress: usagePageViews.ipAddress,
      country: usagePageViews.country,
      region: usagePageViews.region,
      city: usagePageViews.city,
      userAgent: usagePageViews.userAgent,
    })
    .from(usagePageViews)
    .leftJoin(user, eq(usagePageViews.userId, user.id))
    .orderBy(desc(usagePageViews.createdAt))
    .limit(limit);

  return rows.map((row) => {
    const { label: device } = parseUserAgent(row.userAgent);
    return {
      id: row.id,
      createdAt: row.createdAt,
      pathname: row.pathname,
      referrer: row.referrer,
      durationMs: row.durationMs,
      visitorId: row.visitorId,
      userId: row.userId,
      userName: row.userName,
      userEmail: row.userEmail,
      ipAddress: row.ipAddress,
      location: formatLocationLabel({
        city: row.city,
        region: row.region,
        country: row.country,
      }),
      device,
      userAgent: row.userAgent,
    };
  });
}

/** Pages ranked by total time on page (durationMs sum). */
export async function getTopPagesByTime(
  days: number,
  limit = 10,
): Promise<TopPageRow[]> {
  const since = sinceDays(days);

  const rows = await db
    .select({
      pathname: usagePageViews.pathname,
      views: count(),
      uniqueVisitors: sql<number>`count(distinct ${usagePageViews.visitorId})`.mapWith(
        Number,
      ),
      totalDurationMs: sql<number>`coalesce(sum(${usagePageViews.durationMs}), 0)`.mapWith(
        Number,
      ),
    })
    .from(usagePageViews)
    .where(
      and(
        gte(usagePageViews.createdAt, since),
        isNotNull(usagePageViews.durationMs),
      ),
    )
    .groupBy(usagePageViews.pathname)
    .orderBy(
      desc(sql`coalesce(sum(${usagePageViews.durationMs}), 0)`),
    )
    .limit(limit);

  return rows.map((row) => {
    const views = Number(row.views);
    const totalDurationMs = Number(row.totalDurationMs);
    return {
      pathname: row.pathname,
      views,
      uniqueVisitors: Number(row.uniqueVisitors),
      totalDurationMs,
      avgDurationMs: views > 0 ? Math.round(totalDurationMs / views) : 0,
    };
  });
}

export async function isUsageAnalyticsAvailable(): Promise<boolean> {
  try {
    await db.select({ n: count() }).from(usagePageViews).limit(1);
    return true;
  } catch (e) {
    const msg = String((e as { message?: string })?.message ?? "");
    if (msg.includes("usage_page_views") && msg.includes("does not exist")) {
      return false;
    }
    throw e;
  }
}
