"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const VISIBLE_MS = 5000;
const FADE_MS = 300;

type EventCreatedToastProps = {
  message: string;
};

export function EventCreatedToast({ message }: EventCreatedToastProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (searchParams.get("created") !== "1") return;

    setVisible(true);
    setFading(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("created");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

    const fadeTimer = window.setTimeout(() => setFading(true), VISIBLE_MS - FADE_MS);
    const hideTimer = window.setTimeout(() => setVisible(false), VISIBLE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
    // Run once when landing after create redirect (?created=1).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed left-1/2 top-4 z-[100] w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-900 shadow-lg transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      {message}
    </div>
  );
}
