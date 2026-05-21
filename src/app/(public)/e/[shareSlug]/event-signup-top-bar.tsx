import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  capLabel: string;
  waitlistSuffix: string | null;
  showAdminSignupCount: boolean;
  trailing?: ReactNode;
};

/** Admin signup count + optional actions. Participation status lives on the hero badge. */
export function EventSignupTopBar({
  capLabel,
  waitlistSuffix,
  showAdminSignupCount,
  trailing,
}: Props) {
  if (!showAdminSignupCount && !trailing) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3 sm:px-5",
        showAdminSignupCount && trailing ? "justify-between" : trailing ? "justify-end" : "",
      )}
    >
      {showAdminSignupCount ? (
        <p className="text-xs font-normal text-zinc-400">
          <span className="tabular-nums">{capLabel}</span>
          {waitlistSuffix ? <span className="ml-1">{waitlistSuffix}</span> : null}
        </p>
      ) : null}

      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
