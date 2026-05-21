"use client";

import { useMemo, useState } from "react";

import { UserAvatar } from "@/components/user-avatar";
import type { Locale } from "@/i18n/config";
import type { IdeaBoxCopy } from "@/i18n/messages/idea-box";
import { cn } from "@/lib/utils";

export type AdminIdeaRow = {
  id: string;
  title: string;
  detail: string;
  createdAtIso: string;
  authorName: string | null;
  authorEmail: string;
  authorImage: string | null;
};

type Props = {
  ideas: AdminIdeaRow[];
  copy: IdeaBoxCopy;
  locale: Locale;
};

function formatWhen(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function authorDisplayName(name: string | null, email: string) {
  return name?.trim() || email;
}

export function AdminIdeasView({ ideas, copy, locale }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => (selectedId ? ideas.find((i) => i.id === selectedId) ?? null : null),
    [ideas, selectedId],
  );

  if (ideas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 px-4 py-12 text-center text-sm text-zinc-600">
        {copy.adminEmpty}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100/90 shadow-sm lg:flex lg:min-h-[28rem]">
      <aside
        className="border-b border-zinc-200/80 p-3 sm:p-4 lg:w-80 lg:shrink-0 lg:border-b-0 lg:border-r lg:bg-zinc-100"
        aria-label={copy.adminListLabel}
      >
        <p className="mb-3 px-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
          {copy.adminIdeasCount.replace("{count}", String(ideas.length))}
        </p>
        <ul className="max-h-[min(50vh,22rem)] space-y-2 overflow-y-auto lg:max-h-none lg:min-h-[24rem]">
          {ideas.map((idea) => {
            const isActive = selectedId === idea.id;
            const name = authorDisplayName(idea.authorName, idea.authorEmail);
            return (
              <li key={idea.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(idea.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "w-full rounded-lg border px-3.5 py-3 text-left shadow-sm transition",
                    isActive
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200/90 bg-white hover:border-zinc-300 hover:shadow",
                  )}
                >
                  <p
                    className={cn(
                      "line-clamp-2 text-sm font-medium leading-snug",
                      isActive ? "text-white" : "text-zinc-900",
                    )}
                  >
                    {idea.title}
                  </p>
                  <p
                    className={cn(
                      "mt-1 truncate text-xs",
                      isActive ? "text-white/75" : "text-zinc-500",
                    )}
                  >
                    {name} · {formatWhen(idea.createdAtIso, locale)}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-white lg:min-h-[28rem]">
      {selected ? (
        <article className="flex min-h-0 flex-1 flex-col">
          <header className="border-b border-zinc-100 bg-white px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold leading-snug text-zinc-900">
              {selected.title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-500">{copy.adminSubmittedBy}</span>
              <UserAvatar
                name={authorDisplayName(selected.authorName, selected.authorEmail)}
                imageUrl={selected.authorImage}
                size="sm"
              />
              <span className="text-sm font-medium text-zinc-800">
                {authorDisplayName(selected.authorName, selected.authorEmail)}
              </span>
              <span className="text-zinc-300" aria-hidden>
                ·
              </span>
              <time
                className="text-xs text-zinc-500"
                dateTime={selected.createdAtIso}
              >
                {formatWhen(selected.createdAtIso, locale)}
              </time>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
              {selected.detail}
            </p>
          </div>
        </article>
      ) : (
        <div
          className="flex min-h-[16rem] flex-1 flex-col items-center justify-center border-t border-zinc-100 bg-white px-8 py-12 text-center lg:min-h-0 lg:border-t-0"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-zinc-400">{copy.adminSelectTitle}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400/90">
            {copy.adminSelectHint}
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
