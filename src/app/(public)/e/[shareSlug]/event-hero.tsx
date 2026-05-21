"use client";

import Image from "next/image";
import { CalendarClock, CheckCircle2, ImagePlus, Loader2, Pencil, Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { updateEventCoverImageAction } from "@/app/dashboard/admin/events/events-actions";
import { cn } from "@/lib/utils";

type Props = {
  eventId: string;
  initialUrl: string | null;
  canEdit: boolean;
  editCoverLabel: string;
  addCoverLabel: string;
  uploadFailed: string;
  brand: string;
  title: string;
  dateLine: string;
  description: string | null;
  /** When false, long description is shown only in the details section below. */
  showDescriptionInHero?: boolean;
  statusLabel: string;
  statusTone: HeroStatusTone;
};

export type HeroStatusTone =
  | "open"
  | "joined"
  | "waitlisted"
  | "pending"
  | "ongoing"
  | "finished";

const toneIcon: Record<HeroStatusTone, typeof CalendarClock> = {
  open: CalendarClock,
  joined: CheckCircle2,
  waitlisted: CalendarClock,
  pending: CalendarClock,
  ongoing: Radio,
  finished: CheckCircle2,
};

function badgeShellClass(tone: HeroStatusTone, onDark: boolean): string {
  if (tone === "joined") {
    return onDark
      ? "border-emerald-300/50 bg-emerald-600/95 text-white"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (tone === "waitlisted") {
    return onDark
      ? "border-amber-300/50 bg-amber-700/90 text-white"
      : "border-amber-200 bg-amber-50 text-amber-900";
  }
  if (tone === "pending") {
    return onDark
      ? "border-amber-300/50 bg-amber-800/90 text-white"
      : "border-amber-200 bg-amber-50 text-amber-950";
  }
  if (tone === "ongoing") {
    return onDark
      ? "border-emerald-300/40 bg-emerald-700/90 text-white"
      : "border-emerald-200 bg-emerald-50 text-emerald-900";
  }
  if (tone === "finished") {
    return onDark
      ? "border-white/20 bg-zinc-900/70 text-white/95"
      : "border-zinc-200 bg-zinc-100 text-zinc-600";
  }
  // open
  return onDark
    ? "border-white/25 bg-[#d91f06]/90 text-white"
    : "border-[#d91f06]/20 bg-[#fff5f4] text-[#b8160a]";
}

function EventHeroStatusBadge({
  tone,
  label,
  onDark,
}: {
  tone: HeroStatusTone;
  label: string;
  onDark: boolean;
}) {
  const Icon = toneIcon[tone];

  return (
    <span
      className={cn(
        "inline-flex max-w-[min(100%,14rem)] items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold leading-none shadow-sm backdrop-blur-md sm:max-w-xs sm:text-[13px]",
        badgeShellClass(tone, onDark),
      )}
      role="status"
      aria-label={label}
    >
      <Icon
        className={cn(
          "size-3.5 shrink-0 sm:size-4",
          tone === "ongoing" && "motion-safe:animate-pulse",
        )}
        aria-hidden
      />
      <span className="truncate">{label}</span>
    </span>
  );
}

function HeroCoverEditButton({
  busy,
  hasCover,
  editCoverLabel,
  addCoverLabel,
  onPickCover,
  onDark,
}: {
  busy: boolean;
  hasCover: boolean;
  editCoverLabel: string;
  addCoverLabel: string;
  onPickCover: () => void;
  onDark: boolean;
}) {
  const tooltip = hasCover ? editCoverLabel : addCoverLabel;

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onPickCover}
      aria-label={tooltip}
      className={cn(
        "group/cover relative shrink-0",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        onDark ? "focus-visible:outline-white" : "focus-visible:outline-zinc-900",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition",
          onDark
            ? "bg-black/55 text-white hover:bg-black/75"
            : "border border-zinc-300/80 bg-white/95 text-zinc-900 hover:bg-white",
        )}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : hasCover ? (
          <Pencil className="size-4" aria-hidden />
        ) : (
          <ImagePlus className="size-4" aria-hidden />
        )}
      </span>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full right-0 z-30 mb-2 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-white shadow-lg",
          "bg-zinc-900 opacity-0 transition-opacity duration-150",
          "group-hover/cover:opacity-100 group-focus-visible/cover:opacity-100",
          busy && "opacity-100",
        )}
      >
        {tooltip}
      </span>
    </button>
  );
}

