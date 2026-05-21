"use client";

import { useMemo, useState } from "react";

import { ActivityTypeFields } from "@/app/dashboard/admin/events/activity-type-fields";
import type { EventFormInitial } from "@/app/dashboard/admin/events/event-form-initial";
import type { Messages } from "@/i18n/messages/en";
import { getActivityDetailHints } from "@/lib/event-activity-type";

type Copy = Messages["adminEventForm"];

type Props = Pick<
  EventFormInitial,
  | "activityType"
  | "activityTypeEmoji"
  | "distanceKm"
  | "paceLabel"
  | "difficulty"
  | "costKind"
  | "costNotes"
> & { copy: Copy };

function labelClass() {
  return "block text-sm font-medium text-zinc-800";
}

function inputClass() {
  return "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";
}

export function EventTypeMetricsSection({ copy, ...initial }: Props) {
  const [activityLabel, setActivityLabel] = useState(initial.activityType);
  const [costKind, setCostKind] = useState<"free" | "paid">(initial.costKind);

  const hints = useMemo(() => getActivityDetailHints(activityLabel), [activityLabel]);
  const showAnyMetric = hints.showDistance || hints.showPace || hints.showDifficulty;

  return (
    <div className="space-y-6">
      <div>
        <label className={labelClass()} id="activity-type-heading">
          {copy.eventType}
        </label>
        <div className="mt-2" aria-labelledby="activity-type-heading">
          <ActivityTypeFields
            initialLabel={initial.activityType}
            initialEmoji={initial.activityTypeEmoji}
            copy={copy}
            onLabelChange={setActivityLabel}
          />
        </div>
      </div>

      {showAnyMetric ? (
        <div
          className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4"
          aria-labelledby="type-metrics-heading"
        >
          <h3 id="type-metrics-heading" className="text-sm font-medium text-zinc-900">
            {copy.typeMetricsHeading}
          </h3>
          <p className="mt-1 text-xs text-zinc-600">{copy.typeMetricsBlurb}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {hints.showDistance ? (
              <div>
                <label className={labelClass()} htmlFor="distanceKm">
                  {copy.distanceKm}
                </label>
                <input
                  id="distanceKm"
                  name="distanceKm"
                  inputMode="decimal"
                  defaultValue={initial.distanceKm}
                  placeholder={copy.distancePlaceholder}
                  className={`${inputClass()} mt-1`}
                />
              </div>
            ) : (
              <input type="hidden" name="distanceKm" value="" />
            )}
            {hints.showPace ? (
              <div>
                <label className={labelClass()} htmlFor="paceLabel">
                  {copy.pace}
                </label>
                <input
                  id="paceLabel"
                  name="paceLabel"
                  maxLength={120}
                  defaultValue={initial.paceLabel}
                  placeholder={copy.pacePlaceholder}
                  className={`${inputClass()} mt-1`}
                />
              </div>
            ) : (
              <input type="hidden" name="paceLabel" value="" />
            )}
            {hints.showDifficulty ? (
              <div>
                <label className={labelClass()} htmlFor="difficulty">
                  {copy.difficulty}
                </label>
                <input
                  id="difficulty"
                  name="difficulty"
                  maxLength={120}
                  defaultValue={initial.difficulty}
                  placeholder={copy.difficultyPlaceholder}
                  className={`${inputClass()} mt-1`}
                />
              </div>
            ) : (
              <input type="hidden" name="difficulty" value="" />
            )}
          </div>
        </div>
      ) : (
        <>
          <input type="hidden" name="distanceKm" value="" />
          <input type="hidden" name="paceLabel" value="" />
          <input type="hidden" name="difficulty" value="" />
        </>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-medium text-zinc-900">{copy.cost}</h3>
        <fieldset className="mt-3 space-y-3">
          <legend className="sr-only">{copy.costLegend}</legend>
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800">
              <input
                type="radio"
                name="costKind"
                value="free"
                className="text-zinc-900"
                checked={costKind === "free"}
                onChange={() => setCostKind("free")}
              />
              {copy.costFree}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800">
              <input
                type="radio"
                name="costKind"
                value="paid"
                className="text-zinc-900"
                checked={costKind === "paid"}
                onChange={() => setCostKind("paid")}
              />
              {copy.costPaid}
            </label>
          </div>
          {costKind === "paid" ? (
            <div>
              <label className={labelClass()} htmlFor="costNotes">
                {copy.costDetails}
              </label>
              <textarea
                id="costNotes"
                name="costNotes"
                rows={2}
                maxLength={500}
                defaultValue={initial.costNotes}
                placeholder={copy.costDetailsPlaceholder}
                className={`${inputClass()} mt-1`}
              />
            </div>
          ) : (
            <input type="hidden" name="costNotes" value="" />
          )}
        </fieldset>
      </div>
    </div>
  );
}
