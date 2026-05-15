"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import type { RegistrationQuestionDraft } from "@/lib/event-registration";
import type { ParticipantStatus } from "@/lib/event-participation";
import type { Messages } from "@/i18n/messages/en";

import { EventRegistrationFields } from "./event-registration-fields";
import {
  joinEventAction,
  leaveEventAction,
  type RsvpActionState,
} from "./rsvp-actions";

type RsvpCopy = Pick<
  Messages["eventPublic"],
  | "signUp"
  | "signedUp"
  | "cancelSignup"
  | "updating"
  | "waitlistBlurb"
  | "leaveWaitlist"
  | "signMeUp"
  | "saving"
  | "signInToJoin"
  | "pendingBlurb"
  | "cancelPending"
  | "rejectedBlurb"
  | "registrationYes"
  | "registrationNo"
>;

type Props = {
  shareSlug: string;
  initialStatus: ParticipantStatus | null;
  canRsvp: boolean;
  blockReason?: string | null;
  registrationQuestions: RegistrationQuestionDraft[];
  copy: RsvpCopy;
};

function flashMessage(a?: RsvpActionState, b?: RsvpActionState) {
  const m = a?.message ?? b?.message;
  if (!m) return null;
  const ok = a?.ok ?? b?.ok;
  return { m, ok };
}

export function EventRsvpPanel({
  shareSlug,
  initialStatus,
  canRsvp,
  blockReason,
  registrationQuestions,
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

  return (
    <section className="mt-10 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <h2 className="text-sm font-semibold text-zinc-900">{copy.signUp}</h2>

      {flash?.m ? (
        <p
          className={`mt-2 rounded-md border px-3 py-2 text-sm ${
            flash.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          role="status"
        >
          {flash.m}
        </p>
      ) : null}

      {!canRsvp ? (
        <p className="mt-2 text-sm text-zinc-600">{blockReason ?? copy.signInToJoin}</p>
      ) : active === "going" ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-zinc-700">{copy.signedUp}</p>
          <form action={leaveAction}>
            <input type="hidden" name="shareSlug" value={shareSlug} />
            <button
              type="submit"
              disabled={leavePending}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
            >
              {leavePending ? copy.updating : copy.cancelSignup}
            </button>
          </form>
        </div>
      ) : active === "waitlisted" ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-zinc-700">{copy.waitlistBlurb}</p>
          <form action={leaveAction}>
            <input type="hidden" name="shareSlug" value={shareSlug} />
            <button
              type="submit"
              disabled={leavePending}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
            >
              {leavePending ? copy.updating : copy.leaveWaitlist}
            </button>
          </form>
        </div>
      ) : active === "pending" ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-zinc-700">{copy.pendingBlurb}</p>
          <form action={leaveAction}>
            <input type="hidden" name="shareSlug" value={shareSlug} />
            <button
              type="submit"
              disabled={leavePending}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
            >
              {leavePending ? copy.updating : copy.cancelPending}
            </button>
          </form>
        </div>
      ) : active === "rejected" ? (
        <p className="mt-3 text-sm text-zinc-700">{copy.rejectedBlurb}</p>
      ) : (
        <div className="mt-3">
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
            <button
              type="submit"
              disabled={joinPending}
              className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {joinPending ? copy.saving : copy.signMeUp}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
