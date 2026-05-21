import { NextResponse } from "next/server";

import type { KayseriWeatherPayload } from "@/lib/kayseri-weather";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

/** Approximate centre of Kayseri, Türkiye */
const KAYSERI_LAT = 38.7204;
const KAYSERI_LON = 36.983;

export async function GET() {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(KAYSERI_LAT));
    url.searchParams.set("longitude", String(KAYSERI_LON));
    url.searchParams.set("current", "temperature_2m,weather_code");
    url.searchParams.set("timezone", "Europe/Istanbul");

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        // Open-Meteo recommends a descriptive User-Agent; generic server defaults may see empty responses or rate limits.
        "User-Agent": `KayseriSocialRun/1.0 (weather; +${getSiteUrl()})`,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      if (process.env.NODE_ENV === "development") {
        console.warn("[api/weather/kayseri] Open-Meteo HTTP", res.status, body.slice(0, 280));
      }
      return NextResponse.json(
        { error: "Weather service unavailable." },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      current?: {
        temperature_2m?: number;
        weather_code?: number;
        time?: string;
      };
    };

    const temp = data.current?.temperature_2m;
    const code = data.current?.weather_code;

    /** Open-Meteo usually sends ISO local time; fall back so we never 502 on a missing field alone. */
    const observedAt =
      typeof data.current?.time === "string" && data.current.time.trim().length > 0
        ? data.current.time.trim()
        : new Date().toISOString();

    if (typeof temp !== "number" || Number.isNaN(temp) || typeof code !== "number" || Number.isNaN(code)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[api/weather/kayseri] Unexpected payload:", JSON.stringify(data).slice(0, 500));
      }
      return NextResponse.json(
        { error: "Unexpected weather response." },
        { status: 502 },
      );
    }

    const payload: KayseriWeatherPayload = {
      tempC: Math.round(temp * 10) / 10,
      weatherCode: code,
      observedAt,
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[api/weather/kayseri] Fetch failed:", e);
    }
    return NextResponse.json({ error: "Failed to load weather." }, { status: 500 });
  }
}
