import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { auth } from "@/lib/auth";
import { siteMainClass } from "@/lib/layout";
import { isPlatformDeveloper } from "@/lib/platform-developer";
import { getSiteUrl } from "@/lib/site-url";
import { headers } from "next/headers";

import { BackToEventsLink } from "@/components/back-to-events-link";

import { EventForm } from "../event-form";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale).adminEventForm;
  return { title: `${t.newEventTitle} — Admin` };
}

export default async function NewEventPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).adminEventForm;
  const siteOrigin = getSiteUrl();
  const session = await auth.api.getSession({ headers: await headers() });
  const showDeveloperHints =
    !!session?.user?.email &&
    (await isPlatformDeveloper(session.user.id, session.user.email));

  return (
    <main className={siteMainClass}>
      <BackToEventsLink href="/dashboard/admin/events" label={t.allEvents} />
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t.adminLabel}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">{t.newEventTitle}</h1>
        <p className="mt-2 text-sm text-zinc-600">{t.newEventBlurb}</p>
      </div>

      <EventForm
        mode="create"
        siteOrigin={siteOrigin}
        copy={t}
        showDeveloperHints={showDeveloperHints}
      />
    </main>
  );
}
