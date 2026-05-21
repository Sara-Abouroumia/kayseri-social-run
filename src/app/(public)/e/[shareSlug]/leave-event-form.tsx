"use client";

import { useState } from "react";

type LeaveCopy = {
  actionLabel: string;
  confirmMessage: string;
  confirmYes: string;
  keepRegistration: string;
  updating: string;
};

type Props = {
  shareSlug: string;
  leaveAction: (payload: FormData) => void;
  leavePending: boolean;
  copy: LeaveCopy;
};

const btnSecondary =
  "rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-60";

const btnDanger =
  "rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-60";

export function LeaveEventForm({ shareSlug, leaveAction, leavePending, copy }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={btnSecondary}>
        {copy.actionLabel}
      </button>
    );
  }

  return (
    <form action={leaveAction} className="space-y-3">
      <input type="hidden" name="shareSlug" value={shareSlug} />
      <p className="text-sm text-zinc-700">{copy.confirmMessage}</p>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={leavePending} className={btnDanger}>
          {leavePending ? copy.updating : copy.confirmYes}
        </button>
        <button
          type="button"
          disabled={leavePending}
          onClick={() => setConfirming(false)}
          className={btnSecondary}
        >
          {copy.keepRegistration}
        </button>
      </div>
    </form>
  );
}
