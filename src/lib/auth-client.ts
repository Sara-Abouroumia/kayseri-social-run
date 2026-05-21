import { createAuthClient } from "better-auth/react";

/**
 * Browser: always call `/api/auth` on the same host the user opened (fixes Vercel preview / UAT
 * when NEXT_PUBLIC_APP_URL still points at production).
 * Server bundle: fall back to NEXT_PUBLIC_APP_URL when present.
 */
function resolveAuthClientBaseUrl(): string | undefined {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  return configured || undefined;
}

const baseURL = resolveAuthClientBaseUrl();

export const authClient = createAuthClient(baseURL ? { baseURL } : {});
