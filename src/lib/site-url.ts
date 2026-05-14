/**
 * Canonical public URL for the app (no trailing slash).
 * Server: prefer BETTER_AUTH_URL, then NEXT_PUBLIC_APP_URL, then Vercel preview URL.
 */
export function getSiteUrl(): string {
  const explicit =
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${stripTrailingSlash(host)}`;
  }

  return "http://localhost:3000";
}

/** Origins allowed for CSRF / redirect validation in addition to `baseURL`. */
export function getExtraTrustedOrigins(): string[] {
  const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? [];
  return raw.map((s) => stripTrailingSlash(s.trim())).filter(Boolean);
}

export function getAuthSecret(): string | undefined {
  return (
    process.env.BETTER_AUTH_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    undefined
  );
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}
