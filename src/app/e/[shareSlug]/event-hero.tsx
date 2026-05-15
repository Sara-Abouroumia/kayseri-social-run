"use client";

import Image from "next/image";
import { Loader2, Pencil } from "lucide-react";
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
};

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
    <>
      <p
        className={cn(
          "text-xs font-medium uppercase tracking-wide",
          hasImage ? "text-white/80" : "text-zinc-500",
        )}
      >
        {brand}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className={cn("mt-1 text-sm", hasImage ? "text-white/90" : "text-zinc-600")}>
        {dateLine}
      </p>
      {description ? (
        <p
          className={cn(
            "mt-4 max-w-prose whitespace-pre-wrap text-sm leading-relaxed",
            hasImage ? "text-white/95" : "text-zinc-700",
          )}
        >
          {description}
        </p>
      ) : null}
    </>
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

  const textProps = { brand, title, dateLine, description };

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

  if (!showHeroShell) {
    return (
      <header className="text-zinc-900">
        <HeroText hasImage={false} {...textProps} />
      </header>
    );
  }

  return (
    <section
      className={cn(
        "relative -mx-1 overflow-hidden rounded-xl sm:-mx-2",
        hasImage ? "min-h-[300px]" : "min-h-[200px]",
      )}
    >
      {hasImage ? (
        <>
          <div className="absolute inset-0 overflow-hidden bg-zinc-950">
            <Image
              src={url!}
              alt=""
              fill
              className="scale-105 object-cover object-center opacity-50 blur-2xl"
              sizes="(max-width: 768px) 100vw, 672px"
              unoptimized
              aria-hidden
            />
            <Image
              src={url!}
              alt=""
              fill
              className="object-contain object-center"
              sizes="(max-width: 768px) 100vw, 672px"
              unoptimized
              priority
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-[12%] bg-black/25 backdrop-blur-3xl"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 24%, black 70%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 24%, black 70%)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t from-black/95 via-black/70 to-transparent"
            aria-hidden
          />
        </>
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200"
          aria-hidden
        />
      )}

      {canEdit ? (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={onFileSelected}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            aria-label={url ? editCoverLabel : addCoverLabel}
            className={cn(
              "absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-full",
              "bg-black/55 text-white shadow-sm backdrop-blur-sm",
              "transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2",
              "focus-visible:outline-offset-2 focus-visible:outline-white",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Pencil className="size-4" aria-hidden />
            )}
          </button>
        </>
      ) : null}

      <div
        className={cn(
          "relative z-10 flex min-h-[inherit] flex-col justify-end px-4 py-8 sm:px-6",
          hasImage ? "text-white" : "text-zinc-900",
        )}
      >
        <HeroText hasImage={hasImage} {...textProps} />
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
  );
}
