"use client";

import { useMemo, useState } from "react";

import type { LocationMapPoint } from "@/lib/usage-analytics";
import { projectToMap } from "@/lib/geo-coordinates";
import { cn } from "@/lib/utils";

type UsageVisitorMapProps = {
  points: LocationMapPoint[];
  title: string;
  hint: string;
  emptyLabel: string;
  viewsLabel: string;
  visitorsLabel: string;
};

function dotRadius(views: number): number {
  return 5 + Math.min(16, Math.sqrt(views) * 2.5);
}

/** Simplified land masses for context (equirectangular, decorative). */
function WorldSilhouette() {
  return (
    <g fill="rgb(63 63 70 / 0.35)" stroke="none" aria-hidden>
      <path d="M148,158 198,118 268,108 318,128 358,168 338,218 288,248 218,238 168,208z" />
      <path d="M418,98 498,78 578,88 638,128 658,178 628,228 558,258 478,248 418,218 398,168z" />
      <path d="M458,268 528,248 598,258 648,288 668,338 638,388 568,418 488,408 438,368 428,318z" />
      <path d="M698,118 778,98 858,108 918,148 938,208 908,268 838,298 758,288 698,258 678,198z" />
      <path d="M718,318 798,298 878,308 928,348 938,408 898,458 818,478 738,468 698,428 688,368z" />
      <path d="M168,318 228,288 298,298 348,338 358,398 318,448 248,468 188,448 158,388z" />
    </g>
  );
}

export function UsageVisitorMap({
  points,
  title,
  hint,
  emptyLabel,
  viewsLabel,
  visitorsLabel,
}: UsageVisitorMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const projected = useMemo(
    () =>
      points.map((p) => ({
        ...p,
        ...projectToMap({ lat: p.lat, lng: p.lng }),
        r: dotRadius(p.views),
      })),
    [points],
  );

  const active = projected.find((p) => p.id === activeId) ?? null;

  return (
    <div className="flex h-full min-h-[280px] flex-col">
      <div className="mb-3">
        <h2 className="text-lg font-medium text-zinc-900">{title}</h2>
        <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950">
        {projected.length === 0 ? (
          <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-zinc-500">
            {emptyLabel}
          </p>
        ) : (
          <svg
            viewBox="0 0 1000 500"
            className="h-full w-full min-h-[240px]"
            role="img"
            aria-label={title}
          >
            <defs>
              <radialGradient id="ksr-map-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgb(167 139 250)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="rgb(109 40 217)" stopOpacity="0.5" />
              </radialGradient>
            </defs>

            <rect width="1000" height="500" fill="rgb(9 9 11)" />
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={`v-${i}`}
                x1={(i / 4) * 1000}
                y1={0}
                x2={(i / 4) * 1000}
                y2={500}
                stroke="rgb(63 63 70 / 0.25)"
                strokeWidth={1}
              />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={(i / 3) * 500}
                x2={1000}
                y2={(i / 3) * 500}
                stroke="rgb(63 63 70 / 0.25)"
                strokeWidth={1}
              />
            ))}
            <WorldSilhouette />

            {projected.map((p) => {
              const isActive = p.id === activeId;
              return (
                <g
                  key={p.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveId(p.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onFocus={() => setActiveId(p.id)}
                  onBlur={() => setActiveId(null)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.r + 4}
                    fill="rgb(139 92 246 / 0.15)"
                    className={cn(
                      "transition-opacity",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.r}
                    fill="url(#ksr-map-glow)"
                    stroke={isActive ? "white" : "rgb(216 180 254)"}
                    strokeWidth={isActive ? 2 : 1}
                    opacity={isActive ? 1 : 0.85}
                  />
                </g>
              );
            })}
          </svg>
        )}

        {active ? (
          <div
            className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-md border border-violet-500/30 bg-zinc-900/95 px-3 py-2 text-sm text-zinc-100 shadow-lg backdrop-blur-sm"
            role="status"
          >
            <p className="font-medium">{active.label}</p>
            <p className="mt-0.5 text-xs text-zinc-400">
              {viewsLabel}: {active.views} · {visitorsLabel}: {active.uniqueVisitors}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
