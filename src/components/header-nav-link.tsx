import Link from "next/link";

import { cn } from "@/lib/utils";

type HeaderNavLinkProps = {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
};

export function HeaderNavLink({ href, children, active, className }: HeaderNavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center px-3 py-2 text-sm font-medium transition",
        active
          ? "text-zinc-900"
          : "text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900",
        className,
      )}
    >
      {children}
      <span
        className={cn(
          "absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-zinc-900 transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />
    </Link>
  );
}
