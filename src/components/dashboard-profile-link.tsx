import Link from "next/link";

import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

type DashboardProfileLinkProps = {
  displayName: string;
  email: string;
  imageUrl?: string | null;
  profileLabel: string;
  className?: string;
};

/** Profile chip in the dashboard header — name, email, then avatar on the right. */
export function DashboardProfileLink({
  displayName,
  email,
  imageUrl,
  profileLabel,
  className,
}: DashboardProfileLinkProps) {
  return (
    <Link
      href="/dashboard/profile"
      title={`${displayName} · ${email}`}
      aria-label={profileLabel}
      className={cn(
        "flex min-w-0 max-w-[9rem] shrink items-center gap-2 rounded-lg px-1.5 py-1 transition hover:bg-zinc-100/80 sm:max-w-[11rem] md:max-w-[14rem] lg:max-w-[17rem]",
        className,
      )}
    >
      <span className="min-w-0 flex flex-col items-end justify-center text-right">
        <span className="w-full truncate text-sm font-medium leading-tight text-zinc-900">
          {displayName}
        </span>
        <span className="mt-0.5 hidden w-full truncate text-xs leading-tight text-zinc-500 @min-[28rem]:block">
          {email}
        </span>
      </span>
      <UserAvatar name={displayName} imageUrl={imageUrl} size="sm" />
    </Link>
  );
}
