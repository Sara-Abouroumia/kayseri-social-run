import { cn } from "@/lib/utils";

type HeaderToolbarProps = {
  children: React.ReactNode;
  className?: string;
  /** When false, toolbar does not grow/shrink in flex layouts (dashboard header). */
  grow?: boolean;
};

/** Right-side navbar cluster: consistent alignment and spacing for controls. */
export function HeaderToolbar({ children, className, grow = true }: HeaderToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 sm:gap-2.5",
        grow ? "min-w-0 flex-1" : "shrink-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function HeaderToolbarDivider({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("h-5 w-px shrink-0 bg-zinc-200", className)} />
  );
}

export function HeaderUtilityCluster({ children }: { children: React.ReactNode }) {
  return <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">{children}</div>;
}
