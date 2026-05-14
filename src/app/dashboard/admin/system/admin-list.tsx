"use client";

import { useActionState } from "react";

import type { ListedPlatformAdmin } from "@/lib/platform-admin";

import { removePlatformAdminAction } from "./actions";

function RemoveAdminButton({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(
    removePlatformAdminAction,
    {} as { message?: string; ok?: boolean },
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        disabled={isPending}
        className="text-sm font-medium text-red-700 underline decoration-red-300 hover:text-red-900 disabled:opacity-50"
      >
        {isPending ? "Removing…" : "Remove"}
      </button>
      {state?.message && !state.ok ? (
        <span className="max-w-[12rem] text-right text-xs text-red-700">
          {state.message}
        </span>
      ) : null}
      {state?.message && state.ok ? (
        <span className="text-xs text-green-800">{state.message}</span>
      ) : null}
    </form>
  );
}

export function AdminList({ admins }: { admins: ListedPlatformAdmin[] }) {
  if (admins.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600">
        No platform admins yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      {admins.map((admin) => (
        <li
          key={admin.userId}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-900">{admin.name}</p>
            <p className="truncate text-sm text-zinc-600">{admin.email}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {admin.source === "bootstrap"
                ? "Bootstrap · PLATFORM_ADMIN_EMAILS"
                : "Granted via this app"}
            </p>
          </div>
          <div className="shrink-0">
            {admin.removable ? (
              <RemoveAdminButton userId={admin.userId} />
            ) : (
              <span className="text-xs text-zinc-400">Not removable here</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
