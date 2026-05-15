import { z } from "zod";

import type { JoinApprovalConfig, JoinApprovalRule } from "@/db/schema/events";

export type RegistrationQuestionDraft = {
  id: string;
  label: string;
  questionType: "checkbox" | "yes_no" | "text" | "number";
  required: boolean;
  sortOrder: number;
  dependsOnQuestionId: string | null;
  dependsOnValue: string | null;
};

export const registrationQuestionDraftSchema = z.object({
  id: z.string().uuid(),
  label: z.string().trim().min(1).max(500),
  questionType: z.enum(["checkbox", "yes_no", "text", "number"]),
  required: z.boolean(),
  sortOrder: z.number().int().min(0),
  dependsOnQuestionId: z.string().uuid().nullable(),
  dependsOnValue: z.string().max(200).nullable(),
});

export const joinApprovalConfigSchema = z.object({
  rules: z.array(
    z.object({
      questionId: z.string().uuid(),
      when: z.enum([
        "checked",
        "unchecked",
        "yes",
        "no",
        "equals",
        "not_equals",
      ]),
      value: z.string().max(500).optional(),
      outcome: z.enum(["pending", "accepted"]),
    }),
  ),
  defaultOutcome: z.enum(["pending", "accepted"]),
});

export function parseRegistrationQuestionsJson(raw: unknown): RegistrationQuestionDraft[] {
  if (typeof raw !== "string" || raw.trim() === "") return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: RegistrationQuestionDraft[] = [];
    for (const item of parsed) {
      const r = registrationQuestionDraftSchema.safeParse(item);
      if (r.success) out.push(r.data);
    }
    return out.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [];
  }
}

export function parseJoinApprovalConfigJson(raw: unknown): JoinApprovalConfig | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    const r = joinApprovalConfigSchema.safeParse(parsed);
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}

function normalizeAnswerValue(questionType: string, value: string): string {
  const v = value.trim();
  if (questionType === "checkbox") {
    return v === "true" || v === "on" || v === "1" ? "true" : "false";
  }
  if (questionType === "yes_no") {
    const lower = v.toLowerCase();
    if (lower === "yes" || lower === "true") return "yes";
    if (lower === "no" || lower === "false") return "no";
    return v;
  }
  return v;
}

function ruleMatches(rule: JoinApprovalRule, answer: string | undefined): boolean {
  const a = (answer ?? "").trim();
  switch (rule.when) {
    case "checked":
      return a === "true";
    case "unchecked":
      return a !== "true";
    case "yes":
      return a.toLowerCase() === "yes";
    case "no":
      return a.toLowerCase() === "no";
    case "equals":
      return a === (rule.value ?? "").trim();
    case "not_equals":
      return a !== (rule.value ?? "").trim();
    default:
      return false;
  }
}

/** Resolved outcome before capacity / waitlist logic. */
export function evaluateJoinApprovalOutcome(
  mode: "auto" | "manual" | "conditional",
  config: JoinApprovalConfig | null | undefined,
  answersByQuestionId: Record<string, string>,
  questionsById: Map<string, { questionType: string }>,
): "pending" | "accepted" {
  if (mode === "manual") return "pending";
  if (mode === "auto") return "accepted";

  const cfg: JoinApprovalConfig = config ?? {
    rules: [],
    defaultOutcome: "accepted",
  };

  const normalized: Record<string, string> = {};
  for (const [qid, val] of Object.entries(answersByQuestionId)) {
    const q = questionsById.get(qid);
    normalized[qid] = q
      ? normalizeAnswerValue(q.questionType, val)
      : val.trim();
  }

  for (const rule of cfg.rules) {
    if (ruleMatches(rule, normalized[rule.questionId])) {
      return rule.outcome;
    }
  }
  return cfg.defaultOutcome;
}

export function isQuestionVisible(
  q: RegistrationQuestionDraft,
  answers: Record<string, string>,
  questionsById: Map<string, RegistrationQuestionDraft>,
): boolean {
  if (!q.dependsOnQuestionId) return true;
  const parent = questionsById.get(q.dependsOnQuestionId);
  if (!parent) return true;
  const parentAnswer = normalizeAnswerValue(
    parent.questionType,
    answers[q.dependsOnQuestionId] ?? "",
  );
  const expected = (q.dependsOnValue ?? "true").trim();
  return parentAnswer === expected;
}

export function validateRegistrationAnswers(
  questions: RegistrationQuestionDraft[],
  formAnswers: Record<string, string>,
): string | null {
  const byId = new Map(questions.map((q) => [q.id, q]));

  for (const q of questions) {
    if (!isQuestionVisible(q, formAnswers, byId)) continue;
    const raw = formAnswers[q.id] ?? "";
    if (!q.required) continue;

    if (q.questionType === "checkbox") {
      continue;
    }
    if (raw.trim() === "") {
      return `Please answer: ${q.label}`;
    }
    if (q.questionType === "number" && Number.isNaN(Number(raw.replace(",", ".")))) {
      return `Please enter a valid number for: ${q.label}`;
    }
  }
  return null;
}

export function collectAnswersFromFormData(
  questions: RegistrationQuestionDraft[],
  formData: FormData,
): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const q of questions) {
    if (q.questionType === "checkbox") {
      const checked = formData.get(`q_${q.id}`) === "on";
      answers[q.id] = checked ? "true" : "false";
      continue;
    }
    const v = formData.get(`q_${q.id}`);
    answers[q.id] = typeof v === "string" ? v : "";
  }
  return answers;
}
