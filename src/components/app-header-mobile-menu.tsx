"use client";

import Link from "next/link";

import { HeaderNavLink } from "@/components/header-nav-link";
import { KayseriWeatherClock } from "@/components/kayseri-weather-clock";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileNavDrawer } from "@/components/mobile-nav-drawer";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages/en";

const authLinkClass =
  "inline-flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm font-medium transition";
const authLinkPrimary = `${authLinkClass} bg-zinc-900 text-white shadow-sm hover:bg-zinc-800`;

type AppHeaderMobileMenuProps = {
  locale: Locale;
  nav: Messages["nav"];
  localeLabels: { english: string; turkish: string };
  weatherLabels: Messages["navWeather"];
  loggedIn: boolean;
};

export function AppHeaderMobileMenu({
  locale,
  nav,
  localeLabels,
  weatherLabels,
  loggedIn,
}: AppHeaderMobileMenuProps) {
  return (
    <MobileNavDrawer openLabel={nav.openMenu} closeLabel={nav.closeMenu}>
      <nav className="flex flex-col gap-1" aria-label={nav.menu}>
        <HeaderNavLink href="/" className="w-full justify-center rounded-lg px-3 py-2.5">
          {nav.about}
        </HeaderNavLink>

        {loggedIn ? (
          <Link href="/dashboard" className={authLinkPrimary}>
            {nav.dashboard}
          </Link>
        ) : (
          <>
            <HeaderNavLink href="/login" className="w-full justify-center rounded-lg px-3 py-2.5">
              {nav.login}
            </HeaderNavLink>
            <Link href="/register" className={authLinkPrimary}>
              {nav.register}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
        <KayseriWeatherClock
          locale={locale}
          labels={weatherLabels}
          variant="footer"
          className="min-w-0 shrink"
        />
        <div className="flex shrink-0 items-center">
          <LocaleSwitcher locale={locale} labels={localeLabels} />
        </div>
      </div>
    </MobileNavDrawer>
  );
}
