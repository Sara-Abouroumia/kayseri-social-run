"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { events } from "@/db/schema/events";
import { getOrCreateDefaultClubId } from "@/lib/default-club";
import { allocateUniqueShareSlug } from "@/lib/event-share-slug";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin-session";

const visibilitySchema = z.enum(["public", "members_only", "private"]);

function emptyToUndefined(s: unknown): string | undefined {
  if (s == null) return undefined;
  const t = String(s).trim();
  return t === "" ? undefined : t;
}

function parseOptionalIsoDate(s: unknown): Date | undefined {
  const raw = emptyToUndefined(s);
  if (!raw) return undefined;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

function parseRequiredIsoDate(s: unknown): Date | null {
  const raw = emptyToUndefined(s);
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function parseOptionalDecimal(s: unknown): string | undefined {
  const raw = emptyToUndefined(s);
  if (!raw) return undefined;
  return raw.replace(",", ".");
}

function parseOptionalInt(s: unknown): number | undefined {
  const raw = emptyToUndefined(s);
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

const eventFieldsSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  description: z
    .string()
    .trim()
    .max(8000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  activityType: z.preprocess((v) => {
    const t = emptyToUndefined(v);
    return t && t.length > 0 ? t : "run";
  }, z.string().trim().min(1).max(80)),
  startsAt: z.unknown().transform(parseRequiredIsoDate),
  endsAt: z.unknown().transform(parseOptionalIsoDate),
  meetingPointName: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  meetingPointAddress: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  latitude: z.unknown().transform(parseOptionalDecimal),
  longitude: z.unknown().transform(parseOptionalDecimal),
  distanceKm: z.unknown().transform(parseOptionalDecimal),
  paceLabel: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  difficulty: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  requiredItems: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  coordinatorName: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  maxParticipants: z.unknown().transform(parseOptionalInt),
  joinDeadlineAt: z.unknown().transform(parseOptionalIsoDate),
  weatherInfo: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  visibility: visibilitySchema,
  coverImageUrl: z.preprocess(
    (v) => {
      if (v == null) return undefined;
      const t = String(v).trim();
      return t === "" ? undefined : t;
    },
    z
      .string()
      .optional()
      .refine(
        (v) =>
          v == null ||
          /^https?:\/\//i.test(v) ||
          /^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(v),
        {
          message:
            "Cover must be an https URL, an uploaded image, or a small embedded image from upload.",
        },
      )
      .refine((v) => v == null || v.length <= 2_500_000, {
        message: "Cover image data is too large. Use a smaller file or Vercel Blob.",
      }),
  ),
});

function formDataToEventFields(fd: FormData) {
  const str = (k: string) => {
    const v = fd.get(k);
    if (v == null) return "";
    if (typeof v !== "string") return "";
    return v;
  };
  return {
    title: str("title"),
    description: str("description"),
    activityType: str("activityType") || "run",
    startsAt: str("startsAt"),
    endsAt: str("endsAt"),
    meetingPointName: str("meetingPointName"),
    meetingPointAddress: str("meetingPointAddress"),
    latitude: str("latitude"),
    longitude: str("longitude"),
    distanceKm: str("distanceKm"),
    paceLabel: str("paceLabel"),
    difficulty: str("difficulty"),
    requiredItems: str("requiredItems"),
    coordinatorName: str("coordinatorName"),
    maxParticipants: str("maxParticipants"),
    joinDeadlineAt: str("joinDeadlineAt"),
    weatherInfo: str("weatherInfo"),
    visibility: str("visibility") || "public",
    coverImageUrl: str("coverImageUrl"),
  };
}

export async function createEventAction(
  _prev: { message?: string; ok?: boolean } | undefined,
  formData: FormData,
): Promise<{ message?: string; ok?: boolean }> {
  const gate = await requirePlatformAdminSession();
  if (!gate.ok) {
    return {
      message:
        gate.message === "Unauthorized"
          ? "You must be signed in."
          : "You do not have permission to manage events.",
      ok: false,
    };
  }

  const parsedFields = eventFieldsSchema.safeParse(formDataToEventFields(formData));
  if (!parsedFields.success) {
    return {
      message: parsedFields.error.issues[0]?.message ?? "Invalid input.",
      ok: false,
    };
  }
  const f = parsedFields.data;
  if (f.startsAt == null) {
    return { message: "Start date and time are required.", ok: false };
  }

  const id = crypto.randomUUID();
  const now = new Date();
  const shareSlug = await allocateUniqueShareSlug(f.title);
  const clubId = await getOrCreateDefaultClubId();

  await db.insert(events).values({
    id,
    shareSlug,
    clubId,
    title: f.title,
    description: f.description ?? null,
    activityType: f.activityType,
    startsAt: f.startsAt,
    endsAt: f.endsAt ?? null,
    meetingPointName: f.meetingPointName ?? null,
    meetingPointAddress: f.meetingPointAddress ?? null,
    latitude: f.latitude ?? null,
    longitude: f.longitude ?? null,
    distanceKm: f.distanceKm ?? null,
    paceLabel: f.paceLabel ?? null,
    difficulty: f.difficulty ?? null,
    requiredItems: f.requiredItems ?? null,
    coordinatorName: f.coordinatorName ?? null,
    maxParticipants: f.maxParticipants ?? null,
    joinDeadlineAt: f.joinDeadlineAt ?? null,
    weatherInfo: f.weatherInfo ?? null,
    visibility: f.visibility,
    coverImageUrl: f.coverImageUrl ?? null,
    createdByUserId: gate.session.user.id,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/dashboard/admin/events");
  revalidatePath(`/e/${shareSlug}`);
  redirect(`/dashboard/admin/events/${id}/edit`);
}

export async function updateEventAction(
  _prev: { message?: string; ok?: boolean } | undefined,
  formData: FormData,
): Promise<{ message?: string; ok?: boolean }> {
  const gate = await requirePlatformAdminSession();
  if (!gate.ok) {
    return {
      message:
        gate.message === "Unauthorized"
          ? "You must be signed in."
          : "You do not have permission to manage events.",
      ok: false,
    };
  }

  const eventId = z.string().uuid().safeParse(formData.get("eventId"));
  if (!eventId.success) {
    return { message: "Invalid event.", ok: false };
  }

  const existing = await db
    .select({ shareSlug: events.shareSlug })
    .from(events)
    .where(eq(events.id, eventId.data))
    .limit(1);
  if (!existing[0]) {
    return { message: "Event not found.", ok: false };
  }

  const parsedFields = eventFieldsSchema.safeParse(formDataToEventFields(formData));
  if (!parsedFields.success) {
    return {
      message: parsedFields.error.issues[0]?.message ?? "Invalid input.",
      ok: false,
    };
  }
  const f = parsedFields.data;
  if (f.startsAt == null) {
    return { message: "Start date and time are required.", ok: false };
  }

  const now = new Date();
  await db
    .update(events)
    .set({
      title: f.title,
      description: f.description ?? null,
      activityType: f.activityType,
      startsAt: f.startsAt,
      endsAt: f.endsAt ?? null,
      meetingPointName: f.meetingPointName ?? null,
      meetingPointAddress: f.meetingPointAddress ?? null,
      latitude: f.latitude ?? null,
      longitude: f.longitude ?? null,
      distanceKm: f.distanceKm ?? null,
      paceLabel: f.paceLabel ?? null,
      difficulty: f.difficulty ?? null,
      requiredItems: f.requiredItems ?? null,
      coordinatorName: f.coordinatorName ?? null,
      maxParticipants: f.maxParticipants ?? null,
      joinDeadlineAt: f.joinDeadlineAt ?? null,
      weatherInfo: f.weatherInfo ?? null,
      visibility: f.visibility,
      coverImageUrl: f.coverImageUrl ?? null,
      updatedAt: now,
    })
    .where(eq(events.id, eventId.data));

  revalidatePath("/dashboard/admin/events");
  revalidatePath(`/dashboard/admin/events/${eventId.data}/edit`);
  revalidatePath(`/e/${existing[0].shareSlug}`);
  return { ok: true, message: "Event updated." };
}

export async function deleteEventAction(
  _prev: { message?: string; ok?: boolean } | undefined,
  formData: FormData,
): Promise<{ message?: string; ok?: boolean }> {
  const gate = await requirePlatformAdminSession();
  if (!gate.ok) {
    return {
      message:
        gate.message === "Unauthorized"
          ? "You must be signed in."
          : "You do not have permission to manage events.",
      ok: false,
    };
  }

  const eventId = z.string().uuid().safeParse(formData.get("eventId"));
  if (!eventId.success) {
    return { message: "Invalid event.", ok: false };
  }

  const confirmTitle = z.string().safeParse(formData.get("confirmTitle"));
  if (!confirmTitle.success) {
    return { message: "Type the event title exactly to confirm deletion.", ok: false };
  }

  const row = await db
    .select({ title: events.title, shareSlug: events.shareSlug })
    .from(events)
    .where(eq(events.id, eventId.data))
    .limit(1);
  if (!row[0]) {
    return { message: "Event not found.", ok: false };
  }

  if (confirmTitle.data !== row[0].title) {
    return {
      message: "Confirmation text must match the event title exactly.",
      ok: false,
    };
  }

  await db.delete(events).where(eq(events.id, eventId.data));

  revalidatePath("/dashboard/admin/events");
  revalidatePath(`/e/${row[0].shareSlug}`);
  redirect("/dashboard/admin/events");
}
