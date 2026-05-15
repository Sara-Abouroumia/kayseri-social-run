import type { JoinApprovalConfig } from "@/db/schema/events";
import type { events } from "@/db/schema/events";
import type { RegistrationQuestionDraft } from "@/lib/event-registration";

export type EventFormInitial = {
  id?: string;
  shareSlug?: string;
  title: string;
  description: string;
  activityType: string;
  activityTypeEmoji: string;
  startsAt: string;
  endsAt: string;
  meetingPointName: string;
  meetingPointAddress: string;
  latitude: string;
  longitude: string;
  distanceKm: string;
  paceLabel: string;
  difficulty: string;
  requiredItems: string;
  coordinatorName: string;
  maxParticipants: string;
  joinDeadlineAt: string;
  weatherInfo: string;
  visibility: "public" | "members_only" | "private";
  coverImageUrl: string;
  costKind: "free" | "paid";
  costNotes: string;
  registrationQuestions: RegistrationQuestionDraft[];
  joinApprovalMode: "auto" | "manual" | "conditional";
  joinApprovalConfig: JoinApprovalConfig | null;
};

export const emptyEventFormInitial: EventFormInitial = {
  title: "",
  description: "",
  activityType: "Run",
  activityTypeEmoji: "🏃",
  startsAt: "",
  endsAt: "",
  meetingPointName: "",
  meetingPointAddress: "",
  latitude: "",
  longitude: "",
  distanceKm: "",
  paceLabel: "",
  difficulty: "",
  requiredItems: "",
  coordinatorName: "",
  maxParticipants: "",
  joinDeadlineAt: "",
  weatherInfo: "",
  visibility: "public",
  coverImageUrl: "",
  costKind: "free",
  costNotes: "",
  registrationQuestions: [],
  joinApprovalMode: "auto",
  joinApprovalConfig: null,
};

export function toDatetimeLocalValue(d: Date): string {
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return t.toISOString().slice(0, 16);
}

export function eventRowToFormInitial(
  row: typeof events.$inferSelect,
): EventFormInitial {
  return {
    id: row.id,
    shareSlug: row.shareSlug,
    title: row.title,
    description: row.description ?? "",
    activityType: row.activityType,
    activityTypeEmoji: row.activityTypeEmoji ?? "",
    startsAt: toDatetimeLocalValue(new Date(row.startsAt)),
    endsAt: row.endsAt ? toDatetimeLocalValue(new Date(row.endsAt)) : "",
    meetingPointName: row.meetingPointName ?? "",
    meetingPointAddress: row.meetingPointAddress ?? "",
    latitude: row.latitude != null ? String(row.latitude) : "",
    longitude: row.longitude != null ? String(row.longitude) : "",
    distanceKm: row.distanceKm != null ? String(row.distanceKm) : "",
    paceLabel: row.paceLabel ?? "",
    difficulty: row.difficulty ?? "",
    requiredItems: row.requiredItems ?? "",
    coordinatorName: row.coordinatorName ?? "",
    maxParticipants:
      row.maxParticipants != null ? String(row.maxParticipants) : "",
    joinDeadlineAt: row.joinDeadlineAt
      ? toDatetimeLocalValue(new Date(row.joinDeadlineAt))
      : "",
    weatherInfo: row.weatherInfo ?? "",
    visibility: row.visibility,
    coverImageUrl: row.coverImageUrl ?? "",
    costKind: row.costKind === "paid" ? "paid" : "free",
    costNotes: row.costNotes ?? "",
    registrationQuestions: [],
    joinApprovalMode: row.joinApprovalMode ?? "auto",
    joinApprovalConfig: row.joinApprovalConfig ?? null,
  };
}
