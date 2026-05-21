"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  createEventAction,
  updateEventAction,
} from "@/app/dashboard/admin/events/events-actions";
import {
  emptyEventFormInitial,
  type EventFormInitial,
} from "@/app/dashboard/admin/events/event-form-initial";

import type { Messages } from "@/i18n/messages/en";
import {
  BLOB_IMAGE_MAX_BYTES,
  INLINE_IMAGE_MAX_BYTES,
  type UploadImageErrorCode,
} from "@/lib/upload-image";

import { EventTypeMetricsSection } from "./event-type-metrics-section";
import { RegistrationFormBuilder } from "./registration-form-builder";

type FormCopy = Messages["adminEventForm"];

function inputClass() {
  return "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";
}

function labelClass() {
  return "block text-sm font-medium text-zinc-800";
}

const COVER_MAX_MB = String(Math.round(BLOB_IMAGE_MAX_BYTES / (1024 * 1024)));
const COVER_MAX_KB = String(Math.round(INLINE_IMAGE_MAX_BYTES / 1024));

function fillCoverLimits(text: string) {
  return text.replaceAll("{maxMb}", COVER_MAX_MB).replaceAll("{maxKb}", COVER_MAX_KB);
}

function localizedUploadError(
  copy: FormCopy,
  payload: { error?: string; code?: UploadImageErrorCode },
): string {
  switch (payload.code) {
    case "too_large_blob":
      return fillCoverLimits(copy.uploadTooLarge);
    case "too_large_inline":
      return fillCoverLimits(copy.uploadTooLargeInline);
    case "bad_mime":
      return copy.uploadBadMime;
    default:
      return payload.error ?? copy.uploadFailed;
  }
}

type EventFormProps = {
  mode: "create" | "edit";
  initial?: EventFormInitial;
  siteOrigin: string;
  readOnly?: boolean;
  showDeveloperHints?: boolean;
  showShareLink?: boolean;
  onUpdateSuccess?: () => void;
  copy: FormCopy;
};

