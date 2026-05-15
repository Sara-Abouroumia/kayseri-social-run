import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";

import { events } from "@/db/schema/events";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages/en";
import { ActivityTypeDisplay } from "@/components/activity-type-display";
import type { ParticipantStatus } from "@/lib/event-participation";
import type { RegistrationQuestionDraft } from "@/lib/event-registration";
import { siteHorizontalPadding } from "@/lib/layout";
import { cn } from "@/lib/utils";

import { EventHero } from "./event-hero";
import { EventRsvpPanel } from "./event-rsvp-panel";

const eventMainClass = cn(
  "mx-auto w-full min-w-0 max-w-2xl py-10",
  siteHorizontalPadding,
);

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
};

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
}: EventFullCardProps) {
  const now = new Date();
  const started = new Date(e.startsAt) <= now;
  const deadlinePassed = e.joinDeadlineAt ? new Date(e.joinDeadlineAt) < now : false;

  let canRsvp = false;
  let blockReason: string | null = null;

  if (!session) {
    blockReason = t.signInToJoin;
  } else if (!session.emailVerified) {
    blockReason = t.verifyToJoin;
  } else if (started) {
    blockReason = t.startedNoJoin;
  } else if (deadlinePassed) {
    blockReason = t.deadlinePassed;
  } else {
    canRsvp = true;
  }

  const initialStatus: ParticipantStatus | null =
    participation && participation !== "cancelled" ? participation : null;

  const capLabel =
    e.maxParticipants != null
      ? t.signedUpCountMax
          .replace("{going}", String(goingCount))
          .replace("{max}", String(e.maxParticipants))
      : t.signedUpCount.replace("{count}", String(goingCount));

  const rsvpCopy = {
    signUp: t.signUp,
    signedUp: t.signedUp,
    cancelSignup: t.cancelSignup,
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
  };

  return (
    <main className={eventMainClass}>
      <EventHero
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
      />

      <p className="mt-6 text-sm text-zinc-700">
        {capLabel}
        {waitlistCount > 0 ? ` · ${waitlistCount} ${t.onWaitlist}` : null}
      </p>

      {e.visibility !== "public" ? (
        <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {e.visibility === "members_only" ? t.membersOnlyBadge : t.privateBadge}
        </p>
      ) : null}

      <div className="mt-8 max-w-none">
        <dl className="space-y-3 text-sm">
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
      </div>

      <EventRsvpPanel
        key={initialStatus ?? `open-${goingCount}-${waitlistCount}`}
        shareSlug={e.shareSlug}
        initialStatus={initialStatus}
        canRsvp={canRsvp}
        blockReason={blockReason}
        registrationQuestions={registrationQuestions}
        copy={rsvpCopy}
      />

      {!session ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={registerHref}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {t.createAccount}
          </Link>
          <Link
            href={loginHref}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            {t.signIn}
          </Link>
        </div>
      ) : null}

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
