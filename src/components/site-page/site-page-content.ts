/** Non-text catalog data for the landing page (copy lives in i18n/messages/landing-page.ts). */

export const MERCH_TSHIRT_IMAGE = "/tishirt_merch.png";

export const TEAM_INITIALS = ["FG"] as const;

export type MediaReelItem = {
  /** instagram.com/p|reel|tv/… link */
  url: string;
  /** Optional local MP4/WebM for guaranteed muted autoplay loop */
  videoSrc?: string;
};

/** Instagram posts/reels shown in the Media section (section 04). */
export const MEDIA_REEL_ITEMS: readonly MediaReelItem[] = [
  {
    url: "https://www.instagram.com/reel/DYbuUX5snp6/",
    videoSrc: "/media/night-run.mp4",
  },
];
