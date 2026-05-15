import type { Locale } from "@/i18n/config";

/**
 * Human-readable weather for WMO interpretation codes (Open-Meteo current.weather_code).
 * @see https://open-meteo.com/en/docs
 */
export function getWeatherDescription(locale: Locale, code: number): string {
  const tr = locale === "tr";

  switch (code) {
    case 0:
      return tr ? "Açık gökyüzü" : "Clear sky";
    case 1:
      return tr ? "Çoğunlukla açık" : "Mainly clear";
    case 2:
      return tr ? "Parçalı bulutlu" : "Partly cloudy";
    case 3:
      return tr ? "Kapalı" : "Overcast";
    case 45:
      return tr ? "Sis" : "Fog";
    case 48:
      return tr ? "Kırağılı sis" : "Rime fog";
    case 51:
      return tr ? "Hafif çisenti" : "Light drizzle";
    case 53:
      return tr ? "Orta şiddetli çisenti" : "Moderate drizzle";
    case 55:
      return tr ? "Yoğun çisenti" : "Heavy drizzle";
    case 56:
      return tr ? "Hafif donan çisenti" : "Light freezing drizzle";
    case 57:
      return tr ? "Yoğun donan çisenti" : "Heavy freezing drizzle";
    case 61:
      return tr ? "Hafif yağmur" : "Light rain";
    case 63:
      return tr ? "Orta şiddetli yağmur" : "Moderate rain";
    case 65:
      return tr ? "Şiddetli yağmur" : "Heavy rain";
    case 66:
      return tr ? "Hafif donan yağmur" : "Light freezing rain";
    case 67:
      return tr ? "Şiddetli donan yağmur" : "Heavy freezing rain";
    case 71:
      return tr ? "Hafif kar" : "Light snow";
    case 73:
      return tr ? "Orta şiddetli kar" : "Moderate snow";
    case 75:
      return tr ? "Yoğun kar" : "Heavy snow";
    case 77:
      return tr ? "Kar taneleri" : "Snow grains";
    case 80:
      return tr ? "Hafif sağanak" : "Light rain showers";
    case 81:
      return tr ? "Orta sağanak" : "Moderate rain showers";
    case 82:
      return tr ? "Şiddetli sağanak" : "Heavy rain showers";
    case 85:
      return tr ? "Hafif kar sağanağı" : "Light snow showers";
    case 86:
      return tr ? "Yoğun kar sağanağı" : "Heavy snow showers";
    case 95:
      return tr ? "Gök gürültülü fırtına" : "Thunderstorm";
    case 96:
      return tr ? "Hafif dolulu fırtına" : "Thunderstorm with slight hail";
    case 99:
      return tr ? "Şiddetli dolulu fırtına" : "Thunderstorm with heavy hail";
    default:
      if (code >= 51 && code <= 57) return tr ? "Çisenti" : "Drizzle";
      if (code >= 61 && code <= 67) return tr ? "Yağmurlu" : "Rain";
      if (code >= 71 && code <= 77) return tr ? "Karlı" : "Snow";
      if (code >= 80 && code <= 82) return tr ? "Sağanak yağmur" : "Rain showers";
      if (code >= 85 && code <= 86) return tr ? "Kar sağanağı" : "Snow showers";
      if (code >= 95) return tr ? "Fırtına" : "Thunderstorm";
      return tr ? "Bulutlu" : "Cloudy";
  }
}
