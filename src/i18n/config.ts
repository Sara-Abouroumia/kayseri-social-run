export const LOCALE_COOKIE = "NEXT_LOCALE";

export const locales = ["en", "tr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "tr";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "tr";
}
