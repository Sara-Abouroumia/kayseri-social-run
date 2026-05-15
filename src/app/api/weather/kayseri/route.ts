import { NextResponse } from "next/server";

import type { KayseriWeatherPayload } from "@/lib/kayseri-weather";

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
      next: { revalidate: 600 },
    });

    if (!res.ok) {
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
    const time = data.current?.time;

    if (
      typeof temp !== "number" ||
      typeof code !== "number" ||
      typeof time !== "string"
    ) {
      return NextResponse.json(
        { error: "Unexpected weather response." },
        { status: 502 },
      );
    }

    const payload: KayseriWeatherPayload = {
      tempC: Math.round(temp * 10) / 10,
      weatherCode: code,
      observedAt: time,
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load weather." }, { status: 500 });
  }
}
