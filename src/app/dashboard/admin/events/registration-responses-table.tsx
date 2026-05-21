"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SuccessToast } from "@/components/success-toast";
import type { EventStatsCopy } from "@/i18n/messages/event-stats";
import {
  formatAnswerForDisplay,
  type EventRegistrationResponseData,
} from "@/lib/event-registration-stats";
import type { ParticipantStatus } from "@/lib/event-participation";

import {
  deregisterParticipantAction,
  type ApprovalActionState,
} from "./participant-approval-actions";

type Props = {
  eventId: string;
  data: EventRegistrationResponseData;
  copy: EventStatsCopy;
};

function statusLabel(copy: EventStatsCopy, status: ParticipantStatus) {
  switch (status) {
    case "going":
      return copy.statusGoing;
    case "pending":
      return copy.statusPending;
    case "waitlisted":
      return copy.statusWaitlisted;
    default:
      return status;
  }
}

function DeregisterButton({
  eventId,
  participantId,
  participantName,
  copy,
}: {
  eventId: string;
  participantId: string;
  participantName: string;
  copy: EventStatsCopy;
}) {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [state, formAction, isPending] = useActionState(
    deregisterParticipantAction,
    undefined as ApprovalActionState | undefined,
  );

  useEffect(() => {
    if (!state?.ok) return;

    setToastMessage(
      state.message ??
        copy.deregisterSuccess.replace("{name}", participantName),
    );
    setShowToast(true);
    router.refresh();

    const hideTimer = window.setTimeout(() => setShowToast(false), 5000);
    return () => window.clearTimeout(hideTimer);
  }, [state, router, copy.deregisterSuccess, participantName]);

  return (
    <>
      <SuccessToast message={toastMessage} show={showToast} />
      <form action={formAction}>
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="participantId" value={participantId} />
        <button
          type="submit"
          disabled={isPending}
          className="text-xs font-medium text-red-700 underline decoration-red-300 hover:text-red-900 disabled:opacity-50"
        >
          {isPending ? copy.working : copy.deregister}
        </button>
        {state?.message && !state.ok ? (
          <p className="mt-1 max-w-[10rem] text-right text-xs text-red-800" role="alert">
            {state.message}
          </p>
        ) : null}
      </form>
    </>
  );
}

export function RegistrationResponsesTable({ eventId, data, copy }: Props) {
  const displayLabels = {
    yes: copy.answerYes,
    no: copy.answerNo,
    checked: copy.answerChecked,
    unchecked: copy.answerUnchecked,
  };

  if (data.participants.length === 0) {
    return <p className="mt-2 text-sm text-zinc-500">{copy.responsesTableEmpty}</p>;
  }

  return (
    <div className="mt-3 overflow-x-auto rounded-md border border-zinc-200">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="sticky left-0 z-10 bg-zinc-50 px-3 py-2">
              {copy.responsesColParticipant}
            </th>
            <th className="px-3 py-2">{copy.responsesColStatus}</th>
            {data.questions.map((q) => (
              <th key={q.id} className="min-w-[8rem] px-3 py-2">
                {q.label}
              </th>
            ))}
            <th className="px-3 py-2 text-right">{copy.responsesColActions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {data.participants.map((p) => (
            <tr key={p.participantId} className="align-top">
              <td className="sticky left-0 z-10 bg-white px-3 py-2">
                <div className="font-medium text-zinc-900">{p.name}</div>
                <div className="text-xs text-zinc-500">{p.email}</div>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-600">
                {statusLabel(copy, p.status)}
              </td>
              {data.questions.map((q) => (
                <td key={q.id} className="px-3 py-2 text-zinc-800">
                  {formatAnswerForDisplay(
                    q.questionType,
                    p.answers[q.id] ?? "",
                    displayLabels,
                  )}
                </td>
              ))}
              <td className="px-3 py-2 text-right">
                <DeregisterButton
                  eventId={eventId}
                  participantId={p.participantId}
                  participantName={p.name}
                  copy={copy}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
