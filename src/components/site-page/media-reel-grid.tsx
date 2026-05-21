"use client";

import { instagramEmbedSrc } from "@/lib/instagram-url";

import type { MediaReelItem } from "./site-page-content";

type MediaReelGridProps = {
  items: readonly MediaReelItem[];
};

function MediaReelTile({ url, videoSrc, featured }: MediaReelItem & { featured?: boolean }) {
  const embedSrc = instagramEmbedSrc(url);

  if (videoSrc) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`ksr-mreel${featured ? " ksr-mreel-feat" : ""}`}
      >
        <video
          src={videoSrc}
          className="ksr-mreel-video"
          muted
          playsInline
          loop
          autoPlay
          preload="metadata"
          aria-label="Silent looping video"
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
    <div className="ksr-mediagrid ksr-rev">
      {items.map((item, index) => (
        <MediaReelTile key={item.url} {...item} featured={index === 0} />
      ))}
    </div>
  );
}

