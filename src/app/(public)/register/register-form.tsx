"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import type { Messages } from "@/i18n/messages/en";
import { cn } from "@/lib/utils";

import { submitRegistrationAction } from "./register-actions";

type RegisterFormProps = {
  inviteLockedEmail: string | null;
  defaultNext: string;
  copy: Messages["register"];
};

type RegisterResultDialog =
  | { kind: "success"; adminInvite: boolean; resent?: boolean }
  | { kind: "error"; message: string }
  | { kind: "awaiting_verification" }
  | { kind: "already_active" }
  | { kind: "invite_mismatch"; expectedEmail: string };

function RegisterResultModal({
  dialog,
  copy,
  loginHref,
  onClose,
}: {
  dialog: RegisterResultDialog;
  copy: Messages["register"];
  loginHref: string;
  onClose: () => void;
}) {
  const isSuccess = dialog.kind === "success";
  const showLogin =
    dialog.kind === "success" ||
    dialog.kind === "already_active" ||
    dialog.kind === "awaiting_verification";

  const title =
    dialog.kind === "success"
      ? dialog.resent
        ? copy.resentVerificationTitle
        : copy.successTitle
      : dialog.kind === "error"
        ? copy.errorTitle
        : dialog.kind === "invite_mismatch"
          ? copy.inviteMismatchTitle
          : dialog.kind === "already_active"
            ? copy.alreadyAccountTitle
            : copy.alreadyEmailedTitle;

  const body =
    dialog.kind === "success"
      ? dialog.resent
        ? copy.resentVerificationBody
        : copy.checkInbox + (dialog.adminInvite ? ` ${copy.afterVerifyAdmin}` : "")
      : dialog.kind === "error"
        ? dialog.message
        : dialog.kind === "invite_mismatch"
          ? `${copy.inviteEmailUse} (${dialog.expectedEmail}) ${copy.inviteEmailSuffix}`
          : dialog.kind === "already_active"
            ? copy.alreadyAccountBody
            : copy.alreadyEmailedBody;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "max-w-md rounded-lg border bg-white p-6 shadow-lg",
          isSuccess ? "border-emerald-200" : "border-zinc-200",
        )}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="register-result-title"
        aria-describedby="register-result-body"
      >
        <h2
          id="register-result-title"
          className={cn(
            "text-lg font-semibold",
            isSuccess ? "text-emerald-950" : "text-zinc-900",
          )}
        >
          {title}
        </h2>
        <p
          id="register-result-body"
          className={cn(
            "mt-2 text-sm leading-relaxed",
            isSuccess ? "text-emerald-900" : "text-zinc-600",
          )}
        >
          {body}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          {showLogin ? (
            <Link
              href={loginHref}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              {dialog.kind === "already_active" ? copy.login : copy.goToLogin}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium text-white",
              isSuccess ? "bg-emerald-700 hover:bg-emerald-800" : "bg-zinc-900 hover:bg-zinc-800",
            )}
          >
            {copy.dialogDismiss}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RegisterForm({ inviteLockedEmail, defaultNext, copy }: RegisterFormProps) {
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
  const [resultDialog, setResultDialog] = useState<RegisterResultDialog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginHref =
    defaultNext === "/dashboard"
      ? "/login"
      : `/login?next=${encodeURIComponent(defaultNext)}`;

  const registrationComplete = resultDialog?.kind === "success";

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setResultDialog(null);
    setIsSubmitting(true);

    try {
      const result = await submitRegistrationAction(
        {
          name,
          email,
          password,
          gender,
          callbackURL: defaultNext,
        },
        inviteLockedEmail,
      );

      switch (result.outcome) {
        case "verification_sent":
          setResultDialog({
            kind: "success",
            adminInvite: Boolean(inviteLockedEmail),
          });
          break;
        case "verification_resent":
          setResultDialog({
            kind: "success",
            adminInvite: Boolean(inviteLockedEmail),
            resent: true,
          });
          break;
        case "pending_verification":
          setResultDialog({ kind: "awaiting_verification" });
          break;
        case "already_active":
          setResultDialog({ kind: "already_active" });
          break;
        case "invite_mismatch":
          setResultDialog({
            kind: "invite_mismatch",
            expectedEmail: inviteLockedEmail ?? email,
          });
          break;
        case "error":
        default:
          setResultDialog({
            kind: "error",
            message: result.message ?? copy.errorGeneric,
          });
          break;
      }
    } catch {
      setResultDialog({
        kind: "error",
        message: copy.errorNetwork,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-white px-6">
      <h1 className="mb-6 text-3xl font-bold">{copy.title}</h1>

      {inviteLockedEmail ? (
        <p className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          {copy.inviteBanner}
        </p>
      ) : null}

      {resultDialog ? (
        <RegisterResultModal
          dialog={resultDialog}
          copy={copy}
          loginHref={loginHref}
          onClose={() => setResultDialog(null)}
        />
      ) : null}

      <form onSubmit={(e) => void handleRegister(e)} className="space-y-4">
        <fieldset
          disabled={isSubmitting || registrationComplete}
          className="space-y-4 disabled:opacity-70"
        >
          <input
            className="w-full rounded border p-3"
            placeholder={copy.name}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
          />
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting || registrationComplete}
          className="flex w-full items-center justify-center gap-2 rounded bg-black p-3 text-white disabled:opacity-60"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              <span>{copy.processing}</span>
            </>
          ) : (
            copy.submit
          )}
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
