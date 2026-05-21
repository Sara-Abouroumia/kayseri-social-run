import { and, inArray, lt } from "drizzle-orm";

import { db } from "@/db";
import { events } from "@/db/schema/events";

/** First club run day — weekly 5 km runs counted from this date when DB has fewer events. */
export const CLUB_RUN_ORIGIN = new Date(2026, 3, 12);

const DEFAULT_RUN_KM = 5;

const RUNNING_ACTIVITY_KEYS = new Set([
  "run",
  "running",
  "trail run",
  "group run",
  "social run",
]);

function normActivityType(activityType: string): string {
  return activityType.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isRunningActivity(activityType: string): boolean {
  const key = normActivityType(activityType);
  if (!key) return false;
  if (RUNNING_ACTIVITY_KEYS.has(key)) return true;
  return key.includes("run") && !key.includes("barbecue");
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** First Saturday on or after `d` (club’s usual weekly run day). */
function firstSaturdayOnOrAfter(d: Date): Date {
  const day = startOfDay(d);
  const daysUntilSaturday = (6 - day.getDay() + 7) % 7;
  day.setDate(day.getDate() + daysUntilSaturday);
  return day;
}

/** Most recent Saturday on or before `d`. */
function lastSaturdayOnOrBefore(d: Date): Date {
  const day = startOfDay(d);
  const daysSinceSaturday = (day.getDay() + 1) % 7;
  day.setDate(day.getDate() - daysSinceSaturday);
  return day;
}

/** One run per weekend (Saturday) from origin through `through` (inclusive). */
export function countBaselineWeekendRuns(
  origin: Date,
  through: Date,
): number {
  const start = firstSaturdayOnOrAfter(origin);
  const end = lastSaturdayOnOrBefore(through);
  if (end < start) return 0;

  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    count += 1;
    cursor.setDate(cursor.getDate() + 7);
  }
  return count;
}

function parseDistanceKm(value: string | null | undefined): number {
  if (value == null || value === "") return DEFAULT_RUN_KM;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_RUN_KM;
}

type PastRunEvent = {
  startsAt: Date;
  distanceKm: string | null;
  activityType: string;
};

async function getPastRunningEvents(): Promise<PastRunEvent[]> {
  const now = new Date();
  const rows = await db
    .select({
      startsAt: events.startsAt,
      distanceKm: events.distanceKm,
      activityType: events.activityType,
    })
    .from(events)
    .where(
      and(
        lt(events.startsAt, now),
        inArray(events.visibility, ["public", "members_only"]),
      ),
    );

  return rows.filter((row) => isRunningActivity(row.activityType));
}

function aggregateFromEvents(
  eventList: PastRunEvent[],
  year?: number,
): { runCount: number; totalKm: number } {
  let runCount = 0;
  let totalKm = 0;

  for (const e of eventList) {
    if (year != null && e.startsAt.getFullYear() !== year) continue;
    runCount += 1;
    totalKm += parseDistanceKm(e.distanceKm);
  }

  return { runCount, totalKm };
}

export type ClubRunStats = {
  /** Runs in the current calendar year (matches “runs per year” stat). */
  runsThisYear: number;
  /** Cumulative km since club origin. */
  totalKm: number;
  /** Calendar years of activity since origin (minimum 1 once started). */
  yearsActive: number;
};

export async function getClubRunStats(
  now = new Date(),
  origin = CLUB_RUN_ORIGIN,
): Promise<ClubRunStats> {
  const pastRuns = await getPastRunningEvents();
  const currentYear = now.getFullYear();

  const baselineRunsAll = countBaselineWeekendRuns(origin, now);
  const baselineKmAll = baselineRunsAll * DEFAULT_RUN_KM;

  const yearStart = new Date(Math.max(origin.getTime(), new Date(currentYear, 0, 1).getTime()));
  const baselineRunsThisYear = countBaselineWeekendRuns(yearStart, now);

  const dbAll = aggregateFromEvents(pastRuns);
  const dbThisYear = aggregateFromEvents(pastRuns, currentYear);

  const runsThisYear = Math.max(baselineRunsThisYear, dbThisYear.runCount);
  const totalKm = Math.max(baselineKmAll, Math.round(dbAll.totalKm));

  let yearsActive = 0;
  if (now >= origin) {
    yearsActive = now.getFullYear() - origin.getFullYear() + 1;
    yearsActive = Math.max(1, yearsActive);
  }

  return { runsThisYear, totalKm, yearsActive };
}

/** Large landing counters: exact under 1000; at 1000+ round down to nearest 100 with “+”. */
export function formatLandingStatValue(value: number): {
  target: number;
  plus: boolean;
} {
  const safe = Math.max(0, Math.floor(value));
  if (safe >= 1000) {
    return { target: Math.floor(safe / 100) * 100, plus: true };
  }
  return { target: safe, plus: false };
}
