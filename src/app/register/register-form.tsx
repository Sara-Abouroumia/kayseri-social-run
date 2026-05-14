"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

type RegisterFormProps = {
  /** When set, user must register with this exact email (from admin invite link). */
  inviteLockedEmail: string | null;
};

export function RegisterForm({ inviteLockedEmail }: RegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(inviteLockedEmail ?? "");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (inviteLockedEmail && email.trim().toLowerCase() !== inviteLockedEmail) {
        setErrorMessage(
          `Use the invited email address (${inviteLockedEmail}) to complete this invitation.`,
        );
        return;
      }

      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (error) {
        setErrorMessage(error.message ?? "Could not create account");
        return;
      }

      const session = await authClient.getSession();
      if (session.data?.user?.emailVerified) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setSuccessMessage(
        "Check your inbox for a verification link. You must verify your email before you can sign in. " +
          (inviteLockedEmail
            ? "After verification, your admin access will turn on automatically."
            : ""),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-white px-6">
      <h1 className="mb-6 text-3xl font-bold">Create account</h1>

      {inviteLockedEmail ? (
        <p className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          You are registering from an <strong>admin invitation</strong>. Use the
          email address below (it is fixed to match your invite).
        </p>
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
            <Link href="/login" className="font-medium underline">
              Go to login
            </Link>
          </p>
        ) : null}

        <input
          className="w-full rounded border p-3"
          placeholder="Name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={!!successMessage}
        />

        <input
          className="w-full rounded border p-3"
          placeholder="Email"
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

        <input
          className="w-full rounded border p-3"
          placeholder="Password"
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
          {isSubmitting ? "Creating account…" : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline">
          Login
        </Link>
      </p>
    </main>
  );
}
