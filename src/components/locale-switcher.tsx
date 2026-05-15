"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

import type { Locale } from "@/i18n/config";
import { setLocaleAction } from "@/i18n/set-locale";
import { cn } from "@/lib/utils";

type Props = {
  locale: Locale;
  labels: { english: string; turkish: string };
};

const options: { value: Locale; flag: string }[] = [
  { value: "en", flag: "/flags/uk.svg" },
  { value: "tr", flag: "/flags/tr.svg" },
];

export function LocaleSwitcher({ locale, labels }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useOptimistic(locale);

  function pick(next: Locale) {
    if (next === active) return;
    startTransition(async () => {
      setActive(next);
      await setLocaleAction(next);
      router.refresh();
    });
  }

  const labelByLocale: Record<Locale, string> = {
    en: labels.english,
    tr: labels.turkish,
  };

  return (
    <div
      role="group"
      aria-label="Language"
      aria-busy={pending}
      className="relative inline-grid h-8 w-[4.25rem] shrink-0 grid-cols-2 rounded-lg border border-zinc-200/90 bg-zinc-100/80 p-0.5 shadow-sm"
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-[5px] bg-white shadow-sm ring-1 ring-zinc-900/8 transition-transform duration-200 ease-out",
          active === "tr" && "translate-x-full",
          pending && "opacity-75",
        )}
      />
      {options.map(({ value, flag }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => pick(value)}
            title={labelByLocale[value]}
            aria-label={labelByLocale[value]}
            aria-pressed={isActive}
            className={cn(
              "relative z-10 flex cursor-pointer items-center justify-center rounded-[5px] p-1 outline-none transition-all duration-150",
              "focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:ring-offset-0",
              isActive ? "opacity-100" : "opacity-50 saturate-[0.7] hover:opacity-85 hover:saturate-90",
            )}
          >
            <span className="relative h-3.5 w-[1.3125rem] overflow-hidden rounded-[2px] ring-1 ring-black/10">
              <Image src={flag} alt="" fill sizes="21px" className="object-cover" aria-hidden />
            </span>
          </button>
        );
      })}
    </div>
  );
}
