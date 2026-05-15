import { User } from "lucide-react";

import { cn } from "@/lib/utils";

type UserAvatarSize = "sm" | "md" | "lg";

const sizeStyles: Record<UserAvatarSize, { box: string; icon: string }> = {
  sm: { box: "h-8 w-8", icon: "h-4 w-4" },
  md: { box: "h-10 w-10", icon: "h-5 w-5" },
  lg: { box: "h-20 w-20", icon: "h-9 w-9" },
};

function isDisplayableImageUrl(url: string | null | undefined): url is string {
  if (!url?.trim()) return false;
  return /^https?:\/\//i.test(url) || /^data:image\//i.test(url);
}

type UserAvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: UserAvatarSize;
  className?: string;
};

export function UserAvatar({ name, imageUrl, size = "md", className }: UserAvatarProps) {
  const { box, icon } = sizeStyles[size];
  const initials = name.trim().charAt(0).toUpperCase() || "?";

  if (isDisplayableImageUrl(imageUrl)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data URLs and blob hosts
      <img
        src={imageUrl}
        alt=""
        className={cn(box, "shrink-0 rounded-full object-cover ring-1 ring-zinc-200/80", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        box,
        "flex shrink-0 items-center justify-center rounded-full bg-zinc-200 font-semibold text-zinc-600 ring-1 ring-zinc-200/80",
        size === "lg" ? "text-xl" : "text-xs",
        className,
      )}
      aria-hidden
    >
      {size === "lg" ? (
        <span>{initials}</span>
      ) : (
        <User className={icon} strokeWidth={2} />
      )}
    </span>
  );
}
