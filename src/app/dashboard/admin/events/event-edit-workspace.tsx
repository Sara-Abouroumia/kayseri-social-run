"use client";

import Link from "next/link";

import { BackToEventsLink } from "@/components/back-to-events-link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import type { EventFormInitial } from "@/app/dashboard/admin/events/event-form-initial";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages/en";

import { EventAdminSummaryCard, type EventAdminSummaryCardProps } from "./event-admin-summary-card";
import { DeleteEventDialog } from "./delete-event-dialog";
import { EventForm } from "./event-form";
import { EventShareLink } from "./event-share-link";

type Copy = Messages["adminEventForm"];

type EventEditWorkspaceProps = {
  initial: EventFormInitial;
  siteOrigin: string;
  editable: boolean;
  copy: Copy;
  showDeveloperHints: boolean;
  locale: Locale;
  summary: Omit<EventAdminSummaryCardProps, "locale" | "copy">;
  insights: ReactNode;
};

export function EventEditWorkspace({
  initial,
  siteOrigin,
  editable,
  copy,
  showDeveloperHints,
  locale,
  summary,
  insights,
}: EventEditWorkspaceProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const shareUrl =
    initial.shareSlug != null && initial.shareSlug !== ""
      ? `${siteOrigin}/e/${initial.shareSlug}`
      : null;

  return (
    <div className="space-y-5">
      <BackToEventsLink
        href="/dashboard/admin/events"
        label={copy.allEvents}
        className="mb-0"
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {copy.adminLabel}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
            {editable ? (editing ? copy.editEvent : copy.viewEvent) : copy.viewEvent}
          </h1>
        </div>
        {editing ? (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            {copy.cancel}
          </button>
        ) : initial.id ? (
          <DeleteEventDialog
            eventId={initial.id}
            title={initial.title}
            copy={copy}
          />
        ) : null}
      </div>

      {editable && editing ? (
        <EventForm
          key={`${initial.id}-edit`}
          mode="edit"
          initial={initial}
          siteOrigin={siteOrigin}
          copy={copy}
          showDeveloperHints={showDeveloperHints}
          showShareLink={false}
          onUpdateSuccess={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      ) : (
        <>
          {!editable ? (
            <p
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700"
              role="status"
            >
              {copy.readOnlyBlurb}
            </p>
          ) : null}

          <EventAdminSummaryCard {...summary} locale={locale} copy={copy} />

          {editable ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 pb-5">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                {copy.editEvent}
              </button>
              {shareUrl ? (
                <Link
                  href={`/e/${initial.shareSlug}`}
                  prefetch={false}
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                >
                  {copy.view}
                </Link>
              ) : null}
            </div>
          ) : null}

          {shareUrl ? <EventShareLink url={shareUrl} copy={copy} /> : null}

          {insights}
        </>
      )}
    </div>
  );
}
