"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, asc, count, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { db } from "@/db";
import { eventParticipants, events } from "@/db/schema/events";
import { auth } from "@/lib/auth";
import {
  collectAnswersFromFormData,
  evaluateJoinApprovalOutcome,
  validateRegistrationAnswers,
} from "@/lib/event-registration";
import {
  deleteParticipantAnswers,
  listRegistrationQuestionsForEvent,
  rowsToQuestionDrafts,
  saveParticipantAnswers,
} from "@/lib/event-registration-persist";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import type { Messages } from "@/i18n/messages/en";

type EventRow = InferSelectModel<typeof events>;
type RsvpMessages = Messages["rsvpActions"];

export type RsvpActionState = { ok?: boolean; message?: string };

function revalidateEventPaths(shareSlug: string, eventId: string) {
  revalidatePath(`/e/${shareSlug}`);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/admin/events/${eventId}/edit`);
}

async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) return null;
  return session.user;
}

function readEmailVerified(user: { emailVerified?: boolean }): boolean {
  return Boolean(user.emailVerified);
}

function assertCanAttemptRsvp(
  event: EventRow,
  emailVerified: boolean,
  m: RsvpMessages,
): string | null {
  const now = new Date();
  if (!emailVerified) {
    return m.verifyEmailFirst;
  }
  if (new Date(event.startsAt) <= now) {
    return m.startedSignupsClosed;
  }
  if (event.joinDeadlineAt && new Date(event.joinDeadlineAt) < now) {
    return m.joinDeadlinePassed;
  }
  return null;
}

async function resolveParticipantStatus(
  event: EventRow,
  answersByQuestionId: Record<string, string>,
  questions: ReturnType<typeof rowsToQuestionDrafts>,
): Promise<"going" | "waitlisted" | "pending"> {
  const questionsById = new Map(
    questions.map((q) => [q.id, { questionType: q.questionType }]),
  );

  const outcome = evaluateJoinApprovalOutcome(
    event.joinApprovalMode,
    event.joinApprovalConfig,
    answersByQuestionId,
    questionsById,
  );

  if (outcome === "pending") return "pending";

  const max = event.maxParticipants;
  const [{ goingN }] = await db
    .select({ goingN: count() })
    .from(eventParticipants)
    .where(and(eq(eventParticipants.eventId, event.id), eq(eventParticipants.status, "going")));

  const goingCount = Number(goingN);
  if (max != null && max > 0 && goingCount >= max) return "waitlisted";
  return "going";
}

export async function joinEventAction(
  _prev: RsvpActionState | undefined,
  formData: FormData,
): Promise<RsvpActionState> {
  const m = getDictionary(await getLocale()).rsvpActions;

  const shareSlugRaw = formData.get("shareSlug");
  const shareSlug = typeof shareSlugRaw === "string" ? shareSlugRaw.trim() : "";
  if (!shareSlug) return { ok: false, message: m.missingSlug };

  const u = await getSessionUser();
  if (!u) return { ok: false, message: m.signInToJoin };

  const emailVerified = readEmailVerified(u as { emailVerified?: boolean });

  const eventRows = await db.select().from(events).where(eq(events.shareSlug, shareSlug)).limit(1);
  const event = eventRows[0];
  if (!event) return { ok: false, message: m.activityNotFound };

  const gate = assertCanAttemptRsvp(event, emailVerified, m);
  if (gate) return { ok: false, message: gate };

  const questionRows = await listRegistrationQuestionsForEvent(event.id);
  const questions = rowsToQuestionDrafts(questionRows);
  const formAnswers = collectAnswersFromFormData(questions, formData);
  const validationError = validateRegistrationAnswers(questions, formAnswers);
  if (validationError) return { ok: false, message: validationError };

  const existing = await db
    .select()
    .from(eventParticipants)
    .where(and(eq(eventParticipants.eventId, event.id), eq(eventParticipants.userId, u.id)))
    .limit(1);
  const row = existing[0];
  if (row?.status === "going") {
    return { ok: false, message: m.alreadySignedUp };
  }
  if (row?.status === "waitlisted") {
    return { ok: false, message: m.alreadyOnWaitlist };
  }
  if (row?.status === "pending") {
    return { ok: false, message: m.alreadyPending };
  }

  const nextStatus = await resolveParticipantStatus(event, formAnswers, questions);

  const now = new Date();
  let participantId: string;

  if (row) {
    participantId = row.id;
    await db
      .update(eventParticipants)
      .set({ status: nextStatus, updatedAt: now })
      .where(eq(eventParticipants.id, row.id));
    await deleteParticipantAnswers(participantId);
  } else {
    participantId = crypto.randomUUID();
    await db.insert(eventParticipants).values({
      id: participantId,
      eventId: event.id,
      userId: u.id,
      status: nextStatus,
      note: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  const visibleAnswers: Record<string, string> = {};
  const byId = new Map(questions.map((q) => [q.id, q]));
  for (const q of questions) {
    if (q.dependsOnQuestionId) {
      const parent = byId.get(q.dependsOnQuestionId);
      if (!parent) continue;
      const parentVal = formAnswers[q.dependsOnQuestionId] ?? "";
      const expected = (q.dependsOnValue ?? "true").trim();
      const normalized =
        parent.questionType === "checkbox"
          ? parentVal === "true" || parentVal === "on"
            ? "true"
            : "false"
          : parentVal.trim();
      if (normalized !== expected) continue;
    }
    visibleAnswers[q.id] = formAnswers[q.id] ?? "";
  }

  await saveParticipantAnswers(participantId, visibleAnswers);

  revalidateEventPaths(shareSlug, event.id);
  return {
    ok: true,
    message:
      nextStatus === "waitlisted"
        ? m.joinedWaitlist
        : nextStatus === "pending"
          ? m.joinedPending
          : m.joinedGoing,
  };
}

export async function leaveEventAction(
  _prev: RsvpActionState | undefined,
  formData: FormData,
): Promise<RsvpActionState> {
  const m = getDictionary(await getLocale()).rsvpActions;

  const shareSlugRaw = formData.get("shareSlug");
  const shareSlug = typeof shareSlugRaw === "string" ? shareSlugRaw.trim() : "";
  if (!shareSlug) return { ok: false, message: m.missingSlug };

  const u = await getSessionUser();
  if (!u) return { ok: false, message: m.signInToUpdate };

  const eventRows = await db.select().from(events).where(eq(events.shareSlug, shareSlug)).limit(1);
  const event = eventRows[0];
  if (!event) return { ok: false, message: m.activityNotFound };

  const now = new Date();
  if (new Date(event.startsAt) <= now) {
    return {
      ok: false,
      message: m.startedCannotCancel,
    };
  }

  const existing = await db
    .select()
    .from(eventParticipants)
    .where(and(eq(eventParticipants.eventId, event.id), eq(eventParticipants.userId, u.id)))
    .limit(1);
  const p = existing[0];
  if (!p || p.status === "cancelled") {
    return { ok: false, message: m.notSignedUp };
  }

  const wasGoing = p.status === "going";

  await db
    .update(eventParticipants)
    .set({ status: "cancelled", updatedAt: now })
    .where(eq(eventParticipants.id, p.id));

  if (wasGoing) {
    const [nextWait] = await db
      .select()
      .from(eventParticipants)
      .where(and(eq(eventParticipants.eventId, event.id), eq(eventParticipants.status, "waitlisted")))
      .orderBy(asc(eventParticipants.createdAt))
      .limit(1);
    if (nextWait) {
      await db
        .update(eventParticipants)
        .set({ status: "going", updatedAt: now })
        .where(eq(eventParticipants.id, nextWait.id));
    }
  }

  revalidateEventPaths(shareSlug, event.id);
  return { ok: true, message: m.signupCancelled };
}
