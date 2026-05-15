export type ActivityTypePreset = { label: string; emoji: string };

/** Suggested types in the admin form; coordinators can use any custom label + emoji. */
export const EVENT_ACTIVITY_PRESETS: readonly ActivityTypePreset[] = [
  { label: "Run", emoji: "🏃" },
  { label: "Hike", emoji: "🥾" },
  { label: "Barbecue", emoji: "🍖" },
  { label: "Walk", emoji: "🚶" },
  { label: "Social", emoji: "🤝" },
  { label: "Ride", emoji: "🚴" },
] as const;

function normLabel(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

const PRESET_EMOJI_BY_NORMALIZED_LABEL = new Map<string, string>();
for (const p of EVENT_ACTIVITY_PRESETS) {
  PRESET_EMOJI_BY_NORMALIZED_LABEL.set(normLabel(p.label), p.emoji);
}
/** Extra spellings / legacy values → emoji when `activity_type_emoji` is unset. */
for (const [alias, emoji] of [
  ["bbq", "🍖"],
  ["barbeque", "🍖"],
  ["running", "🏃"],
  ["trail run", "🏃"],
  ["picnic", "🧺"],
] as const) {
  PRESET_EMOJI_BY_NORMALIZED_LABEL.set(alias, emoji);
}

/** Emoji to show when the DB has no `activityTypeEmoji` but the label matches a preset (or alias). */
export function inferActivityEmojiForLabel(activityType: string): string | null {
  const key = normLabel(activityType);
  if (!key) return null;
  return PRESET_EMOJI_BY_NORMALIZED_LABEL.get(key) ?? null;
}

export function resolveActivityTypeDisplay(
  activityType: string,
  activityTypeEmoji: string | null | undefined,
): { emoji: string | null; label: string } {
  const label = activityType.trim();
  const stored = (activityTypeEmoji ?? "").trim();
  if (stored.length > 0) {
    return { emoji: stored, label: label || activityType };
  }
  return { emoji: inferActivityEmojiForLabel(activityType), label: label || activityType };
}

export function formatActivityTypePlain(
  activityType: string,
  activityTypeEmoji: string | null | undefined,
): string {
  const { emoji, label } = resolveActivityTypeDisplay(activityType, activityTypeEmoji);
  if (!label) return "";
  return emoji ? `${emoji} ${label}` : label;
}

/** Which optional detail fields fit this activity name (substring heuristics). */
export type ActivityDetailHints = {
  showDistance: boolean;
  showPace: boolean;
  showDifficulty: boolean;
};

export function getActivityDetailHints(activityTypeLabel: string): ActivityDetailHints {
  const k = normLabel(activityTypeLabel);
  const has = (sub: string) => k.includes(sub);

  const showDistance =
    has("run") ||
    has("walk") ||
    has("hike") ||
    has("jog") ||
    has("race") ||
    has("trail") ||
    has("ride") ||
    has("bike") ||
    has("cycling") ||
    has("trek") ||
    has("5k") ||
    has("10k") ||
    has("marathon") ||
    has("ultra");

  const runLikePace =
    has("run") || has("jog") || has("race") || has("sprint") || has("tempo") || has("interval");
  const showPace =
    runLikePace &&
    !has("walk") &&
    !has("hike") &&
    !has("ride") &&
    !has("bike") &&
    !has("cycling");

  const showDifficulty =
    has("hike") || has("trek") || has("climb") || has("mountain") || has("alpine");

  return { showDistance, showPace, showDifficulty };
}
