import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";

/** WMO weather interpretation codes (Open-Meteo). */
export function getWeatherIconMeta(code: number): { Icon: LucideIcon; label: string } {
  if (code === 0) return { Icon: Sun, label: "Clear sky" };
  if (code === 1) return { Icon: CloudSun, label: "Mainly clear" };
  if (code === 2) return { Icon: CloudSun, label: "Partly cloudy" };
  if (code === 3) return { Icon: Cloud, label: "Overcast" };
  if (code === 45 || code === 48) return { Icon: CloudFog, label: "Fog" };
  if (code >= 51 && code <= 57) return { Icon: CloudRain, label: "Drizzle" };
  if (code >= 61 && code <= 67) return { Icon: CloudRain, label: "Rain" };
  if (code >= 71 && code <= 77) return { Icon: CloudSnow, label: "Snow" };
  if (code >= 80 && code <= 82) return { Icon: CloudRain, label: "Rain showers" };
  if (code >= 85 && code <= 86) return { Icon: CloudSnow, label: "Snow showers" };
  if (code >= 95) return { Icon: CloudLightning, label: "Thunderstorm" };
  return { Icon: Cloud, label: "Cloudy" };
}
