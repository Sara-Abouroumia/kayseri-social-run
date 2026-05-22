"use client";

// import { ClubSocialLinks } from "@/components/club-social-links";
import { DashboardHeaderMobileMenu } from "@/components/dashboard-header-mobile-menu";
import { KsrNavLogo } from "@/components/site-page/ksr-nav-logo";
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

const topRowClass = "flex h-16 shrink-0 items-center lg:h-[4.5rem]";
const bottomRowClass = "flex min-h-10 shrink-0 items-center border-t border-zinc-100 py-1.5";

type DashboardHeaderProps = {
  email: string;
  displayName: string;
  imageUrl: string | null;
  isPlatformAdmin: boolean;
  isPlatformDeveloper?: boolean;
  unreadIdeaCount?: number;
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
  isPlatformDeveloper = false,
  unreadIdeaCount = 0,
  nav,
  logoAlt,
  locale,
  localeLabels,
  weatherLabels,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 max-w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className={cn(siteContainerClass, "py-2 lg:py-2.5")}>
        {/* Mobile: single compact row */}
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <KsrNavLogo ariaLabel={logoAlt} priority className="min-w-0 shrink" />

          {/* Club social links — temporarily hidden */}
          {/* <ClubSocialLinks
            className="shrink-0 lg:hidden"
            instagramAria={nav.socialInstagram}
            whatsappAria={nav.socialWhatsapp}
          /> */}

          <div className="ml-auto flex min-w-0 shrink items-center gap-1.5">
            <DashboardProfileLink
              displayName={displayName}
              email={email}
              imageUrl={imageUrl}
              profileLabel={nav.profileSettings}
            />
            <DashboardHeaderMobileMenu
              locale={locale}
              nav={nav}
              localeLabels={localeLabels}
              weatherLabels={weatherLabels}
              isPlatformAdmin={isPlatformAdmin}
              isPlatformDeveloper={isPlatformDeveloper}
              unreadIdeaCount={unreadIdeaCount}
            />
          </div>
        </div>

        {/* Desktop: two-column layout */}
        <div className="hidden min-w-0 items-stretch gap-x-4 lg:flex">
          <div className="flex shrink-0 flex-col border-r border-zinc-100 pr-8 xl:pr-13">
            <div className={cn(topRowClass, "justify-start")}>
              <KsrNavLogo ariaLabel={logoAlt} priority className="flex h-full items-center" />
            </div>
            {/* Club social links — temporarily hidden */}
            {/* <div className={cn(bottomRowClass, "justify-start pl-0.5")}>
              <ClubSocialLinks
                instagramAria={nav.socialInstagram}
                whatsappAria={nav.socialWhatsapp}
              />
            </div> */}
          </div>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div
              className={cn(
                topRowClass,
                dashboardHeaderInsetX,
                "w-full min-w-0 gap-2 @container/topbar lg:gap-2.5",
              )}
            >
              <div className="min-w-0 flex-1 overflow-hidden">
                <KayseriWeatherClock locale={locale} labels={weatherLabels} />
              </div>

              <div className="flex shrink-0 items-center gap-2 lg:gap-2.5">
                <DashboardProfileLink
                  displayName={displayName}
                  email={email}
                  imageUrl={imageUrl}
                  profileLabel={nav.profileSettings}
                />
                <HeaderToolbarDivider className="self-center" />
                <div className="flex shrink-0 items-center gap-1.5 lg:gap-2">
                  <LocaleSwitcher locale={locale} labels={localeLabels} />
                  <SignOutButton label={nav.signOut} confirmLabel={nav.signOutConfirm} />
                </div>
              </div>
            </div>

            <DashboardNav
              nav={nav}
              isPlatformAdmin={isPlatformAdmin}
              isPlatformDeveloper={isPlatformDeveloper}
              unreadIdeaCount={unreadIdeaCount}
              className={cn(bottomRowClass, "min-w-0 gap-0.5 overflow-x-auto")}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
