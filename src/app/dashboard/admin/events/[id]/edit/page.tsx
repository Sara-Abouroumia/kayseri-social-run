import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { events } from "@/db/schema/events";
import { siteMainClass } from "@/lib/layout";
import { getSiteUrl } from "@/lib/site-url";

import { DeleteEventDialog } from "../../delete-event-dialog";
import { EventParticipationInsights } from "../../event-participation-insights";
import { EventForm } from "../../event-form";
import { eventRowToFormInitial } from "../../event-form-initial";
import {
  listRegistrationQuestionsForEvent,
  rowsToQuestionDrafts,
} from "@/lib/event-registration-persist";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const row = await db
    .select({ title: events.title })
    .from(events)
    .where(eq(events.id, id))
    .limit(1);
  if (!row[0]) return { title: "Event not found" };
  return { title: `Edit — ${row[0].title}` };
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const row = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!row[0]) notFound();

  const initial = eventRowToFormInitial(row[0]);
  const questionRows = await listRegistrationQuestionsForEvent(row[0].id);
  initial.registrationQuestions = rowsToQuestionDrafts(questionRows);
  const siteOrigin = getSiteUrl();

  return (
    <main className={siteMainClass}>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900">Edit event</h1>
          <p className="mt-2 text-sm text-zinc-600">{initial.title}</p>
        </div>
        <DeleteEventDialog eventId={row[0].id} title={row[0].title} />
      </div>

      <EventForm key={row[0].id} mode="edit" initial={initial} siteOrigin={siteOrigin} />

      <EventParticipationInsights eventId={row[0].id} />

      <p className="mt-10 text-center text-sm text-zinc-500">
        <Link href="/dashboard/admin/events" className="underline hover:text-zinc-800">
          ← All events
        </Link>
      </p>
    </main>
  );
}
