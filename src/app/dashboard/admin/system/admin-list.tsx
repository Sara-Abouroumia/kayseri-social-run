"use client";

import { useActionState } from "react";

import {
  PLATFORM_ROLE_LABELS,
  type ListedPlatformAdmin,
  type PlatformRole,
} from "@/lib/platform-admin";

import { removePlatformAdminAction } from "./actions";

function roleBadgeClass(role: PlatformRole): string {
  const base =
    "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide";
  if (role === "developer") {
    return `${base} bg-amber-100 text-amber-900`;
  }
  return `${base} bg-zinc-100 text-zinc-700`;
}

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

function AdminRowActions({ admin }: { admin: ListedPlatformAdmin }) {
  if (admin.removable) {
    return <RemoveAdminButton userId={admin.userId} />;
  }
  if (admin.source === "bootstrap_developer") {
    return <span className="text-xs text-zinc-400">Protected</span>;
  }
  return <span className="text-xs text-zinc-400">—</span>;
}

export function AdminList({
  admins,
  currentUserId,
  viewerIsDeveloper,
}: {
  admins: ListedPlatformAdmin[];
  currentUserId: string;
  viewerIsDeveloper: boolean;
}) {
  if (admins.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600">
        No platform admins yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/80">
            <th scope="col" className="px-4 py-3 font-medium text-zinc-700">
              Name
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-zinc-700">
              Email
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-zinc-700">
              Role
            </th>
            {viewerIsDeveloper ? (
              <th
                scope="col"
                className="px-4 py-3 text-right font-medium text-zinc-700"
              >
                Actions
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {admins.map((admin) => {
            const isYou = admin.userId === currentUserId;
            return (
              <tr
                key={admin.userId}
                className={isYou ? "bg-sky-50/50" : undefined}
              >
                <td className="px-4 py-3">
                  <p className="truncate font-medium text-zinc-900">
                    {admin.name}
                    {isYou ? (
                      <span className="ml-1.5 font-normal text-sky-700">(You)</span>
                    ) : null}
                  </p>
                  {viewerIsDeveloper && admin.source === "bootstrap_developer" ? (
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Bootstrap · PLATFORM_DEVELOPER_EMAILS
                    </p>
                  ) : null}
                </td>
                <td className="max-w-[14rem] truncate px-4 py-3 text-zinc-600">
                  {admin.email}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {admin.roles.map((role) => (
                      <span key={role} className={roleBadgeClass(role)}>
                        {PLATFORM_ROLE_LABELS[role]}
                      </span>
                    ))}
                  </div>
                </td>
                {viewerIsDeveloper ? (
                  <td className="px-4 py-3 text-right">
                    <AdminRowActions admin={admin} />
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
