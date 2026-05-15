/**
 * Returns a safe same-origin path for post-auth redirects.
 * Rejects protocol-relative URLs and non-root-relative paths.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback: string,
): string {
  if (next == null || typeof next !== "string") return fallback;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  if (t.includes("\0") || t.includes("\\")) return fallback;
  return t;
}
