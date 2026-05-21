import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { ksrFontClassName } from "./site-page-fonts";

import "./site-page.css";

type KsrNavLogoProps = {
  ariaLabel: string;
  className?: string;
  priority?: boolean;
};

export function KsrNavLogo({ ariaLabel, className, priority }: KsrNavLogoProps) {
  return (
    <div className={cn(ksrFontClassName, "ksr-nav-logo", className)}>
      <Link href="/" className="ksr-nlogo" aria-label={ariaLabel}>
        <Image
          src="/kayserisocialrun_logo.png"
          alt=""
          width={220}
          height={56}
          className="ksr-nlogo-img"
          priority={priority}
        />
        <span className="ksr-nlogo-text">KSR</span>
      </Link>
    </div>
  );
}
