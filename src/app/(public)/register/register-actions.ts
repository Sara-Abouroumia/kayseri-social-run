"use server";

import { headers } from "next/headers";
import { z } from "zod";

import {
  deleteExpiredVerificationsForEmail,
  getRegisterEmailStatus,
} from "@/lib/register-email-check";
import { getSiteUrl } from "@/lib/site-url";

const emailSchema = z.string().trim().email();
const genderSchema = z.enum(["female", "male"]);

const submitSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: emailSchema,
  password: z.string().min(8).max(128),
  gender: genderSchema,
  callbackURL: z.string().trim().min(1).max(500),
});

export type RegisterSubmitOutcome =
  | "verification_sent"
  | "verification_resent"
  | "pending_verification"
  | "pending_verification_expired"
  | "already_active"
  | "invite_mismatch"
  | "error";

export type RegisterSubmitResult = {
  ok: boolean;
  outcome: RegisterSubmitOutcome;
  message?: string;
};

export async function checkRegisterEmailAction(
  email: string,
): Promise<{ status: Awaited<ReturnType<typeof getRegisterEmailStatus>> }> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { status: "available" };
  }
  const status = await getRegisterEmailStatus(parsed.data);
  return { status };
}

async function authFetch(path: string, body: Record<string, unknown>): Promise<Response> {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const origin = getSiteUrl();

  return fetch(`${origin}/api/auth${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

export async function submitRegistrationAction(
  input: z.infer<typeof submitSchema>,
  inviteLockedEmail: string | null,
): Promise<RegisterSubmitResult> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, outcome: "error", message: "Invalid registration details." };
  }

  const { name, email, password, gender, callbackURL } = parsed.data;
  const normalized = email.trim().toLowerCase();

  if (inviteLockedEmail && normalized !== inviteLockedEmail) {
    return { ok: false, outcome: "invite_mismatch" };
  }

  const status = await getRegisterEmailStatus(normalized);

  if (status === "pending_verification") {
    return { ok: false, outcome: "pending_verification" };
  }

  if (status === "already_active") {
    return { ok: false, outcome: "already_active" };
  }

  if (status === "pending_verification_expired") {
    await deleteExpiredVerificationsForEmail(normalized);

    const signInRes = await authFetch("/sign-in/email", {
      email: normalized,
      password,
      callbackURL,
    });

    if (!signInRes.ok) {
      const data = (await signInRes.json().catch(() => ({}))) as {
        message?: string;
      };
      return {
        ok: false,
        outcome: "error",
        message: data.message ?? "Could not resend verification email.",
      };
    }

    return { ok: true, outcome: "verification_resent" };
  }

  const signUpRes = await authFetch("/sign-up/email", {
    name,
    email: normalized,
    password,
    gender,
    callbackURL,
  });

  if (!signUpRes.ok) {
    const data = (await signUpRes.json().catch(() => ({}))) as { message?: string };
    const retryStatus = await getRegisterEmailStatus(normalized);
    if (retryStatus === "pending_verification") {
      return { ok: false, outcome: "pending_verification" };
    }
    if (retryStatus === "already_active") {
      return { ok: false, outcome: "already_active" };
    }
    return {
      ok: false,
      outcome: "error",
      message: data.message ?? "Could not create account.",
    };
  }

  return { ok: true, outcome: "verification_sent" };
}
