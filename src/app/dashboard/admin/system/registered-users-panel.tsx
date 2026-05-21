"use client";

import { useActionState, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { SuccessToast } from "@/components/success-toast";
import type { Locale } from "@/i18n/config";
import type { SystemAdminCopy } from "@/i18n/messages/system-admin";
import {
  PLATFORM_ROLE_LABELS,
  type PlatformRole,
} from "@/lib/platform-admin";
import {
  isMemberUser,
  type ListedRegisteredUser,
} from "@/lib/registered-users";
import { cn } from "@/lib/utils";

import {
  grantPlatformAdminByUserIdAction,
  removePlatformAdminAction,
  type SystemUserActionState,
} from "./actions";

type UserFilter = "admins" | "users" | "all";

type Props = {
  users: ListedRegisteredUser[];
  copy: SystemAdminCopy;
  locale: Locale;
  currentUserId: string;
};

function roleBadgeClass(role: PlatformRole): string {
  const base =
    "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide";
  if (role === "developer") {
    return `${base} bg-amber-100 text-amber-900`;
  }
  return `${base} bg-zinc-100 text-zinc-700`;
}

function filterUsers(list: ListedRegisteredUser[], filter: UserFilter) {
  switch (filter) {
    case "admins":
      return list.filter((u) => u.isPlatformAdmin);
    case "users":
      return list.filter(isMemberUser);
    default:
      return list;
  }
}

function UserRowActions({
  user,
  copy,
  currentUserId,
}: {
  user: ListedRegisteredUser;
  copy: SystemAdminCopy;
  currentUserId: string;
}) {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [grantState, grantAction, grantPending] = useActionState(
    grantPlatformAdminByUserIdAction,
    undefined as SystemUserActionState | undefined,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removePlatformAdminAction,
    undefined as SystemUserActionState | undefined,
  );

  const state = grantState?.ok ? grantState : removeState;
  const isPending = grantPending || removePending;
  const isYou = user.userId === currentUserId;

  useEffect(() => {
    if (!state?.ok) return;
    setToastMessage(state.message ?? "");
    setShowToast(true);
    router.refresh();
    const hideTimer = window.setTimeout(() => setShowToast(false), 5000);
    return () => window.clearTimeout(hideTimer);
  }, [state, router]);

  const errMsg =
    (grantState && !grantState.ok ? grantState.message : null) ??
    (removeState && !removeState.ok ? removeState.message : null);

  if (isYou) {
    return <span className="text-xs text-zinc-400">—</span>;
  }

  if (isMemberUser(user)) {
    return (
      <>
        <SuccessToast message={toastMessage} show={showToast} />
        <form action={grantAction} className="flex flex-col items-end gap-1">
          <input type="hidden" name="userId" value={user.userId} />
          <button
            type="submit"
            disabled={isPending}
            className="text-xs font-medium text-zinc-900 underline decoration-zinc-300 hover:text-zinc-700 disabled:opacity-50"
          >
            {grantPending ? copy.working : copy.makeAdmin}
          </button>
          {errMsg ? (
            <p className="max-w-[11rem] text-right text-xs text-red-800" role="alert">
              {errMsg}
            </p>
          ) : null}
        </form>
      </>
    );
  }

  if (user.adminRemovable) {
    return (
      <>
        <SuccessToast message={toastMessage} show={showToast} />
        <form action={removeAction} className="flex flex-col items-end gap-1">
          <input type="hidden" name="userId" value={user.userId} />
          <button
            type="submit"
            disabled={isPending}
            className="text-xs font-medium text-red-700 underline decoration-red-300 hover:text-red-900 disabled:opacity-50"
          >
            {removePending ? copy.working : copy.removeAdmin}
          </button>
          {errMsg ? (
            <p className="max-w-[11rem] text-right text-xs text-red-800" role="alert">
              {errMsg}
            </p>
          ) : null}
        </form>
      </>
    );
  }

  if (user.isPlatformAdmin) {
    return <span className="text-xs text-zinc-400">{copy.protected}</span>;
  }

  return <span className="text-xs text-zinc-400">—</span>;
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition",
        active
          ? "bg-zinc-900 text-white"
          : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50",
      )}
    >
      {children}
    </button>
  );
}

export function RegisteredUsersPanel({ users, copy, locale, currentUserId }: Props) {
  const [filter, setFilter] = useState<UserFilter>("admins");

  const dateFmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    dateStyle: "medium",
  });

  const filtered = useMemo(() => filterUsers(users, filter), [users, filter]);

  const emptyMessage =
    filter === "admins"
      ? copy.filterEmptyAdmins
      : filter === "users"
        ? copy.filterEmptyUsers
        : copy.registeredUsersEmpty;

  if (users.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600">
        {copy.registeredUsersEmpty}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterButton active={filter === "admins"} onClick={() => setFilter("admins")}>
          {copy.filterAdmins}
        </FilterButton>
        <FilterButton active={filter === "users"} onClick={() => setFilter("users")}>
          {copy.filterUsers}
        </FilterButton>
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          {copy.filterAll}
        </FilterButton>
        <span className="ml-auto text-sm text-zinc-500">
          {copy.filterCount
            .replace("{shown}", String(filtered.length))
            .replace("{total}", String(users.length))}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600">
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <div className="max-h-[28rem] overflow-y-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/95 backdrop-blur-sm">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium text-zinc-700">
                    {copy.colName}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-zinc-700">
                    {copy.colEmail}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-zinc-700">
                    {copy.colVerified}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-zinc-700">
                    {copy.colRegistered}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-zinc-700">
                    {copy.colRole}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-medium text-zinc-700"
                  >
                    {copy.colActions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filtered.map((u) => {
                  const isYou = u.userId === currentUserId;
                  return (
                    <tr key={u.userId} className={isYou ? "bg-sky-50/50" : undefined}>
                      <td className="px-4 py-3">
                        <p className="truncate font-medium text-zinc-900">
                          {u.name}
                          {isYou ? (
                            <span className="ml-1.5 font-normal text-sky-700">
                              {copy.youLabel}
                            </span>
                          ) : null}
                        </p>
                        {u.adminSource === "bootstrap_developer" ? (
                          <p className="mt-0.5 text-xs text-zinc-500">
                            PLATFORM_DEVELOPER_EMAILS
                          </p>
                        ) : null}
                      </td>
                      <td className="max-w-[14rem] truncate px-4 py-3 text-zinc-600">
                        {u.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                        {u.emailVerified ? (
                          <span className="text-emerald-800">{copy.verifiedYes}</span>
                        ) : (
                          <span className="text-amber-800">{copy.verifiedNo}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-600 tabular-nums">
                        {dateFmt.format(u.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {u.roles.length === 0 ? (
                          <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-600">
                            {copy.roleMember}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {u.roles.map((role) => (
                              <span key={role} className={roleBadgeClass(role)}>
                                {PLATFORM_ROLE_LABELS[role]}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <UserRowActions
                          user={u}
                          copy={copy}
                          currentUserId={currentUserId}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
