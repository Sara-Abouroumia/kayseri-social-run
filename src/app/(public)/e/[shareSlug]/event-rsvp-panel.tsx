"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import type { EventSchedulePhase } from "@/lib/event-schedule-phase";
import type { RegistrationQuestionDraft } from "@/lib/event-registration";
import type { ParticipantStatus } from "@/lib/event-participation";
import type { Messages } from "@/i18n/messages/en";

import { EventRegistrationFields } from "./event-registration-fields";
import { LeaveEventForm } from "./leave-event-form";
import {
  joinEventAction,
  leaveEventAction,
  type RsvpActionState,
} from "./rsvp-actions";

type RsvpCopy = Pick<
  Messages["eventPublic"],
  | "signUp"
  | "eventFinished"
  | "eventFinishedBlurb"
  | "eventOngoing"
  | "eventOngoingBlurb"
  | "signedUp"
  | "cancelSignup"
  | "cancelSignupConfirm"
  | "leaveWaitlistConfirm"
  | "cancelPendingConfirm"
  | "confirmCancelYes"
  | "keepRegistration"
  | "updating"
  | "waitlistBlurb"
  | "leaveWaitlist"
  | "signMeUp"
  | "saving"
  | "signInToJoin"
  | "signIn"
  | "alreadyHaveAccount"
  | "pendingBlurb"
  | "cancelPending"
  | "rejectedBlurb"
  | "registrationYes"
  | "registrationNo"
  | "signUpSectionHeading"
>;

const registerBtnClass =
  "inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 sm:w-auto sm:min-w-[10rem]";

type Props = {
  shareSlug: string;
  initialStatus: ParticipantStatus | null;
  schedulePhase: EventSchedulePhase;
  canRsvp: boolean;
  blockReason?: string | null;
  registrationQuestions: RegistrationQuestionDraft[];
  registerHref: string;
  loginHref: string;
  hasSession: boolean;
  copy: RsvpCopy;
};

function flashMessage(a?: RsvpActionState, b?: RsvpActionState) {
  const m = a?.message ?? b?.message;
  if (!m) return null;
  const ok = a?.ok ?? b?.ok;
  return { m, ok };
}

function sectionTitle(copy: RsvpCopy, phase: EventSchedulePhase): string {
  if (phase === "finished") return copy.eventFinished;
  if (phase === "ongoing") return copy.eventOngoing;
  return copy.signUp;
}

function sectionTone(phase: EventSchedulePhase): string {
  if (phase === "finished") {
    return "border-zinc-200 bg-zinc-100";
  }
  if (phase === "ongoing") {
    return "border-emerald-200 bg-emerald-50/80";
  }
  return "border-zinc-200 bg-zinc-50";
}

