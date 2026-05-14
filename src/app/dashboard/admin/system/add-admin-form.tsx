"use client";

import { useActionState } from "react";

import { addPlatformAdminByEmailAction } from "./actions";

export function AddAdminForm() {
  const [state, formAction, isPending] = useActionState(
    addPlatformAdminByEmailAction,
    {} as { message?: string; ok?: boolean },
  );

  return (
    <div>
      <form
        action={formAction}
        className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="admin-email" className="sr-only">
            Email address
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="user@example.com"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add admin"}
        </button>
      </form>
      {state?.message ? (
        <p
          className={`mt-3 text-sm ${state.ok ? "text-green-800" : "text-red-800"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
