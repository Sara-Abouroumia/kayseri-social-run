import Link from "next/link";

import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

function getNavNameParts(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { first: "", last: null as string | null };
  }
  if (parts.length === 1) {
    return { first: parts[0], last: null };
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return first === last ? { first, last: null } : { first, last };
}

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
  const { first, last } = getNavNameParts(displayName);

  return (
    <Link
      href="/dashboard/profile"
      title={`${displayName} · ${email}`}
      aria-label={profileLabel}
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-zinc-100/80 sm:px-1.5",
        "max-lg:max-w-[10.5rem] sm:max-lg:max-w-[12rem]",
        "lg:max-w-[14rem] lg:shrink xl:max-w-[17rem]",
        className,
      )}
    >
      <span
        className={cn(
          "min-w-0 flex flex-1 flex-col",
          "max-lg:items-end max-lg:pr-1 max-lg:text-right",
          "lg:items-end lg:text-right",
        )}
      >
        <span className="max-w-full truncate text-sm font-medium leading-none text-zinc-900">
          {first}
        </span>
        {last ? (
          <span className="-mt-px max-w-full truncate text-sm font-medium leading-none text-zinc-900">
            {last}
          </span>
        ) : null}
        {/* <span className="mt-0.5 hidden w-full truncate text-xs leading-tight text-zinc-500 max-lg:block lg:block">
          {email}
        </span> */}
      </span>
      <UserAvatar
        name={displayName}
        imageUrl={imageUrl}
        size="sm"
        className="ml-auto shrink-0"
      />
    </Link>
  );
}
