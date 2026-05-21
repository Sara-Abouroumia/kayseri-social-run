"use client";

import { useState } from "react";

import type { Messages } from "@/i18n/messages/en";
import { EVENT_ACTIVITY_PRESETS } from "@/lib/event-activity-type";
import { cn } from "@/lib/utils";

type Copy = Messages["adminEventForm"];

type Props = {
  initialLabel: string;
  initialEmoji: string;
  copy: Copy;
  onLabelChange?: (label: string) => void;
};

function normLabel(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function labelClass() {
  return "block text-sm font-medium text-zinc-800";
}

function inputClass() {
  return "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";
}

export function ActivityTypeFields({
  initialLabel,
  initialEmoji,
  copy,
  onLabelChange,
}: Props) {
  const [label, setLabel] = useState(initialLabel);
  const [emoji, setEmoji] = useState(initialEmoji);

  function setLabelAndNotify(next: string) {
    setLabel(next);
    onLabelChange?.(next);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-600">{copy.activityPresetsHint}</p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={copy.activityPresetsAria}
      >
        {EVENT_ACTIVITY_PRESETS.map((p) => {
          const selected = normLabel(label) === normLabel(p.label);
          const displayLabel = copy.presets[p.label] ?? p.label;
          return (
            <button
              type="button"
              key={`${p.emoji}-${p.label}`}
              aria-pressed={selected}
              onClick={() => {
                setLabelAndNotify(p.label);
                setEmoji(p.emoji);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition",
                selected
                  ? "border-[#d91f06] bg-[#d91f06] text-white shadow-md ring-2 ring-[#d91f06]/20 hover:bg-[#c21b05]"
                  : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50",
              )}
            >
              <span aria-hidden>{p.emoji}</span>
              {displayLabel}
            </button>
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass()} htmlFor="activityType">
            {copy.typeName}
          </label>
          <input
            id="activityType"
            name="activityType"
            required
            maxLength={80}
            value={label}
            onChange={(e) => setLabelAndNotify(e.target.value)}
            placeholder={copy.typeNamePlaceholder}
            className={`${inputClass()} mt-1`}
          />
        </div>
        <div>
          <label className={labelClass()} htmlFor="activityTypeEmoji">
            {copy.emojiOptional}
          </label>
          <input
            id="activityTypeEmoji"
            name="activityTypeEmoji"
            maxLength={16}
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🏃"
            className={`${inputClass()} mt-1`}
            aria-describedby="activity-type-emoji-hint"
          />
          <p id="activity-type-emoji-hint" className="mt-1 text-xs text-zinc-500">
            {copy.emojiHint}
          </p>
        </div>
      </div>
    </div>
  );
}
