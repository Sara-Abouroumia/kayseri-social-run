import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { AppHeaderMobileMenu } from "@/components/app-header-mobile-menu";
// import { ClubSocialLinks } from "@/components/club-social-links";
import {
  HeaderToolbar,
  HeaderToolbarDivider,
  HeaderUtilityCluster,
} from "@/components/header-toolbar";
import { KayseriWeatherClock } from "@/components/kayseri-weather-clock";
import { auth } from "@/lib/auth";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { siteContainerClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

import { HeaderNavLink } from "./header-nav-link";
import { LocaleSwitcher } from "./locale-switcher";

const authLinkClass =
  "inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium transition";
const authLinkPrimary = `${authLinkClass} bg-zinc-900 text-white shadow-sm hover:bg-zinc-800`;

export async function AppHeader() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const loggedIn = Boolean(session?.user);

  return (
    <header className="sticky top-0 z-50 max-w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className={cn(siteContainerClass, "flex h-14 min-w-0 items-center gap-2 sm:gap-3")}>
        <Link
          href="/"
          className="flex min-w-0 shrink items-center"
          aria-label={dict.home.titleAlt}
        >
          <Image
            src="/kayserisocialrun_logo.png"
            alt={dict.home.titleAlt}
            width={220}
            height={56}
            className="h-8 w-auto max-w-[9.5rem] sm:h-9 sm:max-w-none md:h-10"
            priority
          />
        </Link>

        {/* Club social links — temporarily hidden */}
        {/* <ClubSocialLinks
          className="flex shrink-0 max-md:flex md:flex"
          instagramAria={dict.nav.socialInstagram}
          whatsappAria={dict.nav.socialWhatsapp}
        /> */}

        <HeaderToolbar className="hidden md:flex">
          <HeaderNavLink href="/">{dict.nav.about}</HeaderNavLink>

          <HeaderToolbarDivider />

          <div className="@container/topbar flex shrink-0 items-center gap-2">
            <KayseriWeatherClock locale={locale} labels={dict.navWeather} />
            <LocaleSwitcher
              locale={locale}
              labels={{
                english: dict.locale.switchToEnglish,
                turkish: dict.locale.switchToTurkish,
              }}
            />
          </div>

          <HeaderToolbarDivider />

          {loggedIn ? (
            <Link href="/dashboard" className={authLinkPrimary}>
              {dict.nav.dashboard}
            </Link>
          ) : (
            <HeaderUtilityCluster>
              <HeaderNavLink href="/login">{dict.nav.login}</HeaderNavLink>
              <Link href="/register" className={authLinkPrimary}>
                {dict.nav.register}
              </Link>
            </HeaderUtilityCluster>
          )}
        </HeaderToolbar>

        <div className="ml-auto flex shrink-0 md:hidden">
          <AppHeaderMobileMenu
            locale={locale}
            nav={dict.nav}
            localeLabels={{
              english: dict.locale.switchToEnglish,
              turkish: dict.locale.switchToTurkish,
            }}
            weatherLabels={dict.navWeather}
            loggedIn={loggedIn}
          />
        </div>
      </div>
    </header>
  );
}
