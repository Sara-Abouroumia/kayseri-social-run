import { defaultLocale, type Locale } from "./config";
import { en, type Messages } from "./messages/en";
import { tr } from "./messages/tr";

const dictionaries: Record<Locale, Messages> = { en, tr };

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
