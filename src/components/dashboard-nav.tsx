"use client";

import {
  CalendarDays,
  Globe,
  LayoutDashboard,
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
  className?: string;
};

type NavItemConfig = {
  href: string;
  label: string;
  title?: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

function DashboardNavLink({
  href,
  label,
  title,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  title?: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      title={title}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 shrink-0 items-center gap-1.5 rounded-lg text-sm font-medium transition",
        dashboardHeaderInsetX,
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
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}

export function DashboardNav({ nav, isPlatformAdmin, className }: DashboardNavProps) {
  const pathname = usePathname() ?? "";

  const memberItems: NavItemConfig[] = [
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
      href: "/dashboard/admin/system",
      label: nav.systemSettings,
      icon: Settings,
      isActive: (p) => p.startsWith("/dashboard/admin/system"),
    },
    {
      href: "/dashboard/admin/about",
      label: nav.editSiteNav,
      title: nav.editLanding,
      icon: Globe,
      isActive: (p) => p.startsWith("/dashboard/admin/about"),
    },
  ];

  return (
    <nav
      className={cn("flex flex-wrap items-center gap-0.5 gap-y-1", className)}
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
        />
      ))}

      {isPlatformAdmin ? (
        <>
          <span
            className="mx-1 hidden h-6 w-px shrink-0 self-center bg-zinc-200 sm:block"
            aria-hidden
          />
          <span className="sr-only">{nav.adminSection}</span>
          {adminItems.map((item) => (
            <DashboardNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              title={item.title}
              icon={item.icon}
              active={item.isActive(pathname)}
            />
          ))}
        </>
      ) : null}
    </nav>
  );
}