export function EventRsvpPanel({
  shareSlug,
  initialStatus,
  schedulePhase,
  canRsvp,
  blockReason,
  registrationQuestions,
  registerHref,
  loginHref,
  hasSession,
  copy,
}: Props) {
  const router = useRouter();
  const [joinState, joinAction, joinPending] = useActionState(joinEventAction, undefined);
  const [leaveState, leaveAction, leavePending] = useActionState(leaveEventAction, undefined);

  useEffect(() => {
    if (joinState?.ok || leaveState?.ok) {
      router.refresh();
    }
  }, [joinState?.ok, leaveState?.ok, router]);

  const flash = flashMessage(joinState, leaveState);

  const active =
    initialStatus === "going"
      ? "going"
      : initialStatus === "waitlisted"
        ? "waitlisted"
        : initialStatus === "pending"
          ? "pending"
          : initialStatus === "rejected"
            ? "rejected"
            : "none";

  const signupsClosed = schedulePhase === "finished" || schedulePhase === "ongoing";
  const showJoinForm = canRsvp && active === "none";
  const showGuestRegister =
    !hasSession && active === "none" && schedulePhase === "upcoming" && !signupsClosed;
  const hasQuestions = registrationQuestions.length > 0;
  const showRegisterCta = showGuestRegister || (showJoinForm && !hasQuestions);
  const showQuestionForm = showJoinForm && hasQuestions;

  const showManagePanel =
    !!flash?.m ||
    active === "going" ||
    active === "waitlisted" ||
    active === "pending" ||
    active === "rejected" ||
    showQuestionForm ||
    (active === "none" && !!blockReason && hasSession && !showRegisterCta);

  if (
    !showRegisterCta &&
    !showManagePanel &&
    signupsClosed &&
    active === "none"
  ) {
    return (
      <section
        className={`rounded-xl border p-5 shadow-sm sm:p-6 ${sectionTone(schedulePhase)}`}
        aria-labelledby="event-signup-heading"
      >
        <h2 id="event-signup-heading" className="text-lg font-semibold text-zinc-900">
          {sectionTitle(copy, schedulePhase)}
        </h2>
        <p className="mt-3 text-sm text-zinc-700">
          {schedulePhase === "finished" ? copy.eventFinishedBlurb : copy.eventOngoingBlurb}
        </p>
      </section>
    );
  }

  if (!showRegisterCta && !showManagePanel && active === "none") {
    return null;
  }

  const panelHeading =
    schedulePhase === "upcoming"
      ? copy.signUpSectionHeading
      : sectionTitle(copy, schedulePhase);

  return (
    <section
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
      aria-labelledby="event-signup-heading"
    >
      <h2 id="event-signup-heading" className="text-lg font-semibold text-zinc-900">
        {panelHeading}
      </h2>

      {showQuestionForm ? (
        <div className={`mt-4 rounded-lg border p-4 ${sectionTone(schedulePhase)}`}>
          {flash?.m ? (
            <p
              className={`mb-4 rounded-md border px-3 py-2 text-sm ${
                flash.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
              role="status"
            >
              {flash.m}
            </p>
          ) : null}
          <form action={joinAction}>
            <input type="hidden" name="shareSlug" value={shareSlug} />
            <EventRegistrationFields
              questions={registrationQuestions}
              labels={{
                yes: copy.registrationYes,
                no: copy.registrationNo,
                requiredMark: "*",
              }}
            />
            <button type="submit" disabled={joinPending} className={`mt-6 ${registerBtnClass}`}>
              {joinPending ? copy.saving : copy.signMeUp}
            </button>
          </form>
        </div>
      ) : null}

      {showRegisterCta ? (
        <div className="mt-4 flex flex-col items-stretch gap-3 sm:items-end">
          {flash?.m ? (
            <p
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                flash.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
              role="status"
            >
              {flash.m}
            </p>
          ) : null}
          {showGuestRegister ? (
            <Link href={registerHref} className={registerBtnClass}>
              {copy.signMeUp}
            </Link>
          ) : (
            <form action={joinAction} className="w-full sm:w-auto">
              <input type="hidden" name="shareSlug" value={shareSlug} />
              <button type="submit" disabled={joinPending} className={registerBtnClass}>
                {joinPending ? copy.saving : copy.signMeUp}
              </button>
            </form>
          )}
          {showGuestRegister ? (
            <p className="text-center text-sm text-zinc-600 sm:text-right">
              {copy.alreadyHaveAccount}{" "}
              <Link href={loginHref} className="font-medium text-zinc-900 underline hover:text-zinc-700">
                {copy.signIn}
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      {showManagePanel && !showQuestionForm ? (
        <div
          className={`mt-4 rounded-lg border p-4 ${sectionTone(schedulePhase)}`}
        >
          {flash?.m && !showRegisterCta ? (
            <p
              className={`mb-3 rounded-md border px-3 py-2 text-sm ${
                flash.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
              role="status"
            >
              {flash.m}
            </p>
          ) : null}

          {active === "going" ? (
            <div className="space-y-3">
              {!signupsClosed ? (
                <LeaveEventForm
                  shareSlug={shareSlug}
                  leaveAction={leaveAction}
                  leavePending={leavePending}
                  copy={{
                    actionLabel: copy.cancelSignup,
                    confirmMessage: copy.cancelSignupConfirm,
                    confirmYes: copy.confirmCancelYes,
                    keepRegistration: copy.keepRegistration,
                    updating: copy.updating,
                  }}
                />
              ) : null}
            </div>
          ) : active === "waitlisted" ? (
            <div className="space-y-3">
              {!signupsClosed ? (
                <LeaveEventForm
                  shareSlug={shareSlug}
                  leaveAction={leaveAction}
                  leavePending={leavePending}
                  copy={{
                    actionLabel: copy.leaveWaitlist,
                    confirmMessage: copy.leaveWaitlistConfirm,
                    confirmYes: copy.confirmCancelYes,
                    keepRegistration: copy.keepRegistration,
                    updating: copy.updating,
                  }}
                />
              ) : null}
            </div>
          ) : active === "pending" ? (
            <div className="space-y-3">
              {!signupsClosed ? (
                <LeaveEventForm
                  shareSlug={shareSlug}
                  leaveAction={leaveAction}
                  leavePending={leavePending}
                  copy={{
                    actionLabel: copy.cancelPending,
                    confirmMessage: copy.cancelPendingConfirm,
                    confirmYes: copy.confirmCancelYes,
                    keepRegistration: copy.keepRegistration,
                    updating: copy.updating,
                  }}
                />
              ) : null}
            </div>
          ) : active === "rejected" ? (
            <p className="text-sm text-zinc-700">{copy.rejectedBlurb}</p>
          ) : (
            <p className="text-sm text-zinc-600">{blockReason ?? copy.signInToJoin}</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
