import { and, asc, count, eq, gte, inArray } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { eventParticipants, events } from "@/db/schema/events";

export type ParticipationGenderKey = "female" | "male";

export type GenderBreakdown = Record<ParticipationGenderKey, number>;

export type ParticipantStatus =
  | "going"
  | "pending"
  | "rejected"
  | "cancelled"
  | "waitlisted";

export async function getUserParticipationStatus(
  eventId: string,
  userId: string,
): Promise<ParticipantStatus | null> {
  const row = await db
    .select({ status: eventParticipants.status })
    .from(eventParticipants)
    .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.userId, userId)))
    .limit(1);
  return row[0]?.status ?? null;
}

export async function countParticipantsByStatus(
  eventId: string,
  statuses: ParticipantStatus[],
): Promise<number> {
  const row = await db
    .select({ n: count() })
    .from(eventParticipants)
    .where(
      and(eq(eventParticipants.eventId, eventId), inArray(eventParticipants.status, statuses)),
    );
  return Number(row[0]?.n ?? 0);
}

export async function getGoingCount(eventId: string): Promise<number> {
  return countParticipantsByStatus(eventId, ["going"]);
}

export async function getGoingGenderBreakdown(eventId: string): Promise<GenderBreakdown> {
  const initial: GenderBreakdown = {
    female: 0,
    male: 0,
  };
  const rows = await db
    .select({
      gender: user.gender,
      n: count(),
    })
    .from(eventParticipants)
    .innerJoin(user, eq(eventParticipants.userId, user.id))
    .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.status, "going")))
    .groupBy(user.gender);

  for (const r of rows) {
    const g = r.gender as ParticipationGenderKey;
    if (g in initial) initial[g] = Number(r.n);
  }
  return initial;
}

/** ISO date (UTC) -> cumulative signup count for "going" participants. */
export async function getGoingSignupsByDay(eventId: string): Promise<{ day: string; count: number }[]> {
  const rows = await db
    .select({ createdAt: eventParticipants.createdAt })
    .from(eventParticipants)
    .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.status, "going")))
    .orderBy(asc(eventParticipants.createdAt));

  const byDay = new Map<string, number>();
  for (const r of rows) {
    const d = new Date(r.createdAt);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  const sortedDays = [...byDay.keys()].sort();
  let running = 0;
  return sortedDays.map((day) => {
    running += byDay.get(day) ?? 0;
    return { day, count: running };
  });
}

export async function listGoingParticipantsForAdmin(eventId: string) {
  return db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      signedUpAt: eventParticipants.createdAt,
    })
    .from(eventParticipants)
    .innerJoin(user, eq(eventParticipants.userId, user.id))
    .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.status, "going")))
    .orderBy(asc(eventParticipants.createdAt));
}

export async function listPendingParticipantsForAdmin(eventId: string) {
  return db
    .select({
      participantId: eventParticipants.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      signedUpAt: eventParticipants.createdAt,
    })
    .from(eventParticipants)
    .innerJoin(user, eq(eventParticipants.userId, user.id))
    .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.status, "pending")))
    .orderBy(asc(eventParticipants.createdAt));
}

export async function listWaitlistedParticipantsForAdmin(eventId: string) {
  return db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      signedUpAt: eventParticipants.createdAt,
    })
    .from(eventParticipants)
    .innerJoin(user, eq(eventParticipants.userId, user.id))
    .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.status, "waitlisted")))
    .orderBy(asc(eventParticipants.createdAt));
}

export async function getMyUpcomingRsvps(userId: string) {
  const now = new Date();
  return db
    .select({
      eventId: events.id,
      title: events.title,
      shareSlug: events.shareSlug,
      startsAt: events.startsAt,
      status: eventParticipants.status,
      signedUpAt: eventParticipants.createdAt,
    })
    .from(eventParticipants)
    .innerJoin(events, eq(eventParticipants.eventId, events.id))
    .where(
      and(
        eq(eventParticipants.userId, userId),
        inArray(eventParticipants.status, ["going", "waitlisted", "pending"]),
        gte(events.startsAt, now),
      ),
    )
    .orderBy(asc(events.startsAt));
}
