"use client";

import {
  BarChart3,
  CalendarDays,
  Home,
  LayoutDashboard,
  Lightbulb,
  Settings,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Messages } from "@/i18n/messages/en";
import { dashboardHeaderInsetX } from "@/lib/layout";
import { cn } from "@/lib/utils";

type DashboardNavProps = {
  nav: Messages["nav"];
  isPlatformAdmin: boolean;
  isPlatformDeveloper?: boolean;
  unreadIdeaCount?: number;
  className?: string;
  /** Vertical stack for mobile drawer; default is horizontal toolbar. */
  variant?: "toolbar" | "drawer";
};

type NavItemConfig = {
  href: string;
  label: string;
  title?: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
  badgeCount?: number;
  badgeAriaLabel?: string;
};

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

function DashboardNavLink({
  href,
  label,
  title,
  icon: Icon,
  active,
  variant = "toolbar",
  badgeCount = 0,
  badgeAriaLabel,
}: {
  href: string;
  label: string;
  title?: string;
  icon: LucideIcon;
  active: boolean;
  variant?: "toolbar" | "drawer";
  badgeCount?: number;
  badgeAriaLabel?: string;
}) {
  const isDrawer = variant === "drawer";

  return (
    <Link
      href={href}
      title={title}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-lg text-sm font-medium transition",
        isDrawer ? "h-11 w-full px-3" : cn("h-9 gap-1.5", dashboardHeaderInsetX),
        active
          ? "bg-zinc-100/80 text-zinc-900"
          : "text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600",
        )}
        strokeWidth={active ? 2.25 : 2}
        aria-hidden
      />
      <span
        className={cn(
          "relative whitespace-nowrap",
          badgeCount > 0 && "pr-3",
        )}
      >
        {label}
        {badgeCount > 0 ? (
          <span
            className="absolute -right-0.5 -top-2 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white"
            aria-label={badgeAriaLabel}
          >
            {formatBadgeCount(badgeCount)}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function DashboardNav({
  nav,
  isPlatformAdmin,
  isPlatformDeveloper = false,
  unreadIdeaCount = 0,
  className,
  variant = "toolbar",
}: DashboardNavProps) {
  const pathname = usePathname() ?? "";

  const memberItems: NavItemConfig[] = [
    {
      href: "/",
      label: nav.ksrSite,
      icon: Home,
      isActive: (p) => p === "/",
    },
    {
      href: "/dashboard",
      label: nav.dashboard,
      icon: LayoutDashboard,
      isActive: (p) => p === "/dashboard",
    },
  ];

  const adminItems: NavItemConfig[] = [
    {
      href: "/dashboard/admin/events",
      label: nav.events,
      icon: CalendarDays,
      isActive: (p) => p.startsWith("/dashboard/admin/events"),
    },
    {
      href: "/dashboard/admin/ideas",
      label: nav.ideaBox,
      icon: Lightbulb,
      isActive: (p) => p.startsWith("/dashboard/admin/ideas"),
      badgeCount: unreadIdeaCount,
      badgeAriaLabel: nav.unreadIdeasBadge.replace(
        "{count}",
        formatBadgeCount(unreadIdeaCount),
      ),
    },
    {
      href: "/dashboard/admin/system",
      label: nav.systemSettings,
      icon: Settings,
      isActive: (p) => p.startsWith("/dashboard/admin/system"),
    },
    ...(isPlatformDeveloper
      ? [
          {
            href: "/dashboard/admin/developer/analytics",
            label: nav.developerUsage,
            icon: BarChart3,
            isActive: (p: string) =>
              p.startsWith("/dashboard/admin/developer"),
          },
        ]
      : []),
    // Admin site page builder (landing blocks) — temporarily hidden
    // {
    //   href: "/dashboard/admin/about",
    //   label: nav.editSiteNav,
    //   title: nav.editLanding,
    //   icon: Globe,
    //   isActive: (p) => p.startsWith("/dashboard/admin/about"),
    // },
  ];

  const isDrawer = variant === "drawer";

  return (
    <nav
      className={cn(
        isDrawer ? "flex flex-col gap-0.5" : "flex flex-wrap items-center gap-0.5 gap-y-1",
        className,
      )}
      aria-label={nav.memberArea}
    >
      {memberItems.map((item) => (
        <DashboardNavLink
          key={item.href}
          href={item.href}
          label={item.label}
          title={item.title}
          icon={item.icon}
          active={item.isActive(pathname)}
          variant={variant}
          badgeCount={item.badgeCount}
          badgeAriaLabel={item.badgeAriaLabel}
        />
      ))}

      {isPlatformAdmin ? (
        <>
          {isDrawer ? (
            <p className="mt-2 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              {nav.adminSection}
            </p>
          ) : (
            <>
              <span
                className="mx-1 hidden h-6 w-px shrink-0 self-center bg-zinc-200 lg:block"
                aria-hidden
              />
              <span className="sr-only">{nav.adminSection}</span>
            </>
          )}
          {adminItems.map((item) => (
            <DashboardNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              title={item.title}
              icon={item.icon}
              active={item.isActive(pathname)}
              variant={variant}
              badgeCount={item.badgeCount}
              badgeAriaLabel={item.badgeAriaLabel}
            />
          ))}
        </>
      ) : null}
    </nav>
  );
}
