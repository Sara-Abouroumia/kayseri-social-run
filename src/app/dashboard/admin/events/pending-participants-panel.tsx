"use client";

import { useActionState } from "react";

import type { EventStatsCopy } from "@/i18n/messages/event-stats";

import {
  acceptParticipantAction,
  rejectParticipantAction,
  type ApprovalActionState,
} from "./participant-approval-actions";

type Row = {
  participantId: string;
  name: string;
  email: string;
};

type Props = {
  eventId: string;
  rows: Row[];
  copy: EventStatsCopy;
};

function RowActions({
  eventId,
  participantId,
  copy,
}: {
  eventId: string;
  participantId: string;
  copy: EventStatsCopy;
}) {
  const [acceptState, acceptAction, acceptPending] = useActionState(
    acceptParticipantAction,
    undefined as ApprovalActionState | undefined,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectParticipantAction,
    undefined as ApprovalActionState | undefined,
  );

  const msg = acceptState?.message ?? rejectState?.message;
  const ok = acceptState?.ok ?? rejectState?.ok;

  return (
    <div className="flex flex-col items-end gap-2">
      {msg ? (
        <p
          className={`max-w-xs text-right text-xs ${ok ? "text-emerald-800" : "text-red-800"}`}
          role="status"
        >
          {msg}
        </p>
      ) : null}
      <div className="flex gap-2">
        <form action={acceptAction}>
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="participantId" value={participantId} />
          <button
            type="submit"
            disabled={acceptPending || rejectPending}
            className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {acceptPending ? copy.working : copy.accept}
          </button>
        </form>
        <form action={rejectAction}>
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="participantId" value={participantId} />
          <button
            type="submit"
            disabled={acceptPending || rejectPending}
            className="rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-50 disabled:opacity-50"
          >
            {rejectPending ? copy.working : copy.reject}
          </button>
        </form>
      </div>
    </div>
  );
}

export function PendingParticipantsPanel({ eventId, rows, copy }: Props) {
  if (rows.length === 0) return null;

  return (
    <div className="mt-8 rounded-md border border-amber-200 bg-amber-50/50 p-4">
      <h3 className="text-sm font-semibold text-zinc-900">
        {copy.pendingApprovalHeading.replace("{count}", String(rows.length))}
      </h3>
      <p className="mt-1 text-xs text-zinc-600">{copy.pendingApprovalIntro}</p>
      <ul className="mt-4 divide-y divide-amber-100">
        {rows.map((r) => (
          <li
            key={r.participantId}
            className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div>
              <p className="font-medium text-zinc-900">{r.name}</p>
              <p className="text-xs text-zinc-500">{r.email}</p>
            </div>
            <RowActions eventId={eventId} participantId={r.participantId} copy={copy} />
          </li>
        ))}
      </ul>
    </div>
  );
}
