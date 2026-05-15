import { headers } from "next/headers";

import { DashboardHeader } from "@/app/dashboard/dashboard-header";
import { auth } from "@/lib/auth";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { isPlatformAdmin } from "@/lib/platform-admin";

/** Full dashboard nav for signed-in users (profile, weather, tabs). */
export async function AuthenticatedDashboardHeader() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const displayName = user.name?.trim() || user.email;
  const userIsPlatformAdmin = await isPlatformAdmin(user.id, user.email);
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <DashboardHeader
      email={user.email}
      displayName={displayName}
      imageUrl={user.image ?? null}
      isPlatformAdmin={userIsPlatformAdmin}
      nav={dict.nav}
      logoAlt={dict.home.titleAlt}
      locale={locale}
      localeLabels={{
        english: dict.locale.switchToEnglish,
        turkish: dict.locale.switchToTurkish,
      }}
      weatherLabels={dict.navWeather}
    />
  );
}
