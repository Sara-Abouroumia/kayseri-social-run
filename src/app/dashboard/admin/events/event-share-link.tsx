"use client";

import type { Messages } from "@/i18n/messages/en";

type Copy = Messages["adminEventForm"];

type EventShareLinkProps = {
  url: string;
  copy: Copy;
};

export function EventShareLink({ url, copy }: EventShareLinkProps) {
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white p-4"
      aria-labelledby="share-heading"
    >
      <h2 id="share-heading" className="text-sm font-semibold text-zinc-900">
        {copy.shareLink}
      </h2>
      <p className="mt-0.5 text-xs text-zinc-500">{copy.shareLinkHint}</p>
      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="block min-w-0 flex-1 break-all rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-800">
          {url}
        </code>
        <button
          type="button"
          className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50"
          onClick={() => void navigator.clipboard.writeText(url)}
        >
          {copy.copy}
        </button>
      </div>
    </section>
  );
}
