import { headers } from "next/headers";

import Link from "next/link";



import { LocaleSwitcher } from "@/components/locale-switcher";

import { getDictionary } from "@/i18n/get-dictionary";

import { getLocale } from "@/i18n/get-locale";

import { auth } from "@/lib/auth";

import { getClubInstagramUrl } from "@/lib/club-social-links";



import { KsrNavLogo } from "./ksr-nav-logo";
import { LandingNavMobile } from "./landing-nav-mobile";

import { ksrFontClassName } from "./site-page-fonts";



import "./site-page.css";



export async function LandingNav() {

  const session = await auth.api.getSession({

    headers: await headers(),

  });

  const loggedIn = Boolean(session?.user);

  const instagramUrl = getClubInstagramUrl();

  const locale = await getLocale();

  const dict = getDictionary(locale);

  const nav = dict.landing.nav;



  const sectionLinks = [

    { href: "/#about", label: nav.about },

    { href: "/#events", label: nav.events },

    { href: "/#merch", label: nav.merch },

    { href: "/#team", label: nav.team },

  ] as const;



  const localeLabels = {

    english: dict.locale.switchToEnglish,

    turkish: dict.locale.switchToTurkish,

  };



  const menuLabels = {

    open: dict.nav.openMenu,

    close: dict.nav.closeMenu,

  };



  const cta = loggedIn ? (

    <Link href="/dashboard" className="ksr-ncta">

      {nav.dashboard}

    </Link>

  ) : (

    <Link href="/register" className="ksr-ncta">

      {nav.joinClub}

    </Link>

  );



  return (

    <LandingNavMobile

      className={ksrFontClassName}

      loggedIn={loggedIn}

      instagramUrl={instagramUrl}

      instagramLabel={nav.instagram}

      sectionLinks={sectionLinks}

      locale={locale}

      localeLabels={localeLabels}

      menuLabels={menuLabels}

      cta={cta}

    >

      <div className="ksr-nav-inner">

        <KsrNavLogo ariaLabel={dict.home.titleAlt} priority />



        <div className="ksr-nav-end">

          <div className="ksr-nlinks">

            {sectionLinks.map((item) => (

              <Link key={item.href} href={item.href} className="ksr-nlink">

                {item.label}

              </Link>

            ))}

            <a

              href={instagramUrl}

              target="_blank"

              rel="noopener noreferrer"

              className="ksr-nlink"

            >

              {nav.instagram}

            </a>

          </div>



          <div className="ksr-nav-actions">

            <LocaleSwitcher

              locale={locale}

              labels={localeLabels}

              className="ksr-nlocale"

            />

            {cta}

          </div>

        </div>

      </div>

    </LandingNavMobile>

  );

}

