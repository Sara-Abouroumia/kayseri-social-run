import { SitePage } from "@/components/site-page";
import { getClubInstagramUrl, getClubWhatsAppUrl } from "@/lib/club-social-links";
import { formatLandingStatValue } from "@/lib/club-run-stats";
import { loadHomePageData } from "@/lib/home-page-data";
import { formatMemberCountForDisplay } from "@/lib/member-stats";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { upcomingEvents, registeredUserCount, clubRunStats } =
    await loadHomePageData();

  return (
    <SitePage
      upcomingEvents={upcomingEvents}
      instagramUrl={getClubInstagramUrl()}
      whatsappUrl={getClubWhatsAppUrl()}
      memberCount={formatMemberCountForDisplay(registeredUserCount)}
      runStats={{
        runsThisYear: clubRunStats.runsThisYear,
        totalKm: formatLandingStatValue(clubRunStats.totalKm),
        // yearsActive: clubRunStats.yearsActive,
      }}
    />
  );
}
