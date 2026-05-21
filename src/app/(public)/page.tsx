import { SitePage } from "@/components/site-page";
import { getClubInstagramUrl, getClubWhatsAppUrl } from "@/lib/club-social-links";
import {
  formatLandingStatValue,
  getClubRunStats,
} from "@/lib/club-run-stats";
import {
  formatMemberCountForDisplay,
  getRegisteredUserCount,
} from "@/lib/member-stats";
import { getPublicUpcomingEvents } from "@/lib/upcoming-events";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [upcomingEvents, registeredUserCount, clubRunStats] = await Promise.all([
    getPublicUpcomingEvents(4),
    getRegisteredUserCount(),
    getClubRunStats(),
  ]);

  return (
    <SitePage
      upcomingEvents={upcomingEvents}
      instagramUrl={getClubInstagramUrl()}
      whatsappUrl={getClubWhatsAppUrl()}
      memberCount={formatMemberCountForDisplay(registeredUserCount)}
      runStats={{
        runsThisYear: clubRunStats.runsThisYear,
        totalKm: formatLandingStatValue(clubRunStats.totalKm),
        yearsActive: clubRunStats.yearsActive,
      }}
    />
  );
}
