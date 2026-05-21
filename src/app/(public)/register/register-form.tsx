"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { authClient } from "@/lib/auth-client";
import type { Messages } from "@/i18n/messages/en";

import { checkRegisterEmailAction } from "./register-actions";

type RegisterFormProps = {
  inviteLockedEmail: string | null;
  defaultNext: string;
  copy: Messages["register"];
};

type DuplicateDialogKind = "awaiting_verification" | "already_active";

function isDuplicateSignupError(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("already") ||
    m.includes("exist") ||
    m.includes("duplicate") ||
    m.includes("unique")
  );
}

export function RegisterForm({ inviteLockedEmail, defaultNext, copy }: RegisterFormProps) {
  const router = useRouter();
  const genderOptions = useMemo(
    () =>
      [
        { value: "female" as const, label: copy.femaleLabel },
        { value: "male" as const, label: copy.maleLabel },
      ] as const,
    [copy.femaleLabel, copy.maleLabel],
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState(inviteLockedEmail ?? "");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<(typeof genderOptions)[number]["value"]>("female");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [duplicateDialog, setDuplicateDialog] = useState<DuplicateDialogKind | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginHref =
    defaultNext === "/dashboard"
      ? "/login"
      : `/login?next=${encodeURIComponent(defaultNext)}`;

  function openDuplicateDialog(kind: DuplicateDialogKind) {
    setDuplicateDialog(kind);
    setErrorMessage(null);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setDuplicateDialog(null);
    setIsSubmitting(true);

    try {
      if (inviteLockedEmail && email.trim().toLowerCase() !== inviteLockedEmail) {
        setErrorMessage(
          `${copy.inviteEmailUse} (${inviteLockedEmail}) ${copy.inviteEmailSuffix}`,
        );
        return;
      }

      const { status } = await checkRegisterEmailAction(email);
      if (status === "awaiting_verification") {
        openDuplicateDialog("awaiting_verification");
        return;
      }
      if (status === "already_active") {
        openDuplicateDialog("already_active");
        return;
      }

      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        gender,
        callbackURL: defaultNext,
      } as Parameters<typeof authClient.signUp.email>[0] & { gender: typeof gender });

      if (error) {
        if (isDuplicateSignupError(error.message)) {
          const { status: retryStatus } = await checkRegisterEmailAction(email);
          if (retryStatus === "awaiting_verification") {
            openDuplicateDialog("awaiting_verification");
            return;
          }
          if (retryStatus === "already_active") {
            openDuplicateDialog("already_active");
            return;
          }
          openDuplicateDialog("awaiting_verification");
          return;
        }
        setErrorMessage(error.message ?? copy.errorGeneric);
        return;
      }

      const session = await authClient.getSession();
      if (session.data?.user?.emailVerified) {
        router.push(defaultNext);
        router.refresh();
        return;
      }

      setSuccessMessage(
        copy.checkInbox + (inviteLockedEmail ? ` ${copy.afterVerifyAdmin}` : ""),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const dialogCopy =
    duplicateDialog === "already_active"
      ? {
          title: copy.alreadyAccountTitle,
          body: copy.alreadyAccountBody,
        }
      : duplicateDialog === "awaiting_verification"
        ? {
            title: copy.alreadyEmailedTitle,
            body: copy.alreadyEmailedBody,
          }
        : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-white px-6">
      <h1 className="mb-6 text-3xl font-bold">{copy.title}</h1>

      {inviteLockedEmail ? (
        <p className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          {copy.inviteBanner}
        </p>
      ) : null}

      {duplicateDialog && dialogCopy ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDuplicateDialog(null);
          }}
        >
          <div
            className="max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-lg"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="register-duplicate-title"
            aria-describedby="register-duplicate-body"
          >
            <h2
              id="register-duplicate-title"
              className="text-lg font-semibold text-zinc-900"
            >
              {dialogCopy.title}
            </h2>
            <p id="register-duplicate-body" className="mt-2 text-sm leading-relaxed text-zinc-600">
              {dialogCopy.body}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              {duplicateDialog === "already_active" ? (
                <Link
                  href={loginHref}
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                >
                  {copy.login}
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setDuplicateDialog(null)}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                {copy.alreadyEmailedDismiss}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <form onSubmit={(e) => void handleRegister(e)} className="space-y-4">
        {errorMessage ? (
          <p
            className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p
            className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900"
            role="status"
          >
            {successMessage}{" "}
            <Link href={loginHref} className="font-medium underline">
              {copy.goToLogin}
            </Link>
          </p>
        ) : null}

        <input
          className="w-full rounded border p-3"
          placeholder={copy.name}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={!!successMessage}
        />

        <input
          className="w-full rounded border p-3"
          placeholder={copy.email}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            if (!inviteLockedEmail) setEmail(e.target.value);
          }}
          readOnly={!!inviteLockedEmail}
          required
          disabled={!!successMessage}
        />

        <div>
          <label htmlFor="gender" className="mb-1 block text-sm font-medium text-zinc-800">
            {copy.gender}
          </label>
          <select
            id="gender"
            className="w-full rounded border p-3"
            value={gender}
            onChange={(e) =>
              setGender(e.target.value as (typeof genderOptions)[number]["value"])
            }
            required
            disabled={!!successMessage}
          >
            {genderOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">{copy.genderHint}</p>
        </div>

        <input
          className="w-full rounded border p-3"
          placeholder={copy.password}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          disabled={!!successMessage}
        />

        <button
          type="submit"
          disabled={isSubmitting || !!successMessage}
          className="w-full rounded bg-black p-3 text-white disabled:opacity-60"
        >
          {isSubmitting ? copy.creating : copy.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        {copy.hasAccount}{" "}
        <Link href={loginHref} className="font-medium text-zinc-900 underline">
          {copy.login}
        </Link>
      </p>
    </main>
  );
}
