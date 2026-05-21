/** Parse shortcode from instagram.com/p|reel|tv/… URLs. */
export function instagramShortcode(url: string): string | null {
  const match = url.trim().match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  return match?.[1] ?? null;
}

export function instagramEmbedSrc(url: string): string | null {
  const shortcode = instagramShortcode(url);
  if (!shortcode) return null;
  const isReel = /instagram\.com\/reel\//i.test(url);
  const path = isReel ? "reel" : "p";
  return `https://www.instagram.com/${path}/${shortcode}/embed/`;
}
