import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";
import type { ReactNode } from "react";

import { events } from "@/db/schema/events";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages/en";
import { ActivityTypeDisplay } from "@/components/activity-type-display";
import { BackToEventsLink } from "@/components/back-to-events-link";
import type { ParticipantStatus } from "@/lib/event-participation";
import type { RegistrationQuestionDraft } from "@/lib/event-registration";
import { getEventSchedulePhase } from "@/lib/event-schedule-phase";
import type { HeroStatusTone } from "./event-hero";
import { siteMainClass } from "@/lib/layout";

import { EventAdminViewShell } from "./event-admin-view-shell";
import { EventHero } from "./event-hero";
import { EventRsvpPanel } from "./event-rsvp-panel";
import { EventSignupTopBar } from "./event-signup-top-bar";

export type EventFullCardProps = {
  event: InferSelectModel<typeof events>;
  siteOrigin: string;
  registerHref: string;
  loginHref: string;
  goingCount: number;
  waitlistCount: number;
  session: { id: string; emailVerified: boolean } | null;
  participation: ParticipantStatus | null;
  registrationQuestions: RegistrationQuestionDraft[];
  locale: Locale;
  t: Messages["eventPublic"];
  canEditCover: boolean;
  showAdminSignupCount: boolean;
  showAdminStats: boolean;
  statsPanel?: ReactNode;
  eventsBackHref: string;
};

function resolveHeroStatus(
  schedulePhase: ReturnType<typeof getEventSchedulePhase>,
  participation: ParticipantStatus | null,
  t: EventFullCardProps["t"],
): { label: string; tone: HeroStatusTone } {
  if (schedulePhase === "finished") {
    return { label: t.eventFinished, tone: "finished" };
  }
  if (schedulePhase === "ongoing") {
    return { label: t.eventOngoing, tone: "ongoing" };
  }
  if (participation === "going") {
    return { label: t.eventStatusJoined, tone: "joined" };
  }
  if (participation === "waitlisted") {
    return { label: t.eventStatusWaitlistedBadge, tone: "waitlisted" };
  }
  if (participation === "pending") {
    return { label: t.eventStatusPendingBadge, tone: "pending" };
  }
  return { label: t.eventStatusOpen, tone: "open" };
}

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

