import { MobileWeatherFooterPortal } from "@/components/mobile-weather-footer-portal";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";

/** Compact icon + temperature only, bottom-left on mobile (not in the expandable menu). */
export async function MobileWeatherFooter() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return <MobileWeatherFooterPortal locale={locale} labels={dict.navWeather} />;
}
