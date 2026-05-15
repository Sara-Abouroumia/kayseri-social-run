import {
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { clubs } from "./clubs";
import { user } from "./auth";

export const eventVisibility = pgEnum("event_visibility", [
  "public",
  "members_only",
  "private",
]);

export const participationStatus = pgEnum("participation_status", [
  "going",
  "pending",
  "rejected",
  "cancelled",
  "waitlisted",
]);

export const eventCostKind = pgEnum("event_cost_kind", ["free", "paid"]);

export const joinApprovalMode = pgEnum("join_approval_mode", [
  "auto",
  "manual",
  "conditional",
]);

/** First matching rule wins; otherwise `defaultOutcome` applies. */
export type JoinApprovalRule = {
  questionId: string;
  when:
    | "checked"
    | "unchecked"
    | "yes"
    | "no"
    | "equals"
    | "not_equals";
  value?: string;
  outcome: "pending" | "accepted";
};

export type JoinApprovalConfig = {
  rules: JoinApprovalRule[];
  defaultOutcome: "pending" | "accepted";
};

export const events = pgTable("events", {
  id: text("id").primaryKey(),

  /** Public share URL segment: /e/[shareSlug] */
  shareSlug: text("share_slug").notNull().unique(),

  clubId: text("club_id").references(() => clubs.id, { onDelete: "set null" }),

  title: text("title").notNull(),
  description: text("description"),
  activityType: text("activity_type").notNull().default("Run"),
  /** Optional icon shown with the type name (any short Unicode string). */
  activityTypeEmoji: text("activity_type_emoji"),

  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),

  meetingPointName: text("meeting_point_name"),
  meetingPointAddress: text("meeting_point_address"),

  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),

  distanceKm: decimal("distance_km", { precision: 5, scale: 2 }),
  paceLabel: text("pace_label"),
  difficulty: text("difficulty"),

  requiredItems: text("required_items"),
  coordinatorName: text("coordinator_name"),

  maxParticipants: integer("max_participants"),
  joinDeadlineAt: timestamp("join_deadline_at"),
  weatherInfo: text("weather_info"),

  costKind: eventCostKind("cost_kind").notNull().default("free"),
  /** When `costKind` is paid: amount, currency, how to pay, etc. */
  costNotes: text("cost_notes"),

  visibility: eventVisibility("visibility").notNull().default("public"),

  /** How join requests are approved after registration answers are submitted. */
  joinApprovalMode: joinApprovalMode("join_approval_mode").notNull().default("auto"),
  /** When mode is `conditional`, rules stored as JSON (see JoinApprovalConfig). */
  joinApprovalConfig: jsonb("join_approval_config").$type<JoinApprovalConfig>(),

  coverImageUrl: text("cover_image_url"),

  createdByUserId: text("created_by_user_id").references(() => user.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const eventParticipants = pgTable(
  "event_participants",
  {
    id: text("id").primaryKey(),

    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    status: participationStatus("status").notNull().default("going"),

    note: text("note"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("event_participants_event_id_user_id_uidx").on(
      t.eventId,
      t.userId,
    ),
  ],
);
