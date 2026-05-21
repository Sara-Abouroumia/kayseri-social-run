"use client";

import { Caveat } from "next/font/google";
import { useState } from "react";

import type { IdeaBoxCopy } from "@/i18n/messages/idea-box";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const sharpie = Caveat({
  weight: "400",
  subsets: ["latin"],
});

export type MyCommunityIdea = {
  id: string;
  title: string;
  detail: string;
  createdAt: Date | string;
};

type Props = {
  ideas: MyCommunityIdea[];
  copy: IdeaBoxCopy;
  locale: Locale;
};

function formatWhen(d: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

const IDEA_TITLE_PASTELS = [
  { bg: "#fce7f3", hover: "#fbcfe8" },
  { bg: "#dbeafe", hover: "#bfdbfe" },
  { bg: "#d1fae5", hover: "#a7f3d0" },
  { bg: "#fef3c7", hover: "#fde68a" },
  { bg: "#e9d5ff", hover: "#d8b4fe" },
  { bg: "#ffedd5", hover: "#fed7aa" },
  { bg: "#ccfbf1", hover: "#99f6e4" },
  { bg: "#ffe4e6", hover: "#fecdd3" },
  { bg: "#e0e7ff", hover: "#c7d2fe" },
  { bg: "#ecfccb", hover: "#d9f99d" },
] as const;

function pastelForIdeaId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % IDEA_TITLE_PASTELS.length;
  }
  return IDEA_TITLE_PASTELS[hash]!;
}

/** Stable scatter offset per idea (fallen-from-box look). */
function scatterForIdeaId(id: string, index: number) {
  let h1 = 0;
  let h2 = 0;
  let h3 = 0;
  for (let i = 0; i < id.length; i++) {
    const c = id.charCodeAt(i);
    h1 = (h1 * 31 + c) % 997;
    h2 = (h2 * 17 + c) % 997;
    h3 = (h3 * 13 + c) % 997;
  }
  return {
    x: (h1 % 56) - 28 + (index % 2) * 6,
    y: (h2 % 48) + index * 10,
    r: (h3 % 26) - 13,
  };
}

function IdeaCountTag({
  count,
  suffix,
  emptyLabel,
  empty,
}: {
  count: number;
  suffix: string;
  emptyLabel: string;
  empty: boolean;
}) {
  const label = empty ? `0 ${emptyLabel}` : `${count} ${suffix}`;

  return (
    <div
      className={cn(
        "relative whitespace-nowrap rounded-md bg-black px-2 py-0.5 text-[10px] font-medium leading-tight text-white shadow-sm",
        empty && "bg-zinc-600",
      )}
      aria-label={label}
    >
      {label}
      <span
        className={cn(
          "absolute -bottom-1 left-2 h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-black",
          empty && "border-t-zinc-600",
        )}
        aria-hidden
      />
    </div>
  );
}

const BOX = {
  front: "22,46 70,46 70,90 22,90",
  right: "70,46 96,32 96,76 70,90",
  lid: "22,46 70,46 96,32 48,32",
  inner: "28,50 64,50 64,86 28,86",
  innerBack: "50,36 92,36 92,72 70,86",
  leftFlap: "22,46 48,32 40,26 16,38",
  rightFlap: "70,46 96,32 88,26 64,38",
} as const;

