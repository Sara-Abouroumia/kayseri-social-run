"use client";

import { MutedLoopVideo } from "@/components/muted-loop-video";
import { instagramEmbedSrc } from "@/lib/instagram-url";

import type { MediaReelItem } from "./site-page-content";

type MediaReelGridProps = {
  items: readonly MediaReelItem[];
};

function MediaReelTile({
  url,
  videoSrc,
  videoPoster,
  featured,
}: MediaReelItem & { featured?: boolean }) {
  const embedSrc = instagramEmbedSrc(url);

  if (videoSrc) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`ksr-mreel${featured ? " ksr-mreel-feat" : ""}`}
      >
        <MutedLoopVideo
          src={videoSrc}
          poster={videoPoster}
          className="ksr-mreel-video"
        />
      </a>
    );
  }

  if (!embedSrc) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`ksr-mreel${featured ? " ksr-mreel-feat" : ""}`}
    >
      <iframe
        src={embedSrc}
        title="Instagram reel"
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture"
        className="ksr-mreel-embed"
      />
    </a>
  );
}

export function MediaReelGrid({ items }: MediaReelGridProps) {
  if (items.length === 0) return null;

  return (
    <div className="ksr-mediagrid">
      {items.map((item, index) => (
        <MediaReelTile key={item.url} {...item} featured={index === 0} />
      ))}
    </div>
  );
}
