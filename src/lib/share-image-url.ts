/**
 * Absolute HTTPS URL for Open Graph / WhatsApp link previews.
 * Data URLs and relative paths are normalized; embedded DB images are skipped
 * (crawlers cannot fetch them — use Vercel Blob or an https URL for covers).
 */
export function resolveShareImageUrl(
  coverImageUrl: string | null | undefined,
  siteOrigin: string,
): string | undefined {
  if (!coverImageUrl?.trim()) return undefined;
  const url = coverImageUrl.trim();
  if (url.startsWith("data:")) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const origin = siteOrigin.replace(/\/+$/, "");
  if (url.startsWith("/")) return `${origin}${url}`;
  return `${origin}/${url}`;
}
