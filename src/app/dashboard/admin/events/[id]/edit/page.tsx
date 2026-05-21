import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { Suspense } from "react";

import { eq } from "drizzle-orm";



import { db } from "@/db";

import { events } from "@/db/schema/events";

import { getDictionary } from "@/i18n/get-dictionary";

import { getLocale } from "@/i18n/get-locale";

import { auth } from "@/lib/auth";

import { canEditEvent } from "@/lib/event-schedule-phase";

import { siteMainClass } from "@/lib/layout";

import { isPlatformDeveloper } from "@/lib/platform-developer";

import { getSiteUrl } from "@/lib/site-url";

import { headers } from "next/headers";



import { EventCreatedToast } from "../../event-created-toast";

import { EventEditWorkspace } from "../../event-edit-workspace";

import { EventParticipationInsights } from "../../event-participation-insights";

import { eventRowToFormInitial } from "../../event-form-initial";

import {

  listRegistrationQuestionsForEvent,

  rowsToQuestionDrafts,

} from "@/lib/event-registration-persist";



type Props = {

  params: Promise<{ id: string }>;

};



export async function generateMetadata({ params }: Props): Promise<Metadata> {

  const locale = await getLocale();

  const t = getDictionary(locale).adminEventForm;

  const { id } = await params;

  const row = await db

    .select({ title: events.title })

    .from(events)

    .where(eq(events.id, id))

    .limit(1);

  if (!row[0]) return { title: t.eventNotFound };

  return { title: t.editPageTitle.replace("{title}", row[0].title) };

}



export default async function EditEventPage({ params }: Props) {

  const { id } = await params;

  const row = await db.select().from(events).where(eq(events.id, id)).limit(1);

  if (!row[0]) notFound();



  const event = row[0];

  const initial = eventRowToFormInitial(event);

  const questionRows = await listRegistrationQuestionsForEvent(event.id);

  initial.registrationQuestions = rowsToQuestionDrafts(questionRows);

  const locale = await getLocale();

  const dict = getDictionary(locale);
  const t = dict.adminEventForm;

  const siteOrigin = getSiteUrl();

  const editable = canEditEvent(event);

  const session = await auth.api.getSession({ headers: await headers() });

  const showDeveloperHints =

    !!session?.user?.email &&

    (await isPlatformDeveloper(session.user.id, session.user.email));



  return (

    <main className={siteMainClass}>

      <Suspense fallback={null}>

        <EventCreatedToast message={t.eventCreatedSuccess} />

      </Suspense>



      <EventEditWorkspace

        initial={initial}

        siteOrigin={siteOrigin}

        editable={editable}

        copy={t}

        showDeveloperHints={showDeveloperHints}

        locale={locale}

        summary={{

          title: event.title,

          shareSlug: event.shareSlug,

          startsAt: new Date(event.startsAt),

          endsAt: event.endsAt ? new Date(event.endsAt) : null,

          activityType: event.activityType,

          activityTypeEmoji: event.activityTypeEmoji,

          visibility: event.visibility,

          coverImageUrl: event.coverImageUrl,

          description: event.description,

          meetingPointName: event.meetingPointName,

          coordinatorName: event.coordinatorName,

        }}

        insights={
          <div key="event-participation-insights">
            <EventParticipationInsights
              eventId={event.id}
              className="mt-0"
              copy={dict.eventStats}
              locale={locale}
            />
          </div>
        }

      />
    </main>

  );

}

