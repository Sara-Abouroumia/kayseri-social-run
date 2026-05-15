"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  confirmLabel: string;
};

export function SignOutButton({ label, confirmLabel }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "confirm" | "loading">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  function scheduleReset() {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setPhase("idle"), 4000);
  }

  async function signOut() {
    setPhase("loading");
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setPhase("idle");
    }
  }

  function handleClick() {
    if (phase === "loading") return;

    if (phase === "confirm") {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      void signOut();
      return;
    }

    setPhase("confirm");
    scheduleReset();
  }

  const isConfirm = phase === "confirm";
  const isLoading = phase === "loading";
  const tooltip = isConfirm ? confirmLabel : label;

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={isLoading}
      title={tooltip}
      aria-label={tooltip}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border p-0 text-[10px] font-semibold tracking-wide outline-none transition disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:ring-1 focus-visible:ring-offset-0",
        isConfirm
          ? "min-w-[4.5rem] px-2 text-rose-700 border-rose-200/90 bg-rose-50/95 shadow-sm focus-visible:ring-rose-400 hover:border-rose-300 hover:bg-rose-100"
          : "w-8 border-zinc-200/90 bg-zinc-100/90 text-zinc-600 shadow-sm focus-visible:ring-zinc-400 hover:border-zinc-300 hover:bg-white hover:text-zinc-900",
      )}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" aria-hidden />
      ) : isConfirm ? (
        <span className="px-0.5">{confirmLabel}</span>
      ) : (
        <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden />
      )}
    </button>
  );
}
