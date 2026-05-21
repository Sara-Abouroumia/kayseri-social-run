import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import type { Messages } from "@/i18n/messages/en";
import { auth } from "@/lib/auth";
import type { UpcomingDashboardEvent } from "@/lib/upcoming-events";

import { MediaReelGrid } from "./media-reel-grid";
import { MEDIA_REEL_ITEMS, MERCH_TSHIRT_IMAGE, TEAM_INITIALS } from "./site-page-content";
import { SitePageMotion } from "./site-page-effects";
import { ksrFontClassName } from "./site-page-fonts";
import {
  HeroMountainSvg,
  PhilosophyMountainSvg,
} from "./site-page-graphics";

import "./site-page.css";

export type SitePageProps = {
  upcomingEvents: UpcomingDashboardEvent[];
  instagramUrl: string;
  whatsappUrl: string;
  memberCount: { target: number; plus: boolean };
  runStats: {
    runsThisYear: number;
    totalKm: { target: number; plus: boolean };
    // yearsActive: number; // hidden until club has a full calendar year of history
  };
};

type LandingCopy = Messages["landing"];

function formatEventWhen(d: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function distanceLabel(
  km: string | null | undefined,
  kmUnit: string,
): string | null {
  if (!km) return null;
  const n = Number(km);
  if (Number.isNaN(n)) return null;
  return n % 1 === 0 ? `${n} ${kmUnit}` : `${n.toFixed(1)} ${kmUnit}`;
}

function eventBigLabel(
  km: string | null | undefined,
  activityType: string,
  kmUnit: string,
): string {
  const d = distanceLabel(km, kmUnit);
  if (d) return d.replace(new RegExp(`\\s*${kmUnit}`, "i"), "K").toUpperCase();
  return activityType.slice(0, 3).toUpperCase();
}

function MetaItem({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="ksr-epip" />
      {children}
    </span>
  );
}

function EventCard({
  href,
  featured,
  date,
  title,
  meta,
  description,
  tag,
  big,
}: {
  href: string;
  featured?: boolean;
  date: string;
  title: string;
  meta: ReactNode;
  description?: string;
  tag?: string;
  big: string;
}) {
  return (
    <Link href={href} className={`ksr-ecard${featured ? " ksr-ecard-feat" : ""}`}>
      {tag ? <div className="ksr-etag">{tag}</div> : null}
      <div className="ksr-edate">{date}</div>
      <div className="ksr-ename">{title}</div>
      <div className="ksr-emeta">{meta}</div>
      {description ? <p className="ksr-edesc">{description}</p> : null}
      <div className="ksr-ebig">{big}</div>
    </Link>
  );
}

function EventsSection({
  events,
  instagramUrl,
  copy,
  locale,
}: {
  events: UpcomingDashboardEvent[];
  instagramUrl: string;
  copy: LandingCopy["events"];
  locale: string;
}) {
  if (events.length === 0) {
    return (
      <section className="ksr-evs" id="events">
        <div className="ksr-evhdr">
          <div>
            <div className="ksr-eb ksr-rev">
              <span className="ksr-ebn">02</span> {copy.eyebrow}
            </div>
            <h2 className="ksr-sh ksr-rev">
              {copy.titleLine1}
              <br />
              {copy.titleLine2}
            </h2>
          </div>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="ksr-alink">
            {copy.allEvents}
          </a>
        </div>
        <p className="ksr-pbody ksr-rev">{copy.emptyBody}</p>
      </section>
    );
  }

  const [featured, ...rest] = events;

  return (
    <section className="ksr-evs" id="events">
      <div className="ksr-evhdr">
        <div>
          <div className="ksr-eb ksr-rev">
            <span className="ksr-ebn">02</span> {copy.eyebrow}
          </div>
          <h2 className="ksr-sh ksr-rev">
            {copy.titleLine1}
            <br />
            {copy.titleLine2}
          </h2>
        </div>
        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="ksr-alink">
          {copy.allEvents}
        </a>
      </div>
      <div className="ksr-egrid ksr-rev">
        <EventCard
          href={`/e/${featured.shareSlug}`}
          featured
          tag={copy.featured}
          date={formatEventWhen(featured.startsAt, locale)}
          title={featured.title}
          description={featured.description ?? undefined}
          big={eventBigLabel(featured.distanceKm, featured.activityType, copy.km)}
          meta={
            <>
              {featured.meetingPointName ? (
                <MetaItem>{featured.meetingPointName}</MetaItem>
              ) : null}
              {distanceLabel(featured.distanceKm, copy.km) ? (
                <MetaItem>{distanceLabel(featured.distanceKm, copy.km)}</MetaItem>
              ) : null}
              <MetaItem>
                {featured.activityTypeEmoji ? `${featured.activityTypeEmoji} ` : ""}
                {featured.activityType}
              </MetaItem>
            </>
          }
        />
        {rest.map((e) => (
          <EventCard
            key={e.id}
            href={`/e/${e.shareSlug}`}
            date={formatEventWhen(e.startsAt, locale)}
            title={e.title}
            big={eventBigLabel(e.distanceKm, e.activityType, copy.km)}
            meta={
              <>
                {e.meetingPointName ? <MetaItem>{e.meetingPointName}</MetaItem> : null}
                {distanceLabel(e.distanceKm, copy.km) ? (
                  <MetaItem>{distanceLabel(e.distanceKm, copy.km)}</MetaItem>
                ) : null}
                <MetaItem>
                  {e.activityTypeEmoji ? `${e.activityTypeEmoji} ` : ""}
                  {e.activityType}
                </MetaItem>
              </>
            }
          />
        ))}
      </div>
    </section>
  );
}

export async function SitePage({
  upcomingEvents,
  instagramUrl,
  whatsappUrl,
  memberCount,
  runStats,
}: SitePageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const loggedIn = Boolean(session?.user);
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.landing;
  const hero = t.hero;
  const marqueeItems = [...t.marquee, ...t.marquee];
  const memberCountLabel = `${memberCount.target}${memberCount.plus ? "+" : ""}`;
  const mediaTitle1 = t.media.titleLine1.replace("{count}", memberCountLabel);
  const statsBar = [
    // Active members — hidden for now.
    // {
    //   label: t.stats.members.label,
    //   sub: t.stats.members.sub,
    //   target: memberCount.target,
    //   plus: memberCount.plus,
    // },
    {
      label: t.stats.runsPerYear.label,
      sub: t.stats.runsPerYear.sub,
      target: runStats.runsThisYear,
      plus: false,
    },
    {
      label: t.stats.kmLogged.label,
      sub: t.stats.kmLogged.sub,
      target: runStats.totalKm.target,
      plus: runStats.totalKm.plus,
    },
    // Years of movement — hidden for now (shows “1” in 2026 even though we started mid-year).
    // {
    //   label: t.stats.years.label,
    //   sub: t.stats.years.sub,
    //   target: runStats.yearsActive,
    //   plus: false,
    // },
  ];

  return (
    <div className={`ksr-site ${ksrFontClassName}`}>
      <SitePageMotion />

      <section className="ksr-hero">
        <div className="ksr-hero-bg" aria-hidden>
          <Image
            src="/ksr_group_photo_reversed.jpeg"
            alt=""
            fill
            priority
            quality={90}
            sizes="100vw"
            className="ksr-hero-bg-img"
          />
          <div className="ksr-hero-overlay" />
        </div>
        <div className="ksr-hstripe" aria-hidden />
        <HeroMountainSvg className="ksr-hmtn" />
        <div className="ksr-hero-inner">
          <div className="ksr-heyebrow">{hero.est}</div>
          <h1 className="ksr-hhead">
            {hero.titleLine1}
            <br />
            <span className="ksr-ho">{hero.titleLine2}</span>
            <br />
            <span className="ksr-hr">{hero.titleLine3}</span>
          </h1>
        </div>
        <div className="ksr-hero-bottom">
          <blockquote className="ksr-hquote ksr-hero-quote">
            <span className="ksr-hquote-glyph" aria-hidden="true">
              &ldquo;
            </span>
            <p>{hero.tagline}</p>
          </blockquote>
          <div className="ksr-hero-foot">
            <div className="ksr-hctas">
              {!loggedIn ? (
                <Link href="/register" className="ksr-btn-red">
                  {hero.joinClub}
                </Link>
              ) : null}
              <a href="#events" className="ksr-btn-out">
                {hero.nextRun}
              </a>
            </div>
          </div>
        </div>
        <div className="ksr-hscroll">{hero.scroll}</div>
      </section>

      <div className="ksr-mwrap" aria-hidden>
        <div className="ksr-mtrack">
          {marqueeItems.map((item, index) => (
            <div key={`marquee-${index}`} className="ksr-mitem">
              {item} <span className="ksr-mpip" />
            </div>
          ))}
        </div>
      </div>

      <div className="ksr-sbar">
        {statsBar.map((stat, i) => (
          <div
            key={stat.label}
            className="ksr-si ksr-rev"
            style={i > 0 ? { transitionDelay: `${i * 0.1}s` } : undefined}
          >
            <div className="ksr-snum">
              <span className="ksr-counter" data-target={stat.target}>
                0
              </span>
              {stat.plus ? <span className="ksr-splus">+</span> : null}
            </div>
            <div className="ksr-slabel">{stat.label}</div>
            <div className="ksr-ssub">{stat.sub}</div>
          </div>
        ))}
      </div>

      <section className="ksr-phi" id="about">
        <div>
          <div className="ksr-eb ksr-rev">
            <span className="ksr-ebn">01</span> {t.philosophy.eyebrow}
          </div>
          <h2 className="ksr-sh ksr-rev" style={{ marginBottom: 28 }}>
            {t.philosophy.titleLine1}
            <br />
            {t.philosophy.titleLine2}
          </h2>
          <p className="ksr-pbody ksr-rev">{t.philosophy.body1}</p>
          <p className="ksr-pbody ksr-rev">{t.philosophy.body2}</p>
          <div className="ksr-pvals ksr-rev">
            {t.philosophy.values.map((value, i) => (
              <div key={value} className="ksr-vrow">
                <span className="ksr-vi">{String(i + 1).padStart(2, "0")}</span>
                <span className="ksr-vn">{value}</span>
                <span className="ksr-va">→</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ksr-pvis ksr-revr">
          <div className="ksr-pbadge">
            <div className="ksr-pblab">{t.philosophy.founderLabel}</div>
            <p className="ksr-pbquote">&ldquo;{t.philosophy.founderQuote}&rdquo;</p>
          </div>
          <Image
            src="/running_group_2.jpeg"
            alt={t.philosophy.imageAlt}
            fill
            sizes="(max-width: 900px) 100vw, 42vw"
            className="ksr-pimg"
          />
          <div className="ksr-pvbg" aria-hidden>
            KSR
          </div>
          <div className="ksr-pmtn" aria-hidden>
            <PhilosophyMountainSvg />
          </div>

        </div>
      </section>

      <EventsSection
        events={upcomingEvents}
        instagramUrl={instagramUrl}
        copy={t.events}
        locale={locale}
      />

      <section className="ksr-merch" id="merch">
        <div className="ksr-mhdr">
          <div>
            <div className="ksr-eb ksr-rev">
              <span className="ksr-ebn">03</span> {t.merch.eyebrow}
            </div>
            <h2 className="ksr-sh ksr-rev">
              {t.merch.titleLine1}
              <br />
              {t.merch.titleLine2}
            </h2>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="ksr-alink">
            {t.merch.contactDetails}
          </a>
        </div>
        <div className="ksr-mgrid ksr-rev">
          <article className="ksr-mcard">
            <div className="ksr-mimg ksr-mimg-photo">
              <Image
                src={MERCH_TSHIRT_IMAGE}
                alt={t.merch.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="ksr-mphoto"
              />
            </div>
            <div className="ksr-minfo">
              <div className="ksr-mcat">{t.merch.category}</div>
              <div className="ksr-mname">{t.merch.productName}</div>
              <div className="ksr-mrow">
                <span className="ksr-msizes">{t.merch.sizes}</span>
              </div>
            </div>
          </article>
        </div>
        <div className="ksr-mctarow ksr-rev">
          <p className="ksr-mannounce">{t.merch.announce}</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="ksr-btn-red ksr-btn-green">
            {t.merch.joinWhatsappGroup}
          </a>
        </div>
      </section>

      <section className="ksr-comm" id="media">
        <div className="ksr-commhdr">
          <div
            className="ksr-eb ksr-rev"
            style={{ justifyContent: "center", marginBottom: 16 }}
          >
            <span className="ksr-ebn">04</span> {t.media.eyebrow}
          </div>
          <h2 className="ksr-sh ksr-rev" style={{ color: "var(--ksr-white)", textAlign: "center" }}>
            {mediaTitle1}
            <br />
            {t.media.titleLine2}
          </h2>
        </div>
        <MediaReelGrid items={MEDIA_REEL_ITEMS} />
        <div className="ksr-commcta">
          <p className="ksr-commctatxt">{t.media.body}</p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ksr-btn-ghost"
          >
            {t.media.instagramHandle}
          </a>
        </div>
      </section>

      <section className="ksr-found" id="team">
        <div className="ksr-foundhdr">
          <div>
            <div className="ksr-eb ksr-rev">
              <span className="ksr-ebn">05</span> {t.team.eyebrow}
            </div>
            <h2 className="ksr-sh ksr-rev" style={{ fontSize: "clamp(48px,6vw,68px)" }}>
              {t.team.titleLine1}
              <br />
              {t.team.titleLine2}
              <br />
              {t.team.titleLine3}
            </h2>
          </div>
          <p
            className="ksr-rev"
            style={{
              maxWidth: 280,
              fontSize: 13,
              lineHeight: 1.75,
              color: "var(--ksr-mid-gray)",
              fontWeight: 300,
            }}
          >
            {t.team.intro}
          </p>
        </div>
        <div className="ksr-fgrid">
          {t.team.members.map((member, i) => (
            <div
              key={TEAM_INITIALS[i]}
              className="ksr-fcard ksr-rev"
              style={i > 0 ? { transitionDelay: `${(i % 3) * 0.1}s` } : undefined}
            >
              <div className="ksr-favatar">{TEAM_INITIALS[i]}</div>
              <div>
                <div className="ksr-fname">
                  {member.nameLine1}
                  <br />
                  {member.nameLine2}
                </div>
                <div className="ksr-frole">{member.role}</div>
              </div>
              <p className="ksr-fbio">{member.bio}</p>
              <div className="ksr-fsince">{member.since}</div>
              <div className="ksr-fnum">{String(i + 1).padStart(2, "0")}</div>
            </div>
          ))}
          <div className="ksr-fcard ksr-fcard-cta ksr-rev" style={{ transitionDelay: "0.28s" }}>
            <div
              className="ksr-favatar"
              style={{
                background: "rgba(255,255,255,.12)",
                borderColor: "rgba(255,255,255,.2)",
                color: "white",
              }}
            >
              ?
            </div>
            <div>
              <div className="ksr-fname" style={{ color: "var(--ksr-white)" }}>
                {t.team.cta.titleLine1}
                <br />
                {t.team.cta.titleLine2}
              </div>
              <div className="ksr-frole" style={{ color: "rgba(255,255,255,.6)" }}>
                {t.team.cta.role}
              </div>
            </div>
            <p className="ksr-fbio" style={{ color: "rgba(255,255,255,.65)" }}>
              {t.team.cta.bio}
            </p>
            {!loggedIn ? (
              <Link href="/register" className="ksr-btn-ghost" style={{ width: "fit-content" }}>
                {t.team.cta.button}
              </Link>
            ) : null}
            <div className="ksr-fnum" style={{ color: "rgba(255,255,255,.05)" }}>
              ∞
            </div>
          </div>
        </div>
      </section>

      <section className="ksr-join" id="join">
        <div>
          <h2 className="ksr-joinh">
            {t.join.titleLine1}
            <br />
            {t.join.titleLine2}
            <br />
            {t.join.titleLine3}
          </h2>
        </div>
        <div>
          <p className="ksr-joinbody">{t.join.body}</p>
          {!loggedIn ? (
            <Link href="/register" className="ksr-btn-red" style={{ display: "inline-block" }}>
              {t.join.cta}
            </Link>
          ) : null}
          <div className="ksr-joinperks">
            {t.join.perks.map((perk) => (
              <span key={perk} className="ksr-perk">
                {perk}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="ksr-footer">
        <div className="ksr-ftop">
          <div>
            <div className="ksr-flogo">KSR</div>
            <p className="ksr-fdesc">
              {t.footer.brandDesc}
            </p>
          </div>
          <div>
            <div className="ksr-fct">{t.footer.columns.runs.title}</div>
            <div className="ksr-flinks">
              <a href="#events">{t.footer.columns.runs.upcoming}</a>
              {!loggedIn ? (
                <>
                  <Link href="/register">{t.footer.columns.runs.join}</Link>
                  <Link href="/login">{t.footer.columns.runs.signIn}</Link>
                </>
              ) : (
                <Link href="/dashboard">{t.nav.dashboard}</Link>
              )}
            </div>
          </div>
          <div>
            <div className="ksr-fct">{t.footer.columns.community.title}</div>
            <div className="ksr-flinks">
              <a href="#join">{t.footer.columns.community.join}</a>
              <a href="#about">{t.footer.columns.community.story}</a>
              <a href="#team">{t.footer.columns.community.team}</a>
              <a href="#merch">{t.footer.columns.community.merch}</a>
            </div>
          </div>
          <div>
            <div className="ksr-fct">{t.footer.columns.connect.title}</div>
            <div className="ksr-flinks">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                {t.footer.columns.connect.instagram}
              </a>
              {!loggedIn ? (
                <Link href="/register">{t.footer.columns.connect.createAccount}</Link>
              ) : null}
            </div>
          </div>
        </div>
        <div className="ksr-fbot">
          <div className="ksr-fcopy">
            © {new Date().getFullYear()} Kayseri Social Run. {t.footer.rights}
          </div>
          <div className="ksr-floc">{t.footer.location}</div>
        </div>
      </footer>
    </div>
  );
}
