"use client";

import { useEffect, useState } from "react";

const VISIBLE_MS = 5000;
const FADE_MS = 300;

type SuccessToastProps = {
  message: string;
  show: boolean;
};

export function SuccessToast({ message, show }: SuccessToastProps) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      setFading(false);
      return;
    }

    setVisible(true);
    setFading(false);

    const fadeTimer = window.setTimeout(() => setFading(true), VISIBLE_MS - FADE_MS);
    const hideTimer = window.setTimeout(() => setVisible(false), VISIBLE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [show]);

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