function HeroText({
  hasImage,
  brand,
  title,
  dateLine,
  description,
}: Pick<Props, "brand" | "title" | "dateLine" | "description"> & {
  hasImage: boolean;
}) {
  return (
    <div className="max-w-prose">
      <p
        className={cn(
          "text-[10px] font-medium uppercase tracking-[0.2em]",
          hasImage ? "text-white/70" : "text-zinc-400",
        )}
      >
        {brand}
      </p>
      <h1
        className={cn(
          "mt-2 font-semibold tracking-tight text-balance",
          hasImage ? "text-2xl sm:text-3xl" : "text-3xl text-zinc-900 sm:text-4xl",
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          "mt-2 text-sm font-medium",
          hasImage ? "text-white/85" : "text-zinc-500",
        )}
      >
        {dateLine}
      </p>
      {description ? (
        <p
          className={cn(
            "mt-4 whitespace-pre-wrap text-sm leading-relaxed",
            hasImage ? "text-white/90" : "text-zinc-600",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function EventHero({
  eventId,
  initialUrl,
  canEdit,
  editCoverLabel,
  addCoverLabel,
  uploadFailed,
  brand,
  title,
  dateLine,
  description,
  showDescriptionInHero = true,
  statusLabel,
  statusTone,
}: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [saving, startSaveTransition] = useTransition();

  const busy = uploading || saving;
  const hasImage = Boolean(url);
  const showHeroShell = hasImage || canEdit;
  const onDark = hasImage;

  const textProps = {
    brand,
    title,
    dateLine,
    description: showDescriptionInHero ? description : null,
  };

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/event-image", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? uploadFailed);
        return;
      }

      const uploadedUrl = data.url;
      startSaveTransition(async () => {
        const result = await updateEventCoverImageAction(eventId, uploadedUrl);
        if (!result.ok) {
          setUploadError(result.message ?? uploadFailed);
          return;
        }
        setUrl(uploadedUrl);
        router.refresh();
      });
    } catch {
      setUploadError(uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  const fileInput = canEdit ? (
    <input
      ref={fileRef}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      className="sr-only"
      onChange={onFileSelected}
    />
  ) : null;

  const heroTopBar = (
    <div className="relative z-20 flex items-start justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
      <div className="min-w-0 flex-1">
        <EventHeroStatusBadge tone={statusTone} label={statusLabel} onDark={onDark} />
      </div>
      {canEdit ? (
        <HeroCoverEditButton
          busy={busy}
          hasCover={hasImage}
          editCoverLabel={editCoverLabel}
          addCoverLabel={addCoverLabel}
          onDark={onDark}
          onPickCover={() => fileRef.current?.click()}
        />
      ) : null}
    </div>
  );

  if (!showHeroShell) {
    return (
      <header className="space-y-5 text-zinc-900">
        <EventHeroStatusBadge tone={statusTone} label={statusLabel} onDark={false} />
        <HeroText hasImage={false} {...textProps} />
      </header>
    );
  }

  return (
    <>
      {fileInput}
      <section
        className={cn(
          "relative w-full overflow-hidden rounded-xl",
          hasImage
            ? "aspect-[2/1] max-h-[min(52vw,240px)] sm:max-h-[280px] lg:max-h-[300px]"
            : "min-h-[180px]",
        )}
      >
        <div className="absolute inset-0 overflow-hidden rounded-xl" aria-hidden>
        {hasImage ? (
          <>
            <div className="absolute inset-0 bg-zinc-900">
              <Image
                src={url!}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 1280px) 100vw, 1280px"
                unoptimized
                priority
              />
            </div>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/65"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/95 via-black/65 to-transparent"
              aria-hidden
            />
          </>
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200"
            aria-hidden
          />
        )}
        </div>

        {heroTopBar}

        <div
          className={cn(
            "relative z-10 flex min-h-[inherit] flex-col px-4 pb-8 sm:px-6 sm:pb-9",
            hasImage
              ? "pointer-events-none justify-end pt-6 text-white sm:pt-8"
              : "justify-end pt-2 text-zinc-900",
          )}
        >
          <div className="pointer-events-auto">
            <HeroText hasImage={hasImage} {...textProps} />
          </div>
        </div>

        {uploadError ? (
          <p
            className={cn(
              "relative z-10 px-4 pb-3 text-sm sm:px-6",
              hasImage ? "text-red-200" : "text-red-800",
            )}
            role="alert"
          >
            {uploadError}
          </p>
        ) : null}
      </section>
    </>
  );
}
