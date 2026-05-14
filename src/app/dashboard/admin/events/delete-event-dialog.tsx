"use client";

import { useActionState, useState } from "react";

import { deleteEventAction } from "@/app/dashboard/admin/events/events-actions";

type DeleteEventDialogProps = {
  eventId: string;
  title: string;
};

export function DeleteEventDialog({ eventId, title }: DeleteEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [state, formAction, isPending] = useActionState(
    deleteEventAction,
    {} as { message?: string; ok?: boolean },
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-red-800 underline decoration-red-300 underline-offset-2 hover:decoration-red-800"
      >
        Delete
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
          >
            <h2
              id="delete-event-title"
              className="text-lg font-semibold text-zinc-900"
            >
              Delete event
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              This cannot be undone. Type the event title exactly as shown below
              to confirm.
            </p>
            <p className="mt-3 rounded border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-sm text-zinc-800">
              {title}
            </p>
            <form action={formAction} className="mt-4 space-y-3">
              <input type="hidden" name="eventId" value={eventId} />
              <div>
                <label htmlFor={`confirm-${eventId}`} className="sr-only">
                  Type title to confirm
                </label>
                <input
                  id={`confirm-${eventId}`}
                  name="confirmTitle"
                  value={confirmTitle}
                  onChange={(e) => setConfirmTitle(e.target.value)}
                  autoComplete="off"
                  placeholder="Type the full title"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                  onClick={() => {
                    setOpen(false);
                    setConfirmTitle("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-red-800 px-3 py-2 text-sm font-medium text-white hover:bg-red-900 disabled:opacity-50"
                >
                  {isPending ? "Deleting…" : "Delete permanently"}
                </button>
              </div>
            </form>
            {state.message && !state.ok ? (
              <p className="mt-3 text-sm text-red-800" role="alert">
                {state.message}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
