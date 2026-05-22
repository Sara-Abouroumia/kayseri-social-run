"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

function buildPathname(pathname: string, searchParams: URLSearchParams | null): string {
  const query = searchParams?.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function UsagePageTracker() {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const mountedAt = useRef<number>(Date.now());
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const fullPath = buildPathname(pathname, searchParams);
    if (fullPath === lastTrackedPath.current) return;

    const durationMs =
      lastTrackedPath.current != null
        ? Date.now() - mountedAt.current
        : undefined;

    lastTrackedPath.current = fullPath;
    mountedAt.current = Date.now();

    void fetch("/api/usage/page-view", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathname: fullPath,
        referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
        durationMs,
      }),
      keepalive: true,
    });
  }, [pathname, searchParams]);

  return null;
}