export function EventFullCard({
  event: e,
  siteOrigin,
  registerHref,
  loginHref,
  goingCount,
  waitlistCount,
  session,
  participation,
  registrationQuestions,
  locale,
  t,
  canEditCover,
  showAdminSignupCount,
  showAdminStats,
  statsPanel,
  eventsBackHref,
}: EventFullCardProps) {
  const now = new Date();
  const schedulePhase = getEventSchedulePhase(e, now);
  const deadlinePassed = e.joinDeadlineAt ? new Date(e.joinDeadlineAt) < now : false;

  let canRsvp = false;
  let blockReason: string | null = null;

  if (schedulePhase === "finished") {
    blockReason = t.eventFinishedBlurb;
  } else if (schedulePhase === "ongoing") {
    blockReason = t.eventOngoingBlurb;
  } else if (!session) {
    blockReason = t.signInToJoin;
  } else if (!session.emailVerified) {
    blockReason = t.verifyToJoin;
  } else if (deadlinePassed) {
    blockReason = t.deadlinePassed;
  } else {
    canRsvp = true;
  }

  const initialStatus: ParticipantStatus | null =
    participation && participation !== "cancelled" ? participation : null;

  const heroStatus = resolveHeroStatus(schedulePhase, initialStatus, t);

  const capLabel =
    e.maxParticipants != null
      ? t.signedUpCountMax
          .replace("{going}", String(goingCount))
          .replace("{max}", String(e.maxParticipants))
      : t.signedUpCount.replace("{count}", String(goingCount));

  const rsvpCopy = {
    signUp: t.signUp,
    eventFinished: t.eventFinished,
    eventFinishedBlurb: t.eventFinishedBlurb,
    eventOngoing: t.eventOngoing,
    eventOngoingBlurb: t.eventOngoingBlurb,
    signedUp: t.signedUp,
    cancelSignup: t.cancelSignup,
    cancelSignupConfirm: t.cancelSignupConfirm,
    leaveWaitlistConfirm: t.leaveWaitlistConfirm,
    cancelPendingConfirm: t.cancelPendingConfirm,
    confirmCancelYes: t.confirmCancelYes,
    keepRegistration: t.keepRegistration,
    updating: t.updating,
    waitlistBlurb: t.waitlistBlurb,
    leaveWaitlist: t.leaveWaitlist,
    signMeUp: t.signMeUp,
    saving: t.saving,
    signInToJoin: t.signInToJoin,
    pendingBlurb: t.pendingBlurb,
    cancelPending: t.cancelPending,
    rejectedBlurb: t.rejectedBlurb,
    registrationYes: t.registrationYes,
    registrationNo: t.registrationNo,
    signUpSectionHeading: t.signUpSectionHeading,
    signIn: t.signIn,
    alreadyHaveAccount: t.alreadyHaveAccount,
  };

  const topBarProps = {
    capLabel,
    waitlistSuffix:
      waitlistCount > 0 ? (`· ${waitlistCount} ${t.onWaitlist}` as const) : null,
    showAdminSignupCount,
  };

  const eventDetailsSection = (
    <section
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
      aria-labelledby="event-details-heading"
    >
      <h2 id="event-details-heading" className="text-lg font-semibold text-zinc-900">
        {t.eventDetailsHeading}
      </h2>

      {e.visibility !== "public" ? (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {e.visibility === "members_only" ? t.membersOnlyBadge : t.privateBadge}
        </p>
      ) : null}

      {e.description?.trim() ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
          {e.description.trim()}
        </p>
      ) : null}

      <dl className="mt-5 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-zinc-900">{t.activityType}</dt>
            <dd className="text-zinc-700">
              <ActivityTypeDisplay
                activityType={e.activityType}
                activityTypeEmoji={e.activityTypeEmoji}
              />
            </dd>
          </div>
          {e.meetingPointName || e.meetingPointAddress ? (
            <div>
              <dt className="font-medium text-zinc-900">{t.meetingPoint}</dt>
              <dd className="text-zinc-700">
                {e.meetingPointName ? <>{e.meetingPointName}</> : null}
                {e.meetingPointName && e.meetingPointAddress ? <br /> : null}
                {e.meetingPointAddress ? <>{e.meetingPointAddress}</> : null}
              </dd>
            </div>
          ) : null}
          {e.distanceKm ? (
            <div>
              <dt className="font-medium text-zinc-900">{t.distance}</dt>
              <dd className="text-zinc-700">
                {String(e.distanceKm)} {t.km}
              </dd>
            </div>
          ) : null}
          {e.paceLabel ? (
            <div>
              <dt className="font-medium text-zinc-900">{t.pace}</dt>
              <dd className="text-zinc-700">{e.paceLabel}</dd>
            </div>
          ) : null}
          {e.difficulty ? (
            <div>
              <dt className="font-medium text-zinc-900">{t.difficulty}</dt>
              <dd className="text-zinc-700">{e.difficulty}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-medium text-zinc-900">{t.cost}</dt>
            <dd className="text-zinc-700">
              {e.costKind === "paid" ? (
                e.costNotes ? (
                  <span className="whitespace-pre-wrap">{e.costNotes}</span>
                ) : (
                  <span className="text-zinc-500">—</span>
                )
              ) : (
                t.costFree
              )}
            </dd>
          </div>
          {e.requiredItems ? (
            <div>
              <dt className="font-medium text-zinc-900">{t.requiredItems}</dt>
              <dd className="whitespace-pre-wrap text-zinc-700">{e.requiredItems}</dd>
            </div>
          ) : null}
          {e.coordinatorName ? (
            <div>
              <dt className="font-medium text-zinc-900">{t.coordinator}</dt>
              <dd className="text-zinc-700">{e.coordinatorName}</dd>
            </div>
          ) : null}
          {e.maxParticipants != null ? (
            <div>
              <dt className="font-medium text-zinc-900">{t.maxParticipants}</dt>
              <dd className="text-zinc-700">{e.maxParticipants}</dd>
            </div>
          ) : null}
          {e.joinDeadlineAt ? (
            <div>
              <dt className="font-medium text-zinc-900">{t.joinDeadline}</dt>
              <dd className="text-zinc-700">{formatWhen(new Date(e.joinDeadlineAt), locale)}</dd>
            </div>
          ) : null}
          {e.weatherInfo ? (
            <div>
              <dt className="font-medium text-zinc-900">{t.weather}</dt>
              <dd className="whitespace-pre-wrap text-zinc-700">{e.weatherInfo}</dd>
            </div>
          ) : null}
      </dl>
    </section>
  );

  const eventBody = (
    <>
      {eventDetailsSection}

      <EventRsvpPanel
        key={`${schedulePhase}-${initialStatus ?? "none"}-${goingCount}-${waitlistCount}`}
        shareSlug={e.shareSlug}
        initialStatus={initialStatus}
        schedulePhase={schedulePhase}
        canRsvp={canRsvp}
        blockReason={blockReason}
        registrationQuestions={registrationQuestions}
        registerHref={registerHref}
        loginHref={loginHref}
        hasSession={!!session}
        copy={rsvpCopy}
      />
    </>
  );

  return (
    <main className={siteMainClass}>
      <BackToEventsLink href={eventsBackHref} label={t.backToEvents} />
      <EventHero
        key={`${heroStatus.tone}-${initialStatus ?? "none"}`}
        eventId={e.id}
        initialUrl={e.coverImageUrl}
        canEdit={canEditCover}
        editCoverLabel={t.editCoverImage}
        addCoverLabel={t.addCoverImage}
        uploadFailed={t.coverUploadFailed}
        brand={t.brand}
        title={e.title}
        dateLine={`${formatWhen(new Date(e.startsAt), locale)}${
          e.endsAt ? ` – ${formatWhen(new Date(e.endsAt), locale)}` : ""
        }`}
        description={e.description}
        showDescriptionInHero={false}
        statusLabel={heroStatus.label}
        statusTone={heroStatus.tone}
      />

      <div className="mt-6 space-y-6 sm:mt-8">
      {showAdminStats && statsPanel ? (
        <EventAdminViewShell
          viewStatisticsLabel={t.viewStatistics}
          viewEventDetailsLabel={t.viewEventDetails}
          editActivityHref={`/dashboard/admin/events/${e.id}/edit`}
          editActivityLabel={t.editActivity}
          statsPanel={statsPanel}
          topBar={topBarProps}
        >
          {eventBody}
        </EventAdminViewShell>
      ) : (
        <div className="space-y-6">
          <EventSignupTopBar
            {...topBarProps}
            trailing={
              canEditCover ? (
                <Link
                  href={`/dashboard/admin/events/${e.id}/edit`}
                  className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
                >
                  {t.editActivity}
                </Link>
              ) : undefined
            }
          />
          <div className="space-y-8">{eventBody}</div>
        </div>
      )}
      </div>

      <p className="mt-10 text-center text-xs text-zinc-500">
        <Link href="/dashboard" className="underline">
          {t.footerDashboard}
        </Link>
        {" · "}
        <Link href="/" className="underline">
          {t.footerHome}
        </Link>
        {" · "}
        <span>{siteOrigin}</span>
      </p>
    </main>
  );
}
