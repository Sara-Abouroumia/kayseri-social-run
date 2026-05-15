"use client";

import { useMemo, useState } from "react";

import type { JoinApprovalConfig } from "@/db/schema/events";
import type { RegistrationQuestionDraft } from "@/lib/event-registration";

function inputClass() {
  return "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";
}

function labelClass() {
  return "block text-sm font-medium text-zinc-800";
}

type ApprovalMode = "auto" | "manual" | "conditional";

type Props = {
  initialQuestions: RegistrationQuestionDraft[];
  initialApprovalMode: ApprovalMode;
  initialApprovalConfig: JoinApprovalConfig | null;
};

function newQuestion(sortOrder: number): RegistrationQuestionDraft {
  return {
    id: crypto.randomUUID(),
    label: "",
    questionType: "checkbox",
    required: false,
    sortOrder,
    dependsOnQuestionId: null,
    dependsOnValue: "true",
  };
}

const QUESTION_TYPES: { value: RegistrationQuestionDraft["questionType"]; label: string }[] =
  [
    { value: "checkbox", label: "Checkbox (yes / no toggle)" },
    { value: "yes_no", label: "Yes / No" },
    { value: "text", label: "Short text" },
    { value: "number", label: "Number" },
  ];

const RULE_WHEN_OPTIONS: Record<
  RegistrationQuestionDraft["questionType"],
  { value: JoinApprovalConfig["rules"][0]["when"]; label: string }[]
> = {
  checkbox: [
    { value: "checked", label: "Is checked" },
    { value: "unchecked", label: "Is not checked" },
  ],
  yes_no: [
    { value: "yes", label: "Answer is Yes" },
    { value: "no", label: "Answer is No" },
  ],
  text: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Does not equal" },
  ],
  number: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Does not equal" },
  ],
};