function IdeaVaultBox({ lidOpen, flipped }: { lidOpen: boolean; flipped: boolean }) {
  const stroke = {
    fill: "transparent",
    stroke: "black",
    strokeWidth: 2,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  const lidRotate = lidOpen ? -54 : 0;
  const leftFlapRotate = lidOpen ? -28 : 0;
  const rightFlapRotate = lidOpen ? 24 : 0;

  return (
    <div
      className="relative h-[8.75rem] w-[9.5rem] [perspective:560px]"
      style={{ perspectiveOrigin: "50% 45%" }}
    >
      <div
        className={cn(
          "relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.34,1.1,0.54,1)] motion-reduce:transition-none",
          flipped && "[transform:rotateX(180deg)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <svg viewBox="0 0 120 100" className="h-full w-full overflow-visible" aria-hidden>
          {/* 1 — Right face (behind) */}
          <polygon points={BOX.right} {...stroke} />

          {/* 2 — Front face */}
          <polygon points={BOX.front} {...stroke} />

          {/* 3 — Interior (only when open) */}
          <g
            className={cn(
              "transition-opacity duration-300 motion-reduce:transition-none",
              lidOpen ? "opacity-100" : "opacity-0",
            )}
          >
            <polygon
              points={BOX.innerBack}
              fill="transparent"
              stroke="black"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <polygon
              points={BOX.inner}
              fill="transparent"
              stroke="black"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line
              x1="28"
              y1="90"
              x2="64"
              y2="90"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>

          {/* 4 — Side flaps (hinge on front vertical edges) */}
          <g
            className="transition-opacity duration-300 motion-reduce:transition-none"
            style={{ opacity: lidOpen ? 1 : 0 }}
          >
            <g
              className="idea-vault-part"
              style={{
                transform: `rotate(${leftFlapRotate}deg)`,
                transformOrigin: "22px 46px",
              }}
            >
              <polygon points={BOX.leftFlap} {...stroke} />
            </g>
            <g
              className="idea-vault-part"
              style={{
                transform: `rotate(${rightFlapRotate}deg)`,
                transformOrigin: "70px 46px",
              }}
            >
              <polygon points={BOX.rightFlap} {...stroke} />
            </g>
          </g>

          {/* 5 — Lid (hinges on back/top edge, lifts away from viewer) */}
          <g
            className="idea-vault-part"
            style={{
              transform: `rotate(${lidRotate}deg)`,
              transformOrigin: "72px 32px",
            }}
          >
            <polygon points={BOX.lid} {...stroke} />
            {/* Lid underside edge when tilted */}
            <line
              x1="48"
              y1="32"
              x2="96"
              y2="32"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              className={cn(
                "transition-opacity duration-300",
                lidOpen ? "opacity-100" : "opacity-0",
              )}
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

type VaultProps = Props & {
  className?: string;
};

export function IdeaBoxVault({ ideas, copy, locale, className }: VaultProps) {
  const [dumped, setDumped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [wiggle, setWiggle] = useState(false);

  const lidOpen = hovered || dumped;
  const ideaCount = ideas.length;

  function handleBoxClick() {
    if (ideas.length === 0) {
      setWiggle(true);
      window.setTimeout(() => setWiggle(false), 450);
      return;
    }
    setDumped((open) => !open);
    if (dumped) setExpandedId(null);
  }

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center overflow-visible",
        dumped && ideas.length > 0 && "min-w-[15rem]",
        className,
      )}
      aria-labelledby="my-ideas-vault-label"
    >
      <p id="my-ideas-vault-label" className="sr-only">
        {copy.myIdeasHeading}
      </p>

      <div className="inline-flex flex-col items-center gap-1.5">
        <IdeaCountTag
          count={ideaCount}
          suffix={copy.myIdeasCountSuffix}
          emptyLabel={copy.myIdeasCountEmpty}
          empty={ideaCount === 0}
        />

        <button
          type="button"
          onClick={handleBoxClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          aria-expanded={dumped}
          aria-label={dumped ? copy.myIdeasTapClose : copy.myIdeasTapOpen}
          className={cn(
            "overflow-visible rounded-lg p-2 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
            wiggle && "idea-vault-wiggle",
          )}
        >
          <IdeaVaultBox lidOpen={lidOpen} flipped={dumped} />
        </button>
      </div>

      <p className="mt-1.5 max-w-[9.5rem] text-center text-[10px] leading-snug text-zinc-500">
        {ideas.length === 0 ? copy.myIdeasEmpty : dumped ? copy.myIdeasTapClose : copy.myIdeasTapOpen}
      </p>

      {dumped && ideas.length > 0 ? (
        <ul
          className="relative mt-2 w-[15rem] min-w-[11rem]"
          style={{ minHeight: `${Math.max(ideas.length * 12 + 72, 88)}px` }}
        >
          {ideas.map((idea, index) => {
            const isOpen = expandedId === idea.id;
            const submittedAt = new Date(idea.createdAt);
            const pastel = pastelForIdeaId(idea.id);
            const scatter = scatterForIdeaId(idea.id, index);

            return (
              <li
                key={idea.id}
                className="absolute w-[11.5rem] max-w-full"
                style={{
                  left: `calc(50% + ${scatter.x}px)`,
                  top: scatter.y,
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  className="idea-vault-drop-item"
                  style={
                    {
                      animationDelay: `${index * 85}ms`,
                      "--drop-r": `${scatter.r}deg`,
                    } as React.CSSProperties
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId((current) => (current === idea.id ? null : idea.id))
                    }
                    aria-expanded={isOpen}
                    className="w-full border-2 border-black px-2.5 py-2 text-left transition-[background-color] hover:[background-color:var(--idea-pastel-hover)]"
                    style={
                      {
                        backgroundColor: isOpen ? pastel.hover : pastel.bg,
                        "--idea-pastel-hover": pastel.hover,
                      } as React.CSSProperties
                    }
                  >
                    <span className="flex items-start gap-3.5">
                      <span className="shrink-0 pt-0.5 font-sans text-xs font-semibold tabular-nums leading-none text-zinc-800">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          sharpie.className,
                          "idea-sharpie-title line-clamp-2 min-w-0 flex-1 text-[0.95rem] font-normal leading-snug text-zinc-900",
                        )}
                      >
                        {idea.title}
                      </span>
                    </span>
                    <span className="sr-only">
                      {isOpen ? copy.myIdeaCollapse : copy.myIdeaExpand}
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="mt-1 border-2 border-black bg-white/90 px-3 py-2.5">
                      <time
                        className="text-xs text-zinc-500"
                        dateTime={submittedAt.toISOString()}
                      >
                        {formatWhen(submittedAt, locale)}
                      </time>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
                        {idea.detail}
                      </p>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
