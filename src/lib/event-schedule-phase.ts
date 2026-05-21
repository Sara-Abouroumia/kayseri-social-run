/** When an activity is relative to “now” for public RSVP UI. */
export type EventSchedulePhase = "upcoming" | "ongoing" | "finished";

type EventTimes = {
  startsAt: Date | string;
  endsAt?: Date | string | null;
};

const DEFAULT_DURATION_MS = 3 * 60 * 60 * 1000;

function effectiveEnd(start: Date, endsAt: Date | string | null | undefined): Date {
  if (endsAt) return new Date(endsAt);
  return new Date(start.getTime() + DEFAULT_DURATION_MS);
}

export function getEventSchedulePhase(
  event: EventTimes,
  now: Date = new Date(),
): EventSchedulePhase {
  const start = new Date(event.startsAt);
  const end = effectiveEnd(start, event.endsAt);
  const t = now.getTime();

  if (t >= end.getTime()) return "finished";
  if (t >= start.getTime()) return "ongoing";
  return "upcoming";
}

export function canOpenEventSignups(
  event: EventTimes,
  now: Date = new Date(),
): boolean {
  return getEventSchedulePhase(event, now) === "upcoming";
}

/** Finished events are view-only (no admin or cover edits). */
export function canEditEvent(
  event: EventTimes,
  now: Date = new Date(),
): boolean {
  return getEventSchedulePhase(event, now) !== "finished";
}
