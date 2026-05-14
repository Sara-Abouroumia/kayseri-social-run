"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";

import {
  createEventAction,
  updateEventAction,
} from "@/app/dashboard/admin/events/events-actions";
import {
  emptyEventFormInitial,
  type EventFormInitial,
} from "@/app/dashboard/admin/events/event-form-initial";

function inputClass() {
  return "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";
}

function labelClass() {
  return "block text-sm font-medium text-zinc-800";
}

type EventFormProps = {
  mode: "create" | "edit";
  initial?: EventFormInitial;
  siteOrigin: string;
};

export function EventForm({ mode, initial, siteOrigin }: EventFormProps) {
  const base = initial ?? emptyEventFormInitial;
  const [coverUrl, setCoverUrl] = useState(base.coverImageUrl);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [createState, createAction, createPending] = useActionState(
    createEventAction,
    {} as { message?: string; ok?: boolean },
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateEventAction,
    {} as { message?: string; ok?: boolean },
  );

  async function onUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
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
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
        return;
      }
      if (data.url) setCoverUrl(data.url);
    } catch {
      setUploadError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const action = mode === "create" ? createAction : updateAction;
  const pending = mode === "create" ? createPending : updatePending;
  const state = mode === "create" ? createState : updateState;

  const sharePath =
    base.shareSlug != null && base.shareSlug !== ""
      ? `${siteOrigin}/e/${base.shareSlug}`
      : null;

  return (
    <form action={action} className="space-y-8">
      {mode === "edit" && base.id ? (
        <input type="hidden" name="eventId" value={base.id} />
      ) : null}

      {sharePath ? (
        <section
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
          aria-labelledby="share-heading"
        >
          <h2 id="share-heading" className="text-sm font-medium text-zinc-900">
            Share link
          </h2>
          <p className="mt-1 text-xs text-zinc-600">
            Anyone with this link can open the activity page. Joining still
            requires an account on this site.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="block min-w-0 flex-1 break-all rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-800">
              {sharePath}
            </code>
            <button
              type="button"
              className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50"
              onClick={() => void navigator.clipboard.writeText(sharePath)}
            >
              Copy
            </button>
          </div>
        </section>
      ) : null}

      <section className="space-y-4" aria-labelledby="basics-heading">
        <h2 id="basics-heading" className="text-lg font-medium text-zinc-900">
          Basics
        </h2>
        <div>
          <label className={labelClass()} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={200}
            defaultValue={base.title}
            className={`${inputClass()} mt-1`}
          />
        </div>
        <div>
          <label className={labelClass()} htmlFor="activityType">
            Activity type
          </label>
          <input
            id="activityType"
            name="activityType"
            maxLength={80}
            defaultValue={base.activityType}
            placeholder="run, walk, hike, social…"
            className={`${inputClass()} mt-1`}
          />
        </div>
        <div>
          <label className={labelClass()} htmlFor="description">
            Notes / description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={8000}
            defaultValue={base.description}
            className={`${inputClass()} mt-1`}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass()} htmlFor="startsAt">
              Starts
            </label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              required
              defaultValue={base.startsAt}
              className={`${inputClass()} mt-1`}
            />
          </div>
          <div>
            <label className={labelClass()} htmlFor="endsAt">
              Ends (optional)
            </label>
            <input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              defaultValue={base.endsAt}
              className={`${inputClass()} mt-1`}
            />
          </div>
        </div>
        <div>
          <label className={labelClass()} htmlFor="visibility">
            Visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            defaultValue={base.visibility}
            className={`${inputClass()} mt-1`}
          >
            <option value="public">Public — share link shows full details</option>
            <option value="members_only">
              Members only — teaser until signed in
            </option>
            <option value="private">Private — minimal teaser</option>
          </select>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="location-heading">
        <h2 id="location-heading" className="text-lg font-medium text-zinc-900">
          Meeting point
        </h2>
        <div>
          <label className={labelClass()} htmlFor="meetingPointName">
            Place name
          </label>
          <input
            id="meetingPointName"
            name="meetingPointName"
            maxLength={500}
            defaultValue={base.meetingPointName}
            className={`${inputClass()} mt-1`}
          />
        </div>
        <div>
          <label className={labelClass()} htmlFor="meetingPointAddress">
            Address
          </label>
          <input
            id="meetingPointAddress"
            name="meetingPointAddress"
            maxLength={1000}
            defaultValue={base.meetingPointAddress}
            className={`${inputClass()} mt-1`}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass()} htmlFor="latitude">
              Latitude (optional)
            </label>
            <input
              id="latitude"
              name="latitude"
              inputMode="decimal"
              defaultValue={base.latitude}
              className={`${inputClass()} mt-1`}
            />
          </div>
          <div>
            <label className={labelClass()} htmlFor="longitude">
              Longitude (optional)
            </label>
            <input
              id="longitude"
              name="longitude"
              inputMode="decimal"
              defaultValue={base.longitude}
              className={`${inputClass()} mt-1`}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="run-heading">
        <h2 id="run-heading" className="text-lg font-medium text-zinc-900">
          Activity details
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass()} htmlFor="distanceKm">
              Distance (km)
            </label>
            <input
              id="distanceKm"
              name="distanceKm"
              inputMode="decimal"
              defaultValue={base.distanceKm}
              className={`${inputClass()} mt-1`}
            />
          </div>
          <div>
            <label className={labelClass()} htmlFor="paceLabel">
              Pace
            </label>
            <input
              id="paceLabel"
              name="paceLabel"
              maxLength={120}
              defaultValue={base.paceLabel}
              placeholder="e.g. ~7:30/km"
              className={`${inputClass()} mt-1`}
            />
          </div>
          <div>
            <label className={labelClass()} htmlFor="difficulty">
              Difficulty
            </label>
            <input
              id="difficulty"
              name="difficulty"
              maxLength={120}
              defaultValue={base.difficulty}
              placeholder="e.g. beginner-friendly"
              className={`${inputClass()} mt-1`}
            />
          </div>
        </div>
        <div>
          <label className={labelClass()} htmlFor="requiredItems">
            Required items
          </label>
          <textarea
            id="requiredItems"
            name="requiredItems"
            rows={2}
            maxLength={2000}
            defaultValue={base.requiredItems}
            placeholder="Water, visibility gear…"
            className={`${inputClass()} mt-1`}
          />
        </div>
        <div>
          <label className={labelClass()} htmlFor="coordinatorName">
            Coordinator
          </label>
          <input
            id="coordinatorName"
            name="coordinatorName"
            maxLength={200}
            defaultValue={base.coordinatorName}
            className={`${inputClass()} mt-1`}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass()} htmlFor="maxParticipants">
              Max participants
            </label>
            <input
              id="maxParticipants"
              name="maxParticipants"
              inputMode="numeric"
              defaultValue={base.maxParticipants}
              className={`${inputClass()} mt-1`}
            />
          </div>
          <div>
            <label className={labelClass()} htmlFor="joinDeadlineAt">
              Join deadline
            </label>
            <input
              id="joinDeadlineAt"
              name="joinDeadlineAt"
              type="datetime-local"
              defaultValue={base.joinDeadlineAt}
              className={`${inputClass()} mt-1`}
            />
          </div>
        </div>
        <div>
          <label className={labelClass()} htmlFor="weatherInfo">
            Weather / conditions
          </label>
          <textarea
            id="weatherInfo"
            name="weatherInfo"
            rows={2}
            maxLength={2000}
            defaultValue={base.weatherInfo}
            className={`${inputClass()} mt-1`}
          />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="cover-heading">
        <h2 id="cover-heading" className="text-lg font-medium text-zinc-900">
          Cover image
        </h2>
        <p className="text-sm text-zinc-600">
          With{" "}
          <code className="rounded bg-zinc-100 px-1">BLOB_READ_WRITE_TOKEN</code>{" "}
          set, uploads go to Vercel Blob (up to 4 MB). Without it, smaller images
          (about 750 KB or less) are embedded in the database; you can also paste
          an https image URL.
        </p>
        <input type="hidden" name="coverImageUrl" value={coverUrl} />
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={onUploadFile}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload image"}
          </button>
          {coverUrl ? (
            <button
              type="button"
              className="text-sm text-red-800 underline"
              onClick={() => setCoverUrl("")}
            >
              Remove image
            </button>
          ) : null}
        </div>
        {uploadError ? (
          <p className="text-sm text-red-800" role="alert">
            {uploadError}
          </p>
        ) : null}
        <div>
          <label className={labelClass()} htmlFor="coverUrlManual">
            Or image URL (https)
          </label>
          <input
            id="coverUrlManual"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://…"
            className={`${inputClass()} mt-1`}
          />
        </div>
        {coverUrl ? (
          <div className="relative mt-2 max-h-64 max-w-xl overflow-hidden rounded-md border border-zinc-200">
            <Image
              src={coverUrl}
              alt=""
              width={800}
              height={400}
              unoptimized
              className="h-auto max-h-64 w-full object-cover"
            />
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? "Saving…" : mode === "create" ? "Create event" : "Save changes"}
        </button>
      </div>

      {state?.message ? (
        <p
          className={`text-sm ${state.ok ? "text-green-800" : "text-red-800"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
