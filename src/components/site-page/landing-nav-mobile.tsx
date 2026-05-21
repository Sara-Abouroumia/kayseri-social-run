"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { LocaleSwitcher } from "@/components/locale-switcher";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

type SectionLink = { href: string; label: string };

type Props = {
  className?: string;
  loggedIn: boolean;
  instagramUrl: string;
  instagramLabel: string;
  sectionLinks: readonly SectionLink[];
  locale: Locale;
  localeLabels: { english: string; turkish: string };
  menuLabels: { open: string; close: string };
  cta: React.ReactNode;
  children: React.ReactNode;
};

export function LandingNavMobile({
  className,
  loggedIn,
  instagramUrl,
  instagramLabel,
  sectionLinks,
  locale,
  localeLabels,
  menuLabels,
  cta,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <nav
      className={cn("ksr-nav", open && "ksr-nav-open", className)}
      aria-label="Main"
    >
      {children}

      <div className="ksr-nav-utilities">
        <LocaleSwitcher locale={locale} labels={localeLabels} className="ksr-nlocale" />
        <button
          type="button"
          className="ksr-nmenu-btn"
          aria-expanded={open}
          aria-label={open ? menuLabels.close : menuLabels.open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden /> : <Menu aria-hidden />}
        </button>
      </div>

      <div className="ksr-nmobile-panel" role="dialog" aria-modal={open}>
        {sectionLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="ksr-nlink"
            onClick={close}
          >
            {item.label}
          </Link>
        ))}
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ksr-nlink"
          onClick={close}
        >
          {instagramLabel}
        </a>
        <div className="ksr-nmobile-actions">
          <div onClick={close}>{cta}</div>
        </div>
      </div>
    </nav>
  );
}