export function RegistrationFormBuilder({
  initialQuestions,
  initialApprovalMode,
  initialApprovalConfig,
}: Props) {
  const [questions, setQuestions] = useState<RegistrationQuestionDraft[]>(
    initialQuestions.length > 0 ? initialQuestions : [],
  );
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>(initialApprovalMode);
  const [approvalConfig, setApprovalConfig] = useState<JoinApprovalConfig>(
    initialApprovalConfig ?? { rules: [], defaultOutcome: "accepted" },
  );

  const parentCandidates = useMemo(
    () =>
      questions.filter(
        (q) => q.questionType === "checkbox" || q.questionType === "yes_no",
      ),
    [questions],
  );

  const ruleQuestionCandidates = useMemo(
    () =>
      questions.filter(
        (q) =>
          q.questionType === "checkbox" ||
          q.questionType === "yes_no" ||
          q.questionType === "text" ||
          q.questionType === "number",
      ),
    [questions],
  );

  const selectedRuleQuestion = ruleQuestionCandidates.find(
    (q) => q.id === approvalConfig.rules[0]?.questionId,
  );

  function updateQuestion(id: string, patch: Partial<RegistrationQuestionDraft>) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => {
      const next = prev
        .filter((q) => q.id !== id)
        .map((q, i) => ({ ...q, sortOrder: i }));
      return next.map((q) =>
        q.dependsOnQuestionId === id
          ? { ...q, dependsOnQuestionId: null, dependsOnValue: null }
          : q,
      );
    });
    setApprovalConfig((c) => ({
      ...c,
      rules: c.rules.filter((r) => r.questionId !== id),
    }));
  }

  function moveQuestion(id: string, dir: -1 | 1) {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next.map((q, i) => ({ ...q, sortOrder: i }));
    });
  }

  function setPrimaryRule(questionId: string, when: JoinApprovalConfig["rules"][0]["when"], value?: string) {
    setApprovalConfig({
      ...approvalConfig,
      rules: [{ questionId, when, value, outcome: "pending" }],
    });
  }

  function invertPrimaryRuleOutcome() {
    const rule = approvalConfig.rules[0];
    if (!rule) return;
    setApprovalConfig({
      ...approvalConfig,
      rules: [
        {
          ...rule,
          outcome: rule.outcome === "pending" ? "accepted" : "pending",
        },
      ],
    });
  }

  const questionsJson = JSON.stringify(questions);
  const approvalConfigJson = JSON.stringify(approvalConfig);

  return (
    <section className="space-y-6" aria-labelledby="registration-heading">
      <div>
        <h2 id="registration-heading" className="text-lg font-medium text-zinc-900">
          Registration form
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Add questions participants answer when joining — like a short Google Form.
          You can show follow-up questions only when another answer is checked.
        </p>
      </div>

      <input type="hidden" name="registrationQuestionsJson" value={questionsJson} />
      <input type="hidden" name="joinApprovalMode" value={approvalMode} />
      <input type="hidden" name="joinApprovalConfigJson" value={approvalConfigJson} />

      <div className="space-y-4">
        {questions.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600">
            No registration questions yet. Add one to collect info (e.g. &quot;Coming with a
            car?&quot;) or leave empty for a simple sign-up button.
          </p>
        ) : null}

        {questions.map((q, index) => {
          const parents = parentCandidates.filter((p) => p.id !== q.id);
          const showDepends = parents.length > 0;

          return (
            <div
              key={q.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Question {index + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveQuestion(q.id, -1)}
                    className="rounded border border-zinc-200 px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === questions.length - 1}
                    onClick={() => moveQuestion(q.id, 1)}
                    className="rounded border border-zinc-200 px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-800 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass()}>Question label</label>
                  <input
                    value={q.label}
                    onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                    placeholder='e.g. "Are you coming with your own car?"'
                    className={`${inputClass()} mt-1`}
                    maxLength={500}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Answer type</label>
                  <select
                    value={q.questionType}
                    onChange={(e) =>
                      updateQuestion(q.id, {
                        questionType: e.target
                          .value as RegistrationQuestionDraft["questionType"],
                        dependsOnQuestionId: null,
                        dependsOnValue: null,
                      })
                    }
                    className={`${inputClass()} mt-1`}
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm text-zinc-800">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                      className="rounded border-zinc-300"
                    />
                    Required
                  </label>
                </div>
              </div>

              {showDepends ? (
                <div className="mt-4 rounded-md border border-zinc-100 bg-zinc-50 p-3">
                  <p className="text-xs font-medium text-zinc-700">Show this question only when</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <select
                      value={q.dependsOnQuestionId ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateQuestion(q.id, {
                          dependsOnQuestionId: v === "" ? null : v,
                          dependsOnValue: v === "" ? null : "true",
                        });
                      }}
                      className={inputClass()}
                    >
                      <option value="">Always show</option>
                      {parents.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label || "(untitled)"}
                        </option>
                      ))}
                    </select>
                    {q.dependsOnQuestionId ? (
                      <select
                        value={q.dependsOnValue ?? "true"}
                        onChange={(e) =>
                          updateQuestion(q.id, { dependsOnValue: e.target.value })
                        }
                        className={inputClass()}
                      >
                        {(() => {
                          const parent = parents.find((p) => p.id === q.dependsOnQuestionId);
                          if (parent?.questionType === "yes_no") {
                            return (
                              <>
                                <option value="yes">…is Yes</option>
                                <option value="no">…is No</option>
                              </>
                            );
                          }
                          return (
                            <>
                              <option value="true">…is checked</option>
                              <option value="false">…is not checked</option>
                            </>
                          );
                        })()}
                      </select>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setQuestions((prev) => [...prev, newQuestion(prev.length)])}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
      >
        + Add question
      </button>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="text-sm font-semibold text-zinc-900">Join approval</h3>
        <p className="mt-1 text-xs text-zinc-600">
          Control whether someone is signed up immediately or waits for coordinator approval.
        </p>

        <fieldset className="mt-4 space-y-2">
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="radio"
              name="approvalModeUi"
              checked={approvalMode === "auto"}
              onChange={() => setApprovalMode("auto")}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium text-zinc-900">Auto-accept</span>
              <span className="block text-zinc-600">
                Everyone who joins is confirmed (waitlist still applies if full).
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="radio"
              name="approvalModeUi"
              checked={approvalMode === "manual"}
              onChange={() => setApprovalMode("manual")}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium text-zinc-900">Always require approval</span>
              <span className="block text-zinc-600">
                Every registration stays pending until an admin accepts it.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="radio"
              name="approvalModeUi"
              checked={approvalMode === "conditional"}
              onChange={() => setApprovalMode("conditional")}
              disabled={ruleQuestionCandidates.length === 0}
              className="mt-0.5 disabled:opacity-50"
            />
            <span>
              <span className="font-medium text-zinc-900">Conditional approval</span>
              <span className="block text-zinc-600">
                Pending or auto-accept based on an answer (e.g. no car → pending).
              </span>
              {ruleQuestionCandidates.length === 0 ? (
                <span className="mt-1 block text-xs text-amber-800">
                  Add at least one question to use conditional approval.
                </span>
              ) : null}
            </span>
          </label>
        </fieldset>

        {approvalMode === "conditional" && ruleQuestionCandidates.length > 0 ? (
          <div className="mt-4 space-y-3 rounded-md border border-zinc-200 bg-white p-3">
            <p className="text-xs font-medium text-zinc-700">When this answer…</p>
            <select
              value={approvalConfig.rules[0]?.questionId ?? ""}
              onChange={(e) => {
                const q = ruleQuestionCandidates.find((x) => x.id === e.target.value);
                if (!q) return;
                const when = RULE_WHEN_OPTIONS[q.questionType][0]?.value ?? "checked";
                setPrimaryRule(q.id, when);
              }}
              className={inputClass()}
            >
              <option value="">Select question…</option>
              {ruleQuestionCandidates.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label || "(untitled)"}
                </option>
              ))}
            </select>

            {selectedRuleQuestion ? (
              <>
                <select
                  value={approvalConfig.rules[0]?.when ?? "checked"}
                  onChange={(e) => {
                    const rule = approvalConfig.rules[0];
                    if (!rule) return;
                    setPrimaryRule(
                      rule.questionId,
                      e.target.value as JoinApprovalConfig["rules"][0]["when"],
                      rule.value,
                    );
                  }}
                  className={inputClass()}
                >
                  {RULE_WHEN_OPTIONS[selectedRuleQuestion.questionType].map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                {approvalConfig.rules[0]?.when === "equals" ||
                approvalConfig.rules[0]?.when === "not_equals" ? (
                  <input
                    value={approvalConfig.rules[0]?.value ?? ""}
                    onChange={(e) => {
                      const rule = approvalConfig.rules[0];
                      if (!rule) return;
                      setPrimaryRule(rule.questionId, rule.when, e.target.value);
                    }}
                    placeholder="Value to match"
                    className={inputClass()}
                  />
                ) : null}

                <p className="text-sm text-zinc-800">
                  …then set status to{" "}
                  <strong>
                    {approvalConfig.rules[0]?.outcome === "pending" ? "Pending approval" : "Auto-accepted"}
                  </strong>
                  <button
                    type="button"
                    onClick={invertPrimaryRuleOutcome}
                    className="ml-2 text-xs font-medium text-zinc-600 underline hover:text-zinc-900"
                  >
                    (switch)
                  </button>
                </p>

                <div className="border-t border-zinc-100 pt-3">
                  <label className={labelClass()}>Everyone else</label>
                  <select
                    value={approvalConfig.defaultOutcome}
                    onChange={(e) =>
                      setApprovalConfig({
                        ...approvalConfig,
                        defaultOutcome: e.target.value as "pending" | "accepted",
                      })
                    }
                    className={`${inputClass()} mt-1`}
                  >
                    <option value="accepted">Auto-accept</option>
                    <option value="pending">Pending approval</option>
                  </select>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
