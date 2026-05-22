"use client";

import { useEffect, useRef } from "react";

type MutedLoopVideoProps = {
  src: string;
  poster?: string;
  className?: string;
};

/** Muted looping clip; loads and plays only when near/in the viewport (mobile-safe). */
export function MutedLoopVideo({ src, poster, className }: MutedLoopVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (video.preload === "none") {
              video.preload = "auto";
              video.load();
            }
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.2, rootMargin: "160px 0px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      key={src}
      src={src}
      poster={poster}
      className={className}
      muted
      playsInline
      loop
      preload="none"
      aria-label="Silent looping video"
    />
  );
}
