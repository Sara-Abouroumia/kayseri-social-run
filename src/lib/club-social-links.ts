/** Public club social URLs; override with NEXT_PUBLIC_* in `.env.local` if they change. */

const DEFAULT_INSTAGRAM = "https://www.instagram.com/kayserisocialrun/";
/** Direct WhatsApp group invite (unwraps the Instagram redirect link). */
const DEFAULT_WHATSAPP = "https://chat.whatsapp.com/F7LJ8DP1uCPBSFBOxnufxo";

export function getClubInstagramUrl(): string {
  const v = process.env.NEXT_PUBLIC_CLUB_INSTAGRAM_URL?.trim();
  return v && /^https?:\/\//i.test(v) ? v : DEFAULT_INSTAGRAM;
}

export function getClubWhatsAppUrl(): string {
  const v = process.env.NEXT_PUBLIC_CLUB_WHATSAPP_URL?.trim();
  return v && /^https?:\/\//i.test(v) ? v : DEFAULT_WHATSAPP;
}
