function vercelHostToOrigin(host: string): string {
  const cleaned = host.replace(/^https?:\/\//, "");
  return `https://${stripTrailingSlash(cleaned)}`;
}

function vercelDeploymentOrigin(): string | null {
  const raw = process.env.VERCEL_URL?.trim();
  if (!raw) return null;
  return vercelHostToOrigin(raw);
}

/**
 * Canonical public URL for the app (no trailing slash).
 * Preview deployments use the deployment hostname so UAT does not inherit production URLs from env.
 */
export function getSiteUrl(): string {
  if (process.env.VERCEL_ENV === "preview") {
    const preview = vercelDeploymentOrigin();
    if (preview) return preview;
  }

  const explicit =
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const vercel = vercelDeploymentOrigin();
  if (vercel) return vercel;

  return "http://localhost:3000";
}

/** Origins allowed for CSRF / redirect validation in addition to `baseURL`. */
export function getExtraTrustedOrigins(): string[] {
  const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? [];
  return raw.map((s) => stripTrailingSlash(s.trim())).filter(Boolean);
}

/** `baseURL` plus env extras and current Vercel deployment host(s). */
export function getTrustedOrigins(): string[] {
  const origins = new Set<string>([getSiteUrl(), ...getExtraTrustedOrigins()]);

  const branchUrl = process.env.VERCEL_BRANCH_URL?.trim();
  if (branchUrl) origins.add(vercelHostToOrigin(branchUrl));

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) origins.add(vercelHostToOrigin(productionUrl));

  return [...origins];
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
