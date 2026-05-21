"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import { KayseriWeatherClock } from "@/components/kayseri-weather-clock";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages/en";

type Props = {
  locale: Locale;
  labels: Messages["navWeather"];
};

/** Compact weather in `document.body` so it stays bottom-left on mobile and avoids layout clipping. */
export function MobileWeatherFooterPortal({ locale, labels }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <footer
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] flex justify-start p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
      aria-label={labels.kayseri}
    >
      <KayseriWeatherClock
        locale={locale}
        labels={labels}
        variant="footer"
        className="pointer-events-auto rounded-lg bg-white/95 px-2.5 py-1.5 shadow-sm ring-1 ring-zinc-200/80 backdrop-blur-sm"
      />
    </footer>,
    document.body,
  );
}