export function EventForm({
  mode,
  initial,
  siteOrigin,
  readOnly = false,
  showDeveloperHints = false,
  showShareLink = true,
  onUpdateSuccess,
  copy,
}: EventFormProps) {
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
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        code?: UploadImageErrorCode;
      };
      if (!res.ok) {
        setUploadError(localizedUploadError(copy, data));
        return;
      }
      if (data.url) setCoverUrl(data.url);
    } catch {
      setUploadError(copy.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  const action = mode === "create" ? createAction : updateAction;
  const pending = mode === "create" ? createPending : updatePending;
  const state = mode === "create" ? createState : updateState;

  useEffect(() => {
    if (mode === "edit" && state?.ok && onUpdateSuccess) {
      onUpdateSuccess();
    }
  }, [mode, state?.ok, onUpdateSuccess]);

  const sharePath =
    base.shareSlug != null && base.shareSlug !== ""
      ? `${siteOrigin}/e/${base.shareSlug}`
      : null;

  return (
    <form action={action} className="space-y-8">
      {mode === "edit" && base.id ? (
        <input type="hidden" name="eventId" value={base.id} />
      ) : null}

      {showShareLink && sharePath ? (
        <section
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
          aria-labelledby="share-heading"
        >
          <h2 id="share-heading" className="text-sm font-medium text-zinc-900">
            {copy.shareLink}
          </h2>
          <p className="mt-1 text-xs text-zinc-600">{copy.shareLinkHint}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="block min-w-0 flex-1 break-all rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-800">
              {sharePath}
            </code>
            <button
              type="button"
              className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50"
              onClick={() => void navigator.clipboard.writeText(sharePath)}
            >
              {copy.copy}
            </button>
          </div>
        </section>
      ) : null}

      <fieldset disabled={readOnly} className="min-w-0 space-y-8 border-0 p-0 disabled:opacity-100">
      <section className="space-y-4" aria-labelledby="basics-heading">
        <h2 id="basics-heading" className="text-lg font-medium text-zinc-900">
          {copy.basics}
        </h2>
        <div>
          <label className={labelClass()} htmlFor="title">
            {copy.title}
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
        <EventTypeMetricsSection
          copy={copy}
          activityType={base.activityType}
          activityTypeEmoji={base.activityTypeEmoji}
          distanceKm={base.distanceKm}
          paceLabel={base.paceLabel}
          difficulty={base.difficulty}
          costKind={base.costKind}
          costNotes={base.costNotes}
        />
        <div>
          <label className={labelClass()} htmlFor="description">
            {copy.notesDescription}
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
              {copy.starts}
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
              {copy.endsOptional}
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
            {copy.visibility}
          </label>
          <select
            id="visibility"
            name="visibility"
            defaultValue={base.visibility}
            className={`${inputClass()} mt-1`}
          >
            <option value="public">{copy.visibilityPublic}</option>
            <option value="members_only">{copy.visibilityMembers}</option>
            <option value="private">{copy.visibilityPrivate}</option>
          </select>
          <p className="mt-1 text-xs text-zinc-500">{copy.visibilityHint}</p>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="location-heading">
        <h2 id="location-heading" className="text-lg font-medium text-zinc-900">
          {copy.meetingPoint}
        </h2>
        <div>
          <label className={labelClass()} htmlFor="meetingPointName">
            {copy.placeName}
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
            {copy.address}
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
              {copy.latitudeOptional}
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
              {copy.longitudeOptional}
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
          {copy.activityDetails}
        </h2>
        <div>
          <label className={labelClass()} htmlFor="requiredItems">
            {copy.requiredItems}
          </label>
          <textarea
            id="requiredItems"
            name="requiredItems"
            rows={2}
            maxLength={2000}
            defaultValue={base.requiredItems}
            placeholder={copy.requiredItemsPlaceholder}
            className={`${inputClass()} mt-1`}
          />
        </div>
        <div>
          <label className={labelClass()} htmlFor="coordinatorName">
            {copy.coordinator}
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
              {copy.maxParticipants}
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
              {copy.joinDeadline}
            </label>
            <input
              id="joinDeadlineAt"
              name="joinDeadlineAt"
              type="datetime-local"
              defaultValue={base.joinDeadlineAt}
              className={`${inputClass()} mt-1`}
            />
            <p className="mt-1 text-xs text-zinc-500">{copy.joinDeadlineHint}</p>
          </div>
        </div>
        <div>
          <label className={labelClass()} htmlFor="weatherInfo">
            {copy.weatherConditions}
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

      <RegistrationFormBuilder
        copy={copy}
        initialQuestions={base.registrationQuestions}
        initialApprovalMode={base.joinApprovalMode}
        initialApprovalConfig={base.joinApprovalConfig}
      />

      <section className="space-y-4" aria-labelledby="cover-heading">
        <h2 id="cover-heading" className="text-lg font-medium text-zinc-900">
          {copy.coverImage}
        </h2>
        <p className="text-sm text-zinc-600">{fillCoverLimits(copy.coverImageHint)}</p>
        {showDeveloperHints ? (
          <p className="text-xs text-zinc-500">
            {fillCoverLimits(copy.coverImageHintDev).split("{token}")[0]}
            <code className="rounded bg-zinc-100 px-1">BLOB_READ_WRITE_TOKEN</code>
            {fillCoverLimits(copy.coverImageHintDev).split("{token}")[1] ?? ""}
          </p>
        ) : null}
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
            {uploading ? copy.uploading : copy.uploadImage}
          </button>
          {coverUrl ? (
            <button
              type="button"
              className="text-sm text-red-800 underline"
              onClick={() => setCoverUrl("")}
            >
              {copy.removeImage}
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
            {copy.imageUrlOptional}
          </label>
          <input
            id="coverUrlManual"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder={copy.imageUrlPlaceholder}
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
      </fieldset>

      {!readOnly ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {pending
              ? copy.saving
              : mode === "create"
                ? copy.createEvent
                : copy.saveChanges}
          </button>
        </div>
      ) : null}

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
