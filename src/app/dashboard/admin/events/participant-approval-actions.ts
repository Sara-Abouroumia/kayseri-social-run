"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { eventParticipants, events } from "@/db/schema/events";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin-session";

export type ApprovalActionState = { ok?: boolean; message?: string };

export async function acceptParticipantAction(
  _prev: ApprovalActionState | undefined,
  formData: FormData,
): Promise<ApprovalActionState> {
  const gate = await requirePlatformAdminSession();
  if (!gate.ok) return { ok: false, message: "Not allowed." };

  const eventId = z.string().uuid().safeParse(formData.get("eventId"));
  const participantId = z.string().uuid().safeParse(formData.get("participantId"));
  if (!eventId.success || !participantId.success) {
    return { ok: false, message: "Invalid request." };
  }

  const row = await db
    .select({
      status: eventParticipants.status,
      shareSlug: events.shareSlug,
    })
    .from(eventParticipants)
    .innerJoin(events, eq(eventParticipants.eventId, events.id))
    .where(
      and(
        eq(eventParticipants.id, participantId.data),
        eq(eventParticipants.eventId, eventId.data),
      ),
    )
    .limit(1);

  const p = row[0];
  if (!p) return { ok: false, message: "Participant not found." };
  if (p.status !== "pending") {
    return { ok: false, message: "Only pending registrations can be accepted." };
  }

  const eventRows = await db
    .select({ maxParticipants: events.maxParticipants })
    .from(events)
    .where(eq(events.id, eventId.data))
    .limit(1);
  const max = eventRows[0]?.maxParticipants;

  const [{ goingN }] = await db
    .select({ goingN: count() })
    .from(eventParticipants)
    .where(and(eq(eventParticipants.eventId, eventId.data), eq(eventParticipants.status, "going")));

  const now = new Date();
  const goingCount = Number(goingN);
  const nextStatus =
    max != null && max > 0 && goingCount >= max ? "waitlisted" : "going";

  await db
    .update(eventParticipants)
    .set({ status: nextStatus, updatedAt: now })
    .where(eq(eventParticipants.id, participantId.data));

  revalidatePath(`/dashboard/admin/events/${eventId.data}/edit`);
  revalidatePath(`/e/${p.shareSlug}`);
  revalidatePath("/dashboard");

  return {
    ok: true,
    message:
      nextStatus === "waitlisted"
        ? "Accepted but event is full — placed on waitlist."
        : "Participant accepted.",
  };
}

export async function rejectParticipantAction(
  _prev: ApprovalActionState | undefined,
  formData: FormData,
): Promise<ApprovalActionState> {
  const gate = await requirePlatformAdminSession();
  if (!gate.ok) return { ok: false, message: "Not allowed." };

  const eventId = z.string().uuid().safeParse(formData.get("eventId"));
  const participantId = z.string().uuid().safeParse(formData.get("participantId"));
  if (!eventId.success || !participantId.success) {
    return { ok: false, message: "Invalid request." };
  }

  const row = await db
    .select({ status: eventParticipants.status, shareSlug: events.shareSlug })
    .from(eventParticipants)
    .innerJoin(events, eq(eventParticipants.eventId, events.id))
    .where(
      and(
        eq(eventParticipants.id, participantId.data),
        eq(eventParticipants.eventId, eventId.data),
      ),
    )
    .limit(1);

  const p = row[0];
  if (!p) return { ok: false, message: "Participant not found." };
  if (p.status !== "pending") {
    return { ok: false, message: "Only pending registrations can be rejected." };
  }

  const now = new Date();
  await db
    .update(eventParticipants)
    .set({ status: "rejected", updatedAt: now })
    .where(eq(eventParticipants.id, participantId.data));

  revalidatePath(`/dashboard/admin/events/${eventId.data}/edit`);
  revalidatePath(`/e/${p.shareSlug}`);
  revalidatePath("/dashboard");

  return { ok: true, message: "Registration rejected." };
}
