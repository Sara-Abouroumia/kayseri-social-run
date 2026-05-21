import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  eventParticipantAnswers,
  eventRegistrationQuestions,
} from "@/db/schema/event-registration";
import type { JoinApprovalConfig } from "@/db/schema/events";
import { events } from "@/db/schema/events";
import {
  normalizeRegistrationQuestions,
  type RegistrationQuestionDraft,
} from "@/lib/event-registration";

export async function listRegistrationQuestionsForEvent(eventId: string) {
  return db
    .select()
    .from(eventRegistrationQuestions)
    .where(eq(eventRegistrationQuestions.eventId, eventId))
    .orderBy(eventRegistrationQuestions.sortOrder);
}

export function rowsToQuestionDrafts(
  rows: Awaited<ReturnType<typeof listRegistrationQuestionsForEvent>>,
): RegistrationQuestionDraft[] {
  return normalizeRegistrationQuestions(
    rows.map((r) => ({
      id: r.id,
      label: r.label,
      questionType: r.questionType,
      required: r.required,
      sortOrder: r.sortOrder,
      dependsOnQuestionId: r.dependsOnQuestionId,
      dependsOnValue: r.dependsOnValue,
    })),
  );
}

export async function replaceRegistrationQuestionsForEvent(
  eventId: string,
  questions: RegistrationQuestionDraft[],
  joinApprovalMode: "auto" | "manual" | "conditional",
  joinApprovalConfig: JoinApprovalConfig | null,
) {
  const now = new Date();
  const ids = new Set(questions.map((q) => q.id));

  await db
    .delete(eventRegistrationQuestions)
    .where(eq(eventRegistrationQuestions.eventId, eventId));

  if (questions.length > 0) {
    await db.insert(eventRegistrationQuestions).values(
      questions.map((q, i) => ({
        id: q.id,
        eventId,
        label: q.label,
        questionType: q.questionType,
        required: q.required,
        options: null,
        sortOrder: i,
        dependsOnQuestionId: q.dependsOnQuestionId,
        dependsOnValue: q.dependsOnValue,
        createdAt: now,
        updatedAt: now,
      })),
    );
  }

  const validConfig =
    joinApprovalMode === "conditional" && joinApprovalConfig
      ? {
          ...joinApprovalConfig,
          rules: joinApprovalConfig.rules.filter((r) => ids.has(r.questionId)),
        }
      : null;

  await db
    .update(events)
    .set({
      joinApprovalMode,
      joinApprovalConfig: validConfig,
      updatedAt: now,
    })
    .where(eq(events.id, eventId));
}

export async function saveParticipantAnswers(
  participantId: string,
  answers: Record<string, string>,
) {
  const now = new Date();
  const entries = Object.entries(answers).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return;

  await db.insert(eventParticipantAnswers).values(
    entries.map(([questionId, value]) => ({
      id: crypto.randomUUID(),
      participantId,
      questionId,
      value,
      createdAt: now,
    })),
  );
}

export async function deleteParticipantAnswers(participantId: string) {
  await db
    .delete(eventParticipantAnswers)
    .where(eq(eventParticipantAnswers.participantId, participantId));
}
