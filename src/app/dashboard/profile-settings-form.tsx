"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import type { Messages } from "@/i18n/messages/en";

type ActionState = { ok?: boolean; message?: string };

type Props = {
  initialName: string;
  email: string;
  copy: Messages["profileSettings"];
};

function statusClass(ok: boolean | undefined) {
  return ok
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-red-200 bg-red-50 text-red-800";
}

export function ProfileSettingsForm({
  initialName,
  email,
  copy,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [nameStatus, setNameStatus] = useState<ActionState>();
  const [namePending, setNamePending] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<ActionState>();
  const [passwordPending, setPasswordPending] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setNameStatus(undefined);
    const trimmed = name.trim();
    if (!trimmed) return;

    setNamePending(true);
    try {
      const { error } = await authClient.updateUser({ name: trimmed });
      if (error) {
        setNameStatus({ ok: false, message: error.message ?? copy.nameError });
        return;
      }
      setNameStatus({ ok: true, message: copy.nameUpdated });
      router.refresh();
    } finally {
      setNamePending(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordStatus(undefined);

    if (newPassword.length < 8) {
      setPasswordStatus({ ok: false, message: copy.passwordTooShort });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ ok: false, message: copy.passwordMismatch });
      return;
    }

    setPasswordPending(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      if (error) {
        const msg =
          error.message?.toLowerCase().includes("password") ||
          error.message?.toLowerCase().includes("credential")
            ? copy.currentPasswordWrong
            : (error.message ?? copy.passwordError);
        setPasswordStatus({ ok: false, message: msg });
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus({ ok: true, message: copy.passwordChanged });
    } finally {
      setPasswordPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <p>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          ← {copy.backToDashboard}
        </Link>
      </p>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-zinc-900">{copy.account}</h2>

        <form onSubmit={(e) => void saveName(e)} className="mt-4 space-y-4">
          {nameStatus?.message ? (
            <p
              className={`rounded-md border px-3 py-2 text-sm ${statusClass(nameStatus.ok)}`}
              role="status"
            >
              {nameStatus.message}
            </p>
          ) : null}

          <div>
            <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-zinc-800">
              {copy.name}
            </label>
            <input
              id="profile-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
              disabled={namePending}
              required
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="mb-1 block text-sm font-medium text-zinc-800">
              {copy.email}
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              readOnly
              className="w-full cursor-not-allowed rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600"
            />
            <p className="mt-1 text-xs text-zinc-500">{copy.emailHint}</p>
          </div>

          <button
            type="submit"
            disabled={namePending || name.trim() === initialName.trim()}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {namePending ? copy.saving : copy.saveName}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-zinc-900">{copy.password}</h2>

        <form onSubmit={(e) => void savePassword(e)} className="mt-4 space-y-4">
          {passwordStatus?.message ? (
            <p
              className={`rounded-md border px-3 py-2 text-sm ${statusClass(passwordStatus.ok)}`}
              role="status"
            >
              {passwordStatus.message}
            </p>
          ) : null}

          <div>
            <label
              htmlFor="current-password"
              className="mb-1 block text-sm font-medium text-zinc-800"
            >
              {copy.currentPassword}
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
              disabled={passwordPending}
              required
            />
          </div>

          <div>
            <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-zinc-800">
              {copy.newPassword}
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
              disabled={passwordPending}
              required
              minLength={8}
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1 block text-sm font-medium text-zinc-800"
            >
              {copy.confirmPassword}
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
              disabled={passwordPending}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={passwordPending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {passwordPending ? copy.saving : copy.changePassword}
          </button>
        </form>
      </section>
    </div>
  );
}
