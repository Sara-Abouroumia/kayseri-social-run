import {
  getClubRunStats,
  type ClubRunStats,
} from "@/lib/club-run-stats";
import { getRegisteredUserCount } from "@/lib/member-stats";
import {
  getPublicUpcomingEvents,
  type UpcomingDashboardEvent,
} from "@/lib/upcoming-events";

const EMPTY_RUN_STATS: ClubRunStats = {
  runsThisYear: 0,
  totalKm: 0,
  yearsActive: 0,
};

export type HomePageData = {
  upcomingEvents: UpcomingDashboardEvent[];
  registeredUserCount: number;
  clubRunStats: ClubRunStats;
};

function logRejected(label: string, reason: unknown) {
  const message = reason instanceof Error ? reason.message : String(reason);
  console.error(`[home] ${label} failed: ${message}`);
}

/** Landing page data; partial fallbacks so a DB glitch does not 500 the whole site. */
export async function loadHomePageData(): Promise<HomePageData> {
  const [eventsResult, membersResult, runsResult] = await Promise.allSettled([
    getPublicUpcomingEvents(4),
    getRegisteredUserCount(),
    getClubRunStats(),
  ]);

  if (eventsResult.status === "rejected") {
    logRejected("upcoming events", eventsResult.reason);
  }
  if (membersResult.status === "rejected") {
    logRejected("member count", membersResult.reason);
  }
  if (runsResult.status === "rejected") {
    logRejected("club run stats", runsResult.reason);
  }

  return {
    upcomingEvents:
      eventsResult.status === "fulfilled" ? eventsResult.value : [],
    registeredUserCount:
      membersResult.status === "fulfilled" ? membersResult.value : 0,
    clubRunStats:
      runsResult.status === "fulfilled" ? runsResult.value : EMPTY_RUN_STATS,
  };
}
