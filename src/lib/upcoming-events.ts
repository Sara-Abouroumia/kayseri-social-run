import { and, asc, eq, gte, inArray, type InferSelectModel } from "drizzle-orm";

import { db } from "@/db";
import { events } from "@/db/schema/events";
import { isPlatformAdmin } from "@/lib/platform-admin";

export type UpcomingDashboardEvent = Pick<
  InferSelectModel<typeof events>,
  | "id"
  | "title"
  | "shareSlug"
  | "startsAt"
  | "activityType"
  | "activityTypeEmoji"
  | "visibility"
  | "coverImageUrl"
  | "meetingPointName"
  | "distanceKm"
  | "description"
>;

export async function getUpcomingEventsForDashboard(params: {
  userId: string;
  email: string;
}): Promise<UpcomingDashboardEvent[]> {
  const admin = await isPlatformAdmin(params.userId, params.email);
  const now = new Date();
  const visibilities = admin
    ? (["public", "members_only", "private"] as const)
    : (["public", "members_only"] as const);

  return db
    .select({
      id: events.id,
      title: events.title,
      shareSlug: events.shareSlug,
      startsAt: events.startsAt,
      activityType: events.activityType,
      activityTypeEmoji: events.activityTypeEmoji,
      visibility: events.visibility,
      coverImageUrl: events.coverImageUrl,
      meetingPointName: events.meetingPointName,
      distanceKm: events.distanceKm,
      description: events.description,
    })
    .from(events)
    .where(and(gte(events.startsAt, now), inArray(events.visibility, visibilities)))
    .orderBy(asc(events.startsAt))
    .limit(12);
}

/** Public landing page — upcoming club events (registration requires an account). */
export async function getPublicUpcomingEvents(
  limit = 4,
): Promise<UpcomingDashboardEvent[]> {
  const now = new Date();

  return db
    .select({
      id: events.id,
      title: events.title,
      shareSlug: events.shareSlug,
      startsAt: events.startsAt,
      activityType: events.activityType,
      activityTypeEmoji: events.activityTypeEmoji,
      visibility: events.visibility,
      coverImageUrl: events.coverImageUrl,
      meetingPointName: events.meetingPointName,
      distanceKm: events.distanceKm,
      description: events.description,
    })
    .from(events)
    .where(
      and(
        gte(events.startsAt, now),
        inArray(events.visibility, ["public", "members_only"]),
      ),
    )
    .orderBy(asc(events.startsAt))
    .limit(limit);
}
