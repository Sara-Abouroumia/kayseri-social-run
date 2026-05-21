import Link from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label: string;
  className?: string;
};

export function BackToEventsLink({ href, label, className }: Props) {
  return (
    <p className={cn("mb-5 sm:mb-6", className)}>
      <Link
        href={href}
        className="text-sm font-medium text-zinc-600 underline-offset-2 transition hover:text-zinc-900 hover:underline"
      >
        {label}
      </Link>
    </p>
  );
}
