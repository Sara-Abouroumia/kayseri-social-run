"use client";

import Link from "next/link";
import { useState, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { EventSignupTopBar } from "./event-signup-top-bar";

type TopBarProps = ComponentProps<typeof EventSignupTopBar>;

type Props = {
  viewStatisticsLabel: string;
  viewEventDetailsLabel: string;
  editActivityHref: string;
  editActivityLabel: string;
  statsPanel: ReactNode;
  topBar: Omit<TopBarProps, "trailing">;
  children: ReactNode;
};

const adminBtnClass =
  "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition";

export function EventAdminViewShell({
  viewStatisticsLabel,
  viewEventDetailsLabel,
  editActivityHref,
  editActivityLabel,
  statsPanel,
  topBar,
  children,
}: Props) {
  const [statsView, setStatsView] = useState(false);

  const trailing = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link
        href={editActivityHref}
        className={cn(adminBtnClass, "bg-zinc-900 text-white hover:bg-zinc-800")}
      >
        {editActivityLabel}
      </Link>
      <button
        type="button"
        onClick={() => setStatsView((v) => !v)}
        className={cn(
          adminBtnClass,
          "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50",
        )}
        aria-pressed={statsView}
      >
        {statsView ? viewEventDetailsLabel : viewStatisticsLabel}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <EventSignupTopBar {...topBar} trailing={trailing} />
      {statsView ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          {statsPanel}
        </div>
      ) : (
        <div className="space-y-8">{children}</div>
      )}
    </div>
  );
}
