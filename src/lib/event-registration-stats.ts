import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import {
  eventParticipantAnswers,
  eventRegistrationQuestions,
} from "@/db/schema/event-registration";
import { eventParticipants } from "@/db/schema/events";
import {
  normalizeRegistrationAnswerValue,
  sortQuestionsForDisplay,
  type RegistrationQuestionDraft,
} from "@/lib/event-registration";
import { rowsToQuestionDrafts } from "@/lib/event-registration-persist";
import type { ParticipantStatus } from "@/lib/event-participation";

const STATS_STATUSES: ParticipantStatus[] = ["going", "pending", "waitlisted"];

export type ChoiceBucket = { key: string; label: string; count: number };

export type QuestionAggregate =
  | { questionId: string; kind: "choice"; buckets: ChoiceBucket[]; total: number }
  | {
      questionId: string;
      kind: "number";
      count: number;
      min: number | null;
      max: number | null;
      avg: number | null;
    }
  | { questionId: string; kind: "text"; count: number };

export type ParticipantWithAnswers = {
  participantId: string;
  userId: string;
  name: string;
  email: string;
  status: ParticipantStatus;
  answers: Record<string, string>;
};

export type EventRegistrationResponseData = {
  questions: RegistrationQuestionDraft[];
  aggregates: QuestionAggregate[];
  participants: ParticipantWithAnswers[];
};

export function formatAnswerForDisplay(
  questionType: RegistrationQuestionDraft["questionType"],
  raw: string,
  labels: { yes: string; no: string; checked: string; unchecked: string },
): string {
  const v = normalizeRegistrationAnswerValue(questionType, raw);
  if (questionType === "yes_no") {
    if (v === "yes") return labels.yes;
    if (v === "no") return labels.no;
    return "—";
  }
  if (questionType === "checkbox") {
    return v === "true" ? labels.checked : labels.unchecked;
  }
  if (v.trim() === "") return "—";
  return v;
}

function buildChoiceBuckets(
  questionType: "yes_no" | "checkbox",
  values: string[],
  labels: { yes: string; no: string; checked: string; unchecked: string },
): ChoiceBucket[] {
  if (questionType === "yes_no") {
    const yes = values.filter((v) => v === "yes").length;
    const no = values.filter((v) => v === "no").length;
    return [
      { key: "yes", label: labels.yes, count: yes },
      { key: "no", label: labels.no, count: no },
    ];
  }
  const checked = values.filter((v) => v === "true").length;
  const unchecked = values.filter((v) => v === "false").length;
  return [
    { key: "true", label: labels.checked, count: checked },
    { key: "false", label: labels.unchecked, count: unchecked },
  ];
}

function buildAggregates(
  questions: RegistrationQuestionDraft[],
  participants: ParticipantWithAnswers[],
  labels: { yes: string; no: string; checked: string; unchecked: string },
): QuestionAggregate[] {
  const out: QuestionAggregate[] = [];

  for (const q of questions) {
    const values = participants
      .map((p) => p.answers[q.id])
      .filter((v): v is string => v !== undefined && v !== "")
      .map((v) => normalizeRegistrationAnswerValue(q.questionType, v));

    if (q.questionType === "yes_no" || q.questionType === "checkbox") {
      const normalized = participants.map((p) =>
        normalizeRegistrationAnswerValue(
          q.questionType,
          p.answers[q.id] ?? (q.questionType === "checkbox" ? "false" : ""),
        ),
      );
      const buckets = buildChoiceBuckets(q.questionType, normalized, labels);
      const total = buckets.reduce((s, b) => s + b.count, 0);
      out.push({ questionId: q.id, kind: "choice", buckets, total });
      continue;
    }

    if (q.questionType === "number") {
      const nums = values
        .map((v) => Number(v.replace(",", ".")))
        .filter((n) => !Number.isNaN(n));
      const count = nums.length;
      out.push({
        questionId: q.id,
        kind: "number",
        count,
        min: count ? Math.min(...nums) : null,
        max: count ? Math.max(...nums) : null,
        avg: count ? nums.reduce((a, b) => a + b, 0) / count : null,
      });
      continue;
    }

    out.push({ questionId: q.id, kind: "text", count: values.length });
  }

  return out;
}

export async function fetchEventRegistrationResponseData(
  eventId: string,
  displayLabels: { yes: string; no: string; checked: string; unchecked: string },
): Promise<EventRegistrationResponseData | null> {
  const questionRows = await db
    .select()
    .from(eventRegistrationQuestions)
    .where(eq(eventRegistrationQuestions.eventId, eventId))
    .orderBy(asc(eventRegistrationQuestions.sortOrder));

  const questions = sortQuestionsForDisplay(rowsToQuestionDrafts(questionRows));
  if (questions.length === 0) return null;

  const participantRows = await db
    .select({
      participantId: eventParticipants.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      status: eventParticipants.status,
    })
    .from(eventParticipants)
    .innerJoin(user, eq(eventParticipants.userId, user.id))
    .where(
      and(
        eq(eventParticipants.eventId, eventId),
        inArray(eventParticipants.status, STATS_STATUSES),
      ),
    )
    .orderBy(asc(eventParticipants.createdAt));

  const participantIds = participantRows.map((r) => r.participantId);
  const answerRows =
    participantIds.length === 0
      ? []
      : await db
          .select({
            participantId: eventParticipantAnswers.participantId,
            questionId: eventParticipantAnswers.questionId,
            value: eventParticipantAnswers.value,
          })
          .from(eventParticipantAnswers)
          .where(inArray(eventParticipantAnswers.participantId, participantIds));

  const answersByParticipant = new Map<string, Record<string, string>>();
  for (const r of participantRows) {
    answersByParticipant.set(r.participantId, {});
  }
  for (const a of answerRows) {
    const map = answersByParticipant.get(a.participantId);
    if (map) map[a.questionId] = a.value;
  }

  const participants: ParticipantWithAnswers[] = participantRows.map((r) => ({
    participantId: r.participantId,
    userId: r.userId,
    name: r.name,
    email: r.email,
    status: r.status as ParticipantStatus,
    answers: answersByParticipant.get(r.participantId) ?? {},
  }));

  const aggregates = buildAggregates(questions, participants, displayLabels);

  return { questions, aggregates, participants };
}
