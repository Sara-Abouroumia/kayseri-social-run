"use client";

import { DashboardNav } from "@/components/dashboard-nav";
import { KayseriWeatherClock } from "@/components/kayseri-weather-clock";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileNavDrawer } from "@/components/mobile-nav-drawer";
import { SignOutButton } from "@/components/sign-out-button";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages/en";

type DashboardHeaderMobileMenuProps = {
  locale: Locale;
  nav: Messages["nav"];
  localeLabels: { english: string; turkish: string };
  weatherLabels: Messages["navWeather"];
  isPlatformAdmin: boolean;
  unreadIdeaCount?: number;
};

export function DashboardHeaderMobileMenu({
  locale,
  nav,
  localeLabels,
  weatherLabels,
  isPlatformAdmin,
  unreadIdeaCount = 0,
}: DashboardHeaderMobileMenuProps) {
  const showMenuBadge = isPlatformAdmin && unreadIdeaCount > 0;

  return (
    <MobileNavDrawer
      openLabel={nav.openMenu}
      closeLabel={nav.closeMenu}
      panelTopClass="top-[3.75rem]"
      menuBadgeCount={showMenuBadge ? unreadIdeaCount : 0}
      menuBadgeAriaLabel={
        showMenuBadge
          ? nav.unreadIdeasBadge.replace("{count}", String(unreadIdeaCount))
          : undefined
      }
    >
      <DashboardNav
        nav={nav}
        isPlatformAdmin={isPlatformAdmin}
        unreadIdeaCount={unreadIdeaCount}
        variant="drawer"
      />

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
        <KayseriWeatherClock
          locale={locale}
          labels={weatherLabels}
          variant="footer"
          className="min-w-0 shrink"
        />
        <div className="flex shrink-0 items-center gap-2">
          <LocaleSwitcher locale={locale} labels={localeLabels} />
          <SignOutButton label={nav.signOut} confirmLabel={nav.signOutConfirm} />
        </div>
      </div>
    </MobileNavDrawer>
  );
}
