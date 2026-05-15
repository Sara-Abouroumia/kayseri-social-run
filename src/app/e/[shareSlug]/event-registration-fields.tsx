"use client";

import { useMemo, useState } from "react";

import type { RegistrationQuestionDraft } from "@/lib/event-registration";
import { isQuestionVisible } from "@/lib/event-registration";

function inputClass() {
  return "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";
}

function labelClass() {
  return "block text-sm font-medium text-zinc-800";
}

type Props = {
  questions: RegistrationQuestionDraft[];
  labels: {
    yes: string;
    no: string;
    requiredMark: string;
  };
};

export function EventRegistrationFields({ questions, labels }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const q of questions) {
      if (q.questionType === "checkbox") init[q.id] = "false";
    }
    return init;
  });

  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  if (questions.length === 0) return null;

  return (
    <div className="mt-4 space-y-4 border-t border-zinc-200 pt-4">
      {questions.map((q) => {
        if (!isQuestionVisible(q, answers, byId)) return null;

        const name = `q_${q.id}`;
        const req = q.required;

        return (
          <div key={q.id}>
            <label className={labelClass()} htmlFor={name}>
              {q.label}
              {req ? (
                <span className="ml-1 text-red-700" aria-hidden>
                  *
                </span>
              ) : null}
            </label>

            {q.questionType === "checkbox" ? (
              <label className="mt-2 flex items-center gap-2 text-sm text-zinc-800">
                <input
                  id={name}
                  name={name}
                  type="checkbox"
                  checked={answers[q.id] === "true"}
                  onChange={(e) => setAnswer(q.id, e.target.checked ? "true" : "false")}
                  className="rounded border-zinc-300"
                />
                {labels.yes}
              </label>
            ) : q.questionType === "yes_no" ? (
              <select
                id={name}
                name={name}
                required={req}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                className={`${inputClass()} mt-1`}
              >
                <option value="">—</option>
                <option value="yes">{labels.yes}</option>
                <option value="no">{labels.no}</option>
              </select>
            ) : q.questionType === "number" ? (
              <input
                id={name}
                name={name}
                type="number"
                inputMode="decimal"
                required={req}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                className={`${inputClass()} mt-1`}
              />
            ) : (
              <input
                id={name}
                name={name}
                type="text"
                required={req}
                maxLength={2000}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                className={`${inputClass()} mt-1`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

