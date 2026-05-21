"use client";

import { useEffect, useRef } from "react";

export function ScrollProgressBar() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pb = progressRef.current;
    const onScroll = () => {
      if (!pb) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      pb.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : "0%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div ref={progressRef} className="ksr-pbar" aria-hidden />;
}

export function useSitePageMotion() {
  useEffect(() => {
    const root = document.querySelector(".ksr-site");
    if (!root) return;

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("ksr-in");
            reveal.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );

    root.querySelectorAll(".ksr-rev, .ksr-revl, .ksr-revr").forEach((el) => reveal.observe(el));

    const runCounter = (el: Element, target: number, duration = 1800) => {
      const t0 = performance.now();
      const big = target >= 1000;
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const v = Math.round((1 - (1 - p) ** 3) * target);
        el.textContent = big ? v.toLocaleString() : String(v);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const counterObs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-target") ?? "0", 10);
          runCounter(el, target);
          counterObs.unobserve(el);
        }
      },
      { threshold: 0.5 },
    );

    root.querySelectorAll(".ksr-counter").forEach((el) => counterObs.observe(el));

    return () => {
      reveal.disconnect();
      counterObs.disconnect();
    };
  }, []);
}

export function SitePageMotion() {
  useSitePageMotion();
  return <ScrollProgressBar />;
}
