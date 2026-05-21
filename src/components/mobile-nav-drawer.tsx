"use client";

import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type MobileNavDrawerProps = {
  openLabel: string;
  closeLabel: string;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
  /** Distance from top of viewport to panel (matches header height). */
  panelTopClass?: string;
  /** Red badge on the menu icon (e.g. unread admin notifications). */
  menuBadgeCount?: number;
  menuBadgeAriaLabel?: string;
};

function formatMenuBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function MobileNavDrawer({
  openLabel,
  closeLabel,
  children,
  className,
  panelClassName,
  panelTopClass = "top-14",
  menuBadgeCount = 0,
  menuBadgeAriaLabel,
}: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  }, [close, open]);

  const drawer =
    open && mounted
      ? createPortal(
          <>
            <button
              type="button"
              aria-label={closeLabel}
              className="fixed inset-0 z-[60] bg-zinc-900/25 backdrop-blur-[1px]"
              onClick={close}
            />
            <div
              id={panelId}
              role="dialog"
              aria-modal="true"
              className={cn(
                "fixed inset-x-0 z-[61] max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-zinc-200 bg-white shadow-lg",
                panelTopClass,
                panelClassName,
              )}
            >
              <div
                className="px-4 py-4 sm:px-6"
                onClick={(event) => {
                  const target = event.target as HTMLElement;
                  if (target.closest("a")) close();
                }}
              >
                {children}
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? closeLabel : openLabel}
        className="relative inline-flex size-9 items-center justify-center rounded-lg border border-zinc-200/90 bg-zinc-50 text-zinc-700 shadow-sm transition hover:bg-white hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        {!open && menuBadgeCount > 0 ? (
          <span
            className="absolute -right-1 -top-1 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white"
            aria-label={menuBadgeAriaLabel}
          >
            {formatMenuBadgeCount(menuBadgeCount)}
          </span>
        ) : null}
      </button>

      {drawer}
    </div>
  );
}
