import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { events } from "@/db/schema/events";
import { auth } from "@/lib/auth";
import { ActivityTypeDisplay } from "@/components/activity-type-display";
import {
  countParticipantsByStatus,
  getGoingCount,
  getUserParticipationStatus,
} from "@/lib/event-participation";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import type { Locale } from "@/i18n/config";
import { siteMainClass } from "@/lib/layout";
import { canEditEvent } from "@/lib/event-schedule-phase";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { isPlatformDeveloper } from "@/lib/platform-developer";
import { resolveShareImageUrl } from "@/lib/share-image-url";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import {
  listRegistrationQuestionsForEvent,
  rowsToQuestionDrafts,
} from "@/lib/event-registration-persist";

import { EventParticipationInsights } from "@/app/dashboard/admin/events/event-participation-insights";

import { BackToEventsLink } from "@/components/back-to-events-link";

import { EventFullCard } from "./event-full-card";

type Props = {
  params: Promise<{ shareSlug: string }>;
};

const eventMainNarrowClass = cn(siteMainClass, "py-20 text-center");

function formatWhen(d: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { shareSlug } = await params;
  const site = getSiteUrl();
  const pageUrl = `${site}/e/${shareSlug}`;

  const row = await db
    .select({
      title: events.title,
      description: events.description,
      coverImageUrl: events.coverImageUrl,
    })
    .from(events)
    .where(eq(events.shareSlug, shareSlug))
    .limit(1);

  if (!row[0]) return { title: dict.eventPublic.notFoundTitle };

  const { title, description, coverImageUrl } = row[0];
  const shareDescription =
    description?.trim().slice(0, 200) ||
    `${dict.eventPublic.brand} — ${title}`;

  const coverForShare = resolveShareImageUrl(coverImageUrl, site);
  const fallbackImage = `${site}/kayserisocialrun_logo.png`;
  const shareImageUrl = coverForShare ?? fallbackImage;
  const ogImages = coverForShare
    ? [{ url: shareImageUrl, width: 1200, height: 630, alt: title }]
    : [{ url: shareImageUrl, width: 512, height: 512, alt: dict.eventPublic.brand }];

  return {
    title,
    description: shareDescription,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description: shareDescription,
      url: pageUrl,
      siteName: dict.eventPublic.brand,
      type: "website",
      locale: locale === "tr" ? "tr_TR" : "en_GB",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: shareDescription,
      images: [shareImageUrl],
    },
  };
}

export default async function PublicEventPage({ params }: Props) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.eventPublic;

  const { shareSlug } = await params;
  const row = await db.select().from(events).where(eq(events.shareSlug, shareSlug)).limit(1);
  if (!row[0]) {
    return (
      <main className={eventMainNarrowClass}>
        <BackToEventsLink href="/" label={t.backToEvents} />
        <h1 className="text-xl font-semibold text-zinc-900">{t.notFoundTitle}</h1>
        <p className="mt-2 text-sm text-zinc-600">{t.notFoundBody}</p>
        <p className="mt-8">
          <Link href="/" className="text-sm font-medium text-zinc-900 underline">
            {t.footerHome}
          </Link>
        </p>
      </main>
    );
  }

  const e = row[0];
  const site = getSiteUrl();
  const nextPath = `/e/${shareSlug}`;
  const registerHref = `/register?next=${encodeURIComponent(nextPath)}`;
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const sessionUser = session?.user
    ? {
        id: session.user.id,
        emailVerified: Boolean(
          (session.user as { emailVerified?: boolean }).emailVerified,
        ),
      }
    : null;

  const goingCount = await getGoingCount(e.id);
  const waitlistCount = await countParticipantsByStatus(e.id, ["waitlisted"]);

  const participation =
    sessionUser != null ? await getUserParticipationStatus(e.id, sessionUser.id) : null;

  const signedIn = Boolean(sessionUser);
  const eventsBackHref = signedIn ? "/dashboard" : "/";

  if (e.visibility === "private" && !signedIn) {
    return (
      <main className={cn(siteMainClass, "py-16")}>
        <BackToEventsLink href={eventsBackHref} label={t.backToEvents} />
        <h1 className="text-2xl font-semibold text-zinc-900">{e.title}</h1>
        <p className="mt-4 text-sm text-zinc-600">{t.privateStub}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={registerHref}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {t.createAccount}
          </Link>
          <Link
            href={loginHref}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            {t.signIn}
          </Link>
        </div>
        <p className="mt-10 text-center text-xs text-zinc-500">
          <Link href="/" className="underline">
            {t.footerHome}
          </Link>
          {" · "}
          <span>{site}</span>
        </p>
      </main>
    );
  }

  if (e.visibility === "members_only" && !signedIn) {
    return (
      <main className={siteMainClass}>
        <BackToEventsLink href={eventsBackHref} label={t.backToEvents} />
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t.brand}</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900">{e.title}</h1>
        <p className="mt-2 text-sm text-amber-900">{t.membersTeaser}</p>
        <ul className="mt-6 space-y-2 text-sm text-zinc-700">
          <li>
            <span className="font-medium text-zinc-900">{t.when}:</span>{" "}
            {formatWhen(new Date(e.startsAt), locale)}
          </li>
          <li>
            <span className="font-medium text-zinc-900">{t.type}:</span>{" "}
            <ActivityTypeDisplay
              activityType={e.activityType}
              activityTypeEmoji={e.activityTypeEmoji}
            />
          </li>
          <li>
            <span className="font-medium text-zinc-900">{t.cost}:</span>{" "}
            {e.costKind === "paid" ? (
              e.costNotes ? (
                <span className="whitespace-pre-wrap">{e.costNotes}</span>
              ) : (
                <span className="text-zinc-500">—</span>
              )
            ) : (
              t.costFree
            )}
          </li>
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={registerHref}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {t.registerMore}
          </Link>
          <Link
            href={loginHref}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            {t.signIn}
          </Link>
        </div>
        <p className="mt-10 text-center text-xs text-zinc-500">
          <Link href="/" className="underline">
            {t.footerHome}
          </Link>
          {" · "}
          <span>{site}</span>
        </p>
      </main>
    );
  }

  const questionRows = await listRegistrationQuestionsForEvent(e.id);
  const registrationQuestions = rowsToQuestionDrafts(questionRows);

  let isAdmin = false;
  let isDeveloper = false;
  let canEditCover = false;
  if (session?.user?.id && session.user.email) {
    isAdmin = await isPlatformAdmin(session.user.id, session.user.email);
    isDeveloper = await isPlatformDeveloper(session.user.id, session.user.email);
    canEditCover = isAdmin && canEditEvent(e);
  }

  const showAdminStats = isAdmin || isDeveloper;

  return (
    <EventFullCard
      event={e}
      siteOrigin={site}
      registerHref={registerHref}
      loginHref={loginHref}
      goingCount={goingCount}
      waitlistCount={waitlistCount}
      session={sessionUser}
      participation={participation}
      registrationQuestions={registrationQuestions}
      locale={locale}
      t={t}
      canEditCover={canEditCover}
      showAdminSignupCount={showAdminStats}
      showAdminStats={showAdminStats}
      statsPanel={
        showAdminStats ? (
          <EventParticipationInsights
            eventId={e.id}
            variant="plain"
            copy={dict.eventStats}
            locale={locale}
          />
        ) : undefined
      }
      eventsBackHref={eventsBackHref}
    />
  );
}
