"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

type ShareUrlButtonProps = {
  url: string;
  /** Visually hidden label for assistive tech */
  label: string;
  shareLabel: string;
  copiedLabel: string;
};

export function ShareUrlButton({ url, label, shareLabel, copiedLabel }: ShareUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      title={copied ? copiedLabel : label}
      aria-label={label}
      onClick={() => void onCopy()}
      className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
    >
      <Share2 className="h-4 w-4 shrink-0" aria-hidden />
      <span className="hidden sm:inline">{copied ? copiedLabel : shareLabel}</span>
    </button>
  );
}
