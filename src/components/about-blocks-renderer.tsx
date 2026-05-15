import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { AboutBlock } from "@/db/schema/site-about";
import { cn } from "@/lib/utils";

/** `next/image` calls `new URL(src)` — drafts like `https://` throw at runtime. */
function isAbsoluteHttpUrl(src: string): boolean {
  try {
    const u = new URL(src.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function linkifyPlainText(text: string): ReactNode[] {
  const segments = text.split(/(\n|https?:\/\/[^\s<]+[^\s.,);!?]*)/g);
  return segments.map((seg, i) => {
    if (seg === "\n") {
      return <br key={i} />;
    }
    if (/^https?:\/\//i.test(seg)) {
      return (
        <a
          key={i}
          href={seg}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-900"
        >
          {seg}
        </a>
      );
    }
    return <span key={i}>{seg}</span>;
  });
}

const pageShell: Record<"default" | "warm" | "sky", string> = {
  default: "bg-white",
  warm: "bg-amber-50/70",
  sky: "bg-sky-50/50",
};

type Props = {
  blocks: AboutBlock[];
  pageStyle: "default" | "warm" | "sky";
  className?: string;
};

/** Break out of centered column to edge-to-edge (safe with `overflow-x-hidden` on parent). */
function FullBleed({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-none overflow-hidden">
      {children}
    </div>
  );
}

function MutedLoopVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  return (
    <video
      key={src}
      src={src}
      poster={poster}
      className={className}
      muted
      playsInline
      loop
      autoPlay
      preload="metadata"
      aria-label="Silent looping video"
    />
  );
}

function HeroBlock({ block }: { block: Extract<AboutBlock, { type: "hero" }> }) {
  if (block.media === "image") {
    const alt = block.alt?.trim() || "";
    const isData = block.url.startsWith("data:");
    const useNextImage = !isData && isAbsoluteHttpUrl(block.url);
    return (
      <div className="relative aspect-[5/3] max-h-[min(70vh,32rem)] w-full bg-zinc-900 sm:aspect-[21/9]">
        {isData ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URLs from admin upload
          <img
            src={block.url}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : useNextImage ? (
          <Image
            src={block.url}
            alt={alt}
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
            priority
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- invalid draft URL or non-http
          <img
            src={block.url}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
    );
  }

  const poster = block.posterUrl?.trim();
  const safePoster =
    poster &&
    (poster.startsWith("data:image/") || isAbsoluteHttpUrl(poster))
      ? poster
      : undefined;
  return (
    <div className="relative aspect-[5/3] max-h-[min(70vh,32rem)] w-full bg-black sm:aspect-[21/9]">
      <MutedLoopVideo
        src={block.url}
        poster={safePoster}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

export function AboutBlocksRenderer({ blocks, pageStyle, className }: Props) {
  return (
    <div className={cn("min-h-0 overflow-x-hidden", pageShell[pageStyle], className)}>
      <div className="flex flex-col gap-8 py-8 sm:gap-10 sm:py-12">
        {blocks.map((block, index) =>
          block.type === "hero" ? (
            <FullBleed key={`hero-${index}`}>
              <HeroBlock block={block} />
            </FullBleed>
          ) : (
            <div key={`row-${index}`} className="mx-auto w-full max-w-4xl px-6 sm:px-8">
              <AboutBlockView block={block} />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function AboutBlockView({ block }: { block: AboutBlock }) {
  switch (block.type) {
    case "heading": {
      const cls =
        block.level === 1
          ? "text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl"
          : block.level === 2
            ? "text-xl font-semibold text-zinc-900 sm:text-2xl"
            : "text-lg font-semibold text-zinc-900";
      if (block.level === 1) {
        return <h1 className={cls}>{block.text}</h1>;
      }
      if (block.level === 2) {
        return <h2 className={cls}>{block.text}</h2>;
      }
      return <h3 className={cls}>{block.text}</h3>;
    }
    case "paragraph":
      return (
        <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-700">
          {linkifyPlainText(block.text)}
        </p>
      );
    case "image": {
      const alt = block.alt?.trim() || "";
      const isData = block.url.startsWith("data:");
      const useNextImage = !isData && isAbsoluteHttpUrl(block.url);
      return (
        <figure className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 shadow-sm">
          {isData ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URLs from admin upload
            <img src={block.url} alt={alt} className="h-auto w-full object-cover" />
          ) : useNextImage ? (
            <Image
              src={block.url}
              alt={alt}
              width={1200}
              height={675}
              className="h-auto w-full object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              unoptimized
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- invalid draft URL or non-http
            <img src={block.url} alt={alt} className="h-auto w-full object-cover" />
          )}
        </figure>
      );
    }
    case "video": {
      const rawPoster = block.posterUrl?.trim();
      const poster =
        rawPoster &&
        (rawPoster.startsWith("data:image/") || isAbsoluteHttpUrl(rawPoster))
          ? rawPoster
          : undefined;
      return (
        <figure className="overflow-hidden rounded-lg border border-zinc-200 bg-black shadow-sm">
          <div className="relative aspect-video max-h-[min(70vh,28rem)] w-full">
            <MutedLoopVideo
              src={block.url}
              poster={poster}
              className="h-full w-full object-cover"
            />
          </div>
        </figure>
      );
    }
    case "button": {
      const external = /^https?:\/\//i.test(block.url);
      const btnClass =
        block.variant === "primary"
          ? "inline-flex rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
          : "inline-flex rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50";
      if (external) {
        return (
          <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            className={btnClass}
          >
            {block.label}
          </a>
        );
      }
      return (
        <Link href={block.url} className={btnClass}>
          {block.label}
        </Link>
      );
    }
    case "divider":
      return <hr className="border-t border-zinc-200" />;
    case "hero":
      return null;
    default:
      return null;
  }
}
