"use client";

import { useState } from "react";

import { EVENT_ACTIVITY_PRESETS } from "@/lib/event-activity-type";

type Props = {
  initialLabel: string;
  initialEmoji: string;
  /** Fires when the type name changes (typing or preset) for conditional form fields. */
  onLabelChange?: (label: string) => void;
};

function labelClass() {
  return "block text-sm font-medium text-zinc-800";
}

function inputClass() {
  return "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";
}

export function ActivityTypeFields({ initialLabel, initialEmoji, onLabelChange }: Props) {
  const [label, setLabel] = useState(initialLabel);
  const [emoji, setEmoji] = useState(initialEmoji);

  function setLabelAndNotify(next: string) {
    setLabel(next);
    onLabelChange?.(next);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-600">
        Pick a template or enter your own name and emoji. Anything goes for custom
        activities.
      </p>
      <div className="flex flex-wrap gap-2">
        {EVENT_ACTIVITY_PRESETS.map((p) => (
          <button
            type="button"
            key={`${p.emoji}-${p.label}`}
            onClick={() => {
              setLabelAndNotify(p.label);
              setEmoji(p.emoji);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm hover:border-zinc-300 hover:bg-zinc-50"
          >
            <span aria-hidden>{p.emoji}</span>
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass()} htmlFor="activityType">
            Type name
          </label>
          <input
            id="activityType"
            name="activityType"
            required
            maxLength={80}
            value={label}
            onChange={(e) => setLabelAndNotify(e.target.value)}
            placeholder="e.g. Trail run, Club dinner…"
            className={`${inputClass()} mt-1`}
          />
        </div>
        <div>
          <label className={labelClass()} htmlFor="activityTypeEmoji">
            Emoji (optional)
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
            Leave blank to auto-match known types, or paste any emoji.
          </p>
        </div>
      </div>
    </div>
  );
}
