"use client";

import Image from "next/image";
import Link from "next/link";

import { ClubSocialLinks } from "@/components/club-social-links";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardProfileLink } from "@/components/dashboard-profile-link";
import { HeaderToolbarDivider } from "@/components/header-toolbar";
import { KayseriWeatherClock } from "@/components/kayseri-weather-clock";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SignOutButton } from "@/components/sign-out-button";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages/en";
import { dashboardHeaderInsetX, siteContainerClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

const topRowClass = "flex h-14 shrink-0 items-center sm:h-16";
const bottomRowClass =
  "flex min-h-10 shrink-0 items-center border-t border-zinc-100 py-1.5";

type DashboardHeaderProps = {
  email: string;
  displayName: string;
  imageUrl: string | null;
  isPlatformAdmin: boolean;
  nav: Messages["nav"];
  logoAlt: string;
  locale: Locale;
  localeLabels: { english: string; turkish: string };
  weatherLabels: Messages["navWeather"];
};

export function DashboardHeader({
  email,
  displayName,
  imageUrl,
  isPlatformAdmin,
  nav,
  logoAlt,
  locale,
  localeLabels,
  weatherLabels,
}: DashboardHeaderProps) {
  return (
    <header className="@container sticky top-0 z-50 max-w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className={cn(siteContainerClass, "py-2 sm:py-2.5")}>
        <div className="flex min-w-0 items-stretch gap-x-3 sm:gap-x-4">
          <div className="flex shrink-0 flex-col border-r border-zinc-100 pr-2 sm:pr-3">
            <div className={cn(topRowClass, "justify-start")}>
              <Link
                href="/"
                className="flex h-full max-w-[10rem] items-center sm:max-w-[13.5rem] md:max-w-[16rem]"
                title={nav.home}
              >
                <Image
                  src="/kayserisocialrun_logo.png"
                  alt={logoAlt}
                  width={440}
                  height={106}
                  className="max-h-full w-auto object-contain object-left"
                  priority
                />
              </Link>
            </div>
            <div className={cn(bottomRowClass, "justify-start pl-0.5")}>
              <ClubSocialLinks
                instagramAria={nav.socialInstagram}
                whatsappAria={nav.socialWhatsapp}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div
              className={cn(
                topRowClass,
                dashboardHeaderInsetX,
                "w-full min-w-0 gap-2 @container/topbar sm:gap-2.5",
              )}
            >
              <div className="min-w-0 flex-1 overflow-hidden">
                <KayseriWeatherClock locale={locale} labels={weatherLabels} />
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
                <DashboardProfileLink
                  displayName={displayName}
                  email={email}
                  imageUrl={imageUrl}
                  profileLabel={nav.profileSettings}
                />
                <HeaderToolbarDivider className="self-center" />
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <LocaleSwitcher locale={locale} labels={localeLabels} />
                  <SignOutButton label={nav.signOut} confirmLabel={nav.signOutConfirm} />
                </div>
              </div>
            </div>

            <DashboardNav
              nav={nav}
              isPlatformAdmin={isPlatformAdmin}
              className={cn(bottomRowClass, "min-w-0 gap-0.5 overflow-x-auto")}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
