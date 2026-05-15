"use client";

import { useId } from "react";

import { getClubInstagramUrl, getClubWhatsAppUrl } from "@/lib/club-social-links";
import { cn } from "@/lib/utils";

type Props = {
  instagramAria: string;
  whatsappAria: string;
  /** Extra classes on the outer flex wrapper (e.g. home layout). */
  className?: string;
};

/** Fixed square slot so both icons render at the same visual size. */
const iconSlotClass =
  "flex size-5 shrink-0 items-center justify-center overflow-visible sm:size-[1.375rem]";

const iconSvgClass = "size-full";

/** Slightly smaller than Instagram so both read at the same visual weight */
const whatsappSvgClass = "size-[85%] shrink-0";

function InstagramIcon({
  className,
  gradientId,
}: {
  className?: string;
  gradientId: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="2"
          y1="22"
          x2="22"
          y2="2"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#f9ce34" />
          <stop offset="25%" stopColor="#ee2a7b" />
          <stop offset="50%" stopColor="#d62976" />
          <stop offset="75%" stopColor="#962fbf" />
          <stop offset="100%" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        fillRule="evenodd"
        d="M12 2.2c2.96 0 3.31.01 4.47.07 1.17.05 1.8.24 2.22.4.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.35 1.05.4 2.22.06 1.16.07 1.51.07 4.47s-.01 3.31-.07 4.47c-.05 1.17-.24 1.8-.4 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.35-2.22.4-1.16.06-1.51.07-4.47.07s-3.31-.01-4.47-.07c-1.17-.05-1.8-.24-2.22-.4a3.75 3.75 0 0 1-1.38-.9 3.75 3.75 0 0 1-.9-1.38c-.16-.42-.35-1.05-.4-2.22-.06-1.16-.07-1.51-.07-4.47s.01-3.31.07-4.47c.05-1.17.24-1.8.4-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.35 2.22-.4 1.16-.06 1.51-.07 4.47-.07zM12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.14a3.98 3.98 0 1 1 0-7.96 3.98 3.98 0 0 1 0 7.96zm6.41-10.56a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn(whatsappSvgClass, className)}
      viewBox="0 0 16 16"
      fill="#128C7E"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M11.42 9.49c-.19-.09-1.1-.54-1.27-.61s-.29-.09-.42.1-.48.6-.59.73-.21.14-.4 0a5.13 5.13 0 0 1-1.49-.92 5.25 5.25 0 0 1-1-1.29c-.11-.18 0-.28.08-.38s.18-.21.28-.32a1.39 1.39 0 0 0 .18-.31.38.38 0 0 0 0-.33c0-.09-.42-1-.58-1.37s-.3-.32-.41-.32h-.4a.72.72 0 0 0-.5.23 2.1 2.1 0 0 0-.65 1.55A3.59 3.59 0 0 0 5 8.2 8.32 8.32 0 0 0 8.19 11c.44.19.78.3 1.05.39a2.53 2.53 0 0 0 1.17.07 1.93 1.93 0 0 0 1.26-.88 1.67 1.67 0 0 0 .11-.88c-.05-.07-.17-.12-.36-.21z" />
      <path d="M13.29 2.68A7.36 7.36 0 0 0 8 .5a7.44 7.44 0 0 0-6.41 11.15l-1 3.85 3.94-1a7.4 7.4 0 0 0 3.55.9H8a7.44 7.44 0 0 0 5.29-12.72zM8 14.12a6.12 6.12 0 0 1-3.15-.87l-.22-.13-2.34.61.62-2.28-.14-.23a6.18 6.18 0 0 1 9.6-7.65 6.12 6.12 0 0 1 1.81 4.37A6.19 6.19 0 0 1 8 14.12z" />
    </svg>
  );
}

const iconLinkBase =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:size-9";

const instagramLinkClass = `${iconLinkBase} hover:bg-[#E4405F]/10 focus-visible:outline-[#E4405F]/40`;

const whatsappLinkClass = `${iconLinkBase} hover:bg-[#075E54]/10 focus-visible:outline-[#075E54]/40`;

export function ClubSocialLinks({ instagramAria, whatsappAria, className }: Props) {
  const instagramGradientId = useId();
  const instagramHref = getClubInstagramUrl();
  const whatsappHref = getClubWhatsAppUrl();

  return (
    <div className={cn("flex shrink-0 items-center gap-0", className)}>
      <a
        href={instagramHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(instagramLinkClass, "-ml-1")}
        aria-label={instagramAria}
      >
        <span className={iconSlotClass}>
          <InstagramIcon className={iconSvgClass} gradientId={instagramGradientId} />
        </span>
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(whatsappLinkClass, "-ml-1.5")}
        aria-label={whatsappAria}
      >
        <span className={cn(iconSlotClass, "relative")}>
          <WhatsAppIcon />
        </span>
      </a>
    </div>
  );
}
