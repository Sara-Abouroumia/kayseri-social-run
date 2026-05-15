"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { UserAvatar } from "@/components/user-avatar";
import { authClient } from "@/lib/auth-client";
import type { Messages } from "@/i18n/messages/en";

type Props = {
  displayName: string;
  initialImageUrl: string | null;
  copy: Messages["profileSettings"];
};

export function ProfileAvatarUpload({ displayName, initialImageUrl, copy }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onPick(file: File) {
    setError(null);
    setSuccess(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? copy.photoError);
      }

      const { error: updateErr } = await authClient.updateUser({ image: json.url });
      if (updateErr) {
        throw new Error(updateErr.message ?? copy.photoError);
      }

      setImageUrl(json.url);
      setSuccess(copy.photoUpdated);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.photoError);
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    setError(null);
    setSuccess(null);
    setUploading(true);
    try {
      const { error: updateErr } = await authClient.updateUser({ image: "" });
      if (updateErr) {
        throw new Error(updateErr.message ?? copy.photoError);
      }
      setImageUrl(null);
      setSuccess(copy.photoRemoved);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.photoError);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-medium text-zinc-900">{copy.photo}</h2>
      <p className="mt-2 text-sm text-zinc-600">{copy.photoHint}</p>

      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {success}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-5">
        <UserAvatar name={displayName} imageUrl={imageUrl} size="lg" />

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onPick(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {uploading ? copy.uploadingPhoto : copy.uploadPhoto}
          </button>
          {imageUrl ? (
            <button
              type="button"
              disabled={uploading}
              onClick={() => void removePhoto()}
              className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline disabled:opacity-60"
            >
              {copy.removePhoto}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
