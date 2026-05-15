"use client";

import { useMemo, useState } from "react";

import { ActivityTypeFields } from "@/app/dashboard/admin/events/activity-type-fields";
import type { EventFormInitial } from "@/app/dashboard/admin/events/event-form-initial";
import { getActivityDetailHints } from "@/lib/event-activity-type";

type Props = Pick<
  EventFormInitial,
  | "activityType"
  | "activityTypeEmoji"
  | "distanceKm"
  | "paceLabel"
  | "difficulty"
  | "costKind"
  | "costNotes"
>;

function labelClass() {
  return "block text-sm font-medium text-zinc-800";
}

function inputClass() {
  return "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";
}

export function EventTypeMetricsSection(initial: Props) {
  const [activityLabel, setActivityLabel] = useState(initial.activityType);
  const [costKind, setCostKind] = useState<"free" | "paid">(initial.costKind);

  const hints = useMemo(() => getActivityDetailHints(activityLabel), [activityLabel]);
  const showAnyMetric = hints.showDistance || hints.showPace || hints.showDifficulty;

  return (
    <div className="space-y-6">
      <div>
        <label className={labelClass()} id="activity-type-heading">
          Event type
        </label>
        <div className="mt-2" aria-labelledby="activity-type-heading">
          <ActivityTypeFields
            initialLabel={initial.activityType}
            initialEmoji={initial.activityTypeEmoji}
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
            Details for this activity
          </h3>
          <p className="mt-1 text-xs text-zinc-600">
            Fields below follow the type name (e.g. pace for runs, difficulty for hikes). You
            can still leave them blank.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {hints.showDistance ? (
              <div>
                <label className={labelClass()} htmlFor="distanceKm">
                  Distance (km)
                </label>
                <input
                  id="distanceKm"
                  name="distanceKm"
                  inputMode="decimal"
                  defaultValue={initial.distanceKm}
                  placeholder="e.g. 5.2"
                  className={`${inputClass()} mt-1`}
                />
              </div>
            ) : (
              <input type="hidden" name="distanceKm" value="" />
            )}
            {hints.showPace ? (
              <div>
                <label className={labelClass()} htmlFor="paceLabel">
                  Pace
                </label>
                <input
                  id="paceLabel"
                  name="paceLabel"
                  maxLength={120}
                  defaultValue={initial.paceLabel}
                  placeholder="e.g. ~7:30/km"
                  className={`${inputClass()} mt-1`}
                />
              </div>
            ) : (
              <input type="hidden" name="paceLabel" value="" />
            )}
            {hints.showDifficulty ? (
              <div>
                <label className={labelClass()} htmlFor="difficulty">
                  Difficulty
                </label>
                <input
                  id="difficulty"
                  name="difficulty"
                  maxLength={120}
                  defaultValue={initial.difficulty}
                  placeholder="e.g. moderate, steep sections"
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
        <h3 className="text-sm font-medium text-zinc-900">Cost</h3>
        <fieldset className="mt-3 space-y-3">
          <legend className="sr-only">Participation cost</legend>
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
              Free to join
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
              Paid / contribution
            </label>
          </div>
          {costKind === "paid" ? (
            <div>
              <label className={labelClass()} htmlFor="costNotes">
                Cost details
              </label>
              <textarea
                id="costNotes"
                name="costNotes"
                rows={2}
                maxLength={500}
                defaultValue={initial.costNotes}
                placeholder="e.g. 150 TRY per person, pay at registration…"
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
