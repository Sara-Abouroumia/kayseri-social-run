"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@/i18n/config";
import type { KayseriWeatherPayload } from "@/lib/kayseri-weather";
import { getWeatherDescription } from "@/lib/weather-wmo-description";
import { getWeatherIconMeta } from "@/lib/weather-wmo-icon";
import { cn } from "@/lib/utils";

type Labels = {
  kayseri: string;
  loading: string;
  error: string;
};

type Props = {
  locale: Locale;
  labels: Labels;
  className?: string;
};

const TIME_ZONE = "Europe/Istanbul";

const shellClass =
  "flex min-w-0 shrink items-center gap-2 text-sm leading-tight text-zinc-700 @min-[26rem]/topbar:gap-2.5";

function formatKayseriTime(locale: Locale, date: Date) {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function KayseriWeatherClock({ locale, labels, className }: Props) {
  const [now, setNow] = useState(() => new Date());
  const [data, setData] = useState<KayseriWeatherPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "idle" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/weather/kayseri", { cache: "no-store" });
        if (!res.ok) throw new Error("bad");
        const json = (await res.json()) as KayseriWeatherPayload;
        if (typeof json.tempC !== "number" || typeof json.weatherCode !== "number") {
          throw new Error("shape");
        }
        if (!cancelled) {
          setData(json);
          setStatus("idle");
        }
      } catch {
        if (!cancelled) {
          setData(null);
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const clock = formatKayseriTime(locale, now);
  const meta = data ? getWeatherIconMeta(data.weatherCode) : null;
  const Icon = meta?.Icon;
  const description = data ? getWeatherDescription(locale, data.weatherCode) : null;
  const ariaWeather =
    data && description
      ? `${labels.kayseri}, ${description}, ${Math.round(data.tempC)}°C, ${clock}`
      : `${labels.kayseri}, ${clock}`;

  return (
    <div
      className={cn("min-w-0", className)}
      role="status"
      aria-live="polite"
      aria-label={ariaWeather}
    >
      {/* Compact: icon + time when the top bar is tight */}
      <div className={cn(shellClass, "flex @min-[26rem]/topbar:hidden")}>
        {status === "loading" || !data ? (
          <>
            <span className="inline-block h-5 w-5 shrink-0 rounded-full bg-zinc-200/80" aria-hidden />
            <span className="shrink-0 text-sm font-medium tabular-nums text-zinc-700">{clock}</span>
          </>
        ) : status === "error" ? (
          <>
            {Icon ? (
              <Icon className="h-5 w-5 shrink-0 text-sky-600" strokeWidth={1.75} aria-hidden />
            ) : null}
            <span className="shrink-0 text-sm font-medium tabular-nums text-zinc-500">{clock}</span>
          </>
        ) : (
          <>
            {Icon ? (
              <Icon className="h-5 w-5 shrink-0 text-sky-600" strokeWidth={1.75} aria-hidden />
            ) : null}
            <span className="shrink-0 text-sm font-medium tabular-nums text-zinc-700">{clock}</span>
          </>
        )}
      </div>

      {/* Full forecast when there is room */}
      <div className={cn(shellClass, "hidden @min-[26rem]/topbar:flex")}>
        {status === "error" ? (
          <span className="text-sm text-zinc-400">{labels.error}</span>
        ) : status === "loading" || !data ? (
          <span className="text-sm tabular-nums text-zinc-500">{labels.loading}</span>
        ) : (
          <>
            {Icon ? (
              <Icon className="h-6 w-6 shrink-0 text-sky-600" strokeWidth={1.75} aria-hidden />
            ) : null}
            <span className="text-sm font-medium text-zinc-500">{labels.kayseri}</span>
            <span className="text-sm font-semibold tabular-nums text-zinc-900">
              {Math.round(data.tempC)}°C
            </span>
            {description ? (
              <span
                className="min-w-0 max-w-[10rem] truncate text-sm text-zinc-600"
                title={description}
              >
                {description}
              </span>
            ) : null}
            <span className="h-4 w-px shrink-0 bg-zinc-200" aria-hidden />
            <span className="shrink-0 text-sm font-medium tabular-nums text-zinc-600">{clock}</span>
          </>
        )}
      </div>
    </div>
  );
}
