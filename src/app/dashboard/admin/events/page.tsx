import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";

import { db } from "@/db";
import { events } from "@/db/schema/events";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { siteMainClass } from "@/lib/layout";
import { getSiteUrl } from "@/lib/site-url";

import { AdminEventsView } from "./admin-events-list";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale).adminEventForm;
  return { title: `${t.listTitle} — ${t.adminLabel}` };
}

export default async function AdminEventsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const d = dict.dashboard;
  const t = dict.adminEventForm;

  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      shareSlug: events.shareSlug,
      startsAt: events.startsAt,
      visibility: events.visibility,
      coverImageUrl: events.coverImageUrl,
      activityType: events.activityType,
      activityTypeEmoji: events.activityTypeEmoji,
    })
    .from(events)
    .orderBy(desc(events.startsAt));

  const now = Date.now();
  const past = rows
    .filter((e) => new Date(e.startsAt).getTime() < now)
    .map((e) => ({ ...e, startsAt: new Date(e.startsAt) }));
  const upcoming = rows
    .filter((e) => new Date(e.startsAt).getTime() >= now)
    .map((e) => ({ ...e, startsAt: new Date(e.startsAt) }))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const siteOrigin = getSiteUrl();

  return (
    <main className={siteMainClass}>
      <AdminEventsView
        upcoming={upcoming}
        past={past}
        siteOrigin={siteOrigin}
        locale={locale}
        copy={t}
        copyShareLinkLabel={d.copyShareLink}
        shareLabel={d.share}
        copiedLabel={d.copied}
        header={
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {t.adminLabel}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-900">{t.listTitle}</h1>
            <p className="mt-2 text-sm text-zinc-600">{t.listDescription}</p>
          </div>
        }
      />

      <p className="mt-10 text-center text-sm text-zinc-500">
        <Link href="/dashboard/admin/system" className="underline hover:text-zinc-800">
          ← System settings
        </Link>
        {" · "}
        <Link href="/dashboard" className="underline hover:text-zinc-800">
          Dashboard
        </Link>
      </p>
    </main>
  );
}
