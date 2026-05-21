import type { Metadata } from "next";
import Link from "next/link";

import { listCommunityIdeasForAdmin } from "@/app/dashboard/idea-box-actions";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin-session";
import { siteMainClass } from "@/lib/layout";

import { AdminIdeasMarkRead } from "./admin-ideas-mark-read";
import { AdminIdeasView } from "./admin-ideas-view";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale).ideaBox;
  return { title: `${t.adminTitle} — ${t.adminLabel}` };
}

export default async function AdminIdeasPage() {
  const gate = await requirePlatformAdminSession();
  if (!gate.ok) {
    return null;
  }

  const locale = await getLocale();
  const t = getDictionary(locale).ideaBox;

  const rows = await listCommunityIdeasForAdmin();
  const ideas = rows.map((idea) => ({
    id: idea.id,
    title: idea.title,
    detail: idea.detail,
    createdAtIso: new Date(idea.createdAt).toISOString(),
    authorName: idea.authorName,
    authorEmail: idea.authorEmail,
    authorImage: idea.authorImage,
  }));

  return (
    <main className={siteMainClass}>
      <AdminIdeasMarkRead />

      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t.adminLabel}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">{t.adminTitle}</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">{t.adminBlurb}</p>
      </header>

      <AdminIdeasView ideas={ideas} copy={t} locale={locale} />

      <p className="mt-10 text-center text-sm text-zinc-500">
        <Link href="/dashboard/admin/events" className="underline hover:text-zinc-800">
          {t.adminNavEvents}
        </Link>
        {" · "}
        <Link href="/dashboard/admin/system" className="underline hover:text-zinc-800">
          {t.adminNavSystem}
        </Link>
        {" · "}
        <Link href="/dashboard" className="underline hover:text-zinc-800">
          {t.backToDashboard}
        </Link>
      </p>
    </main>
  );
}
