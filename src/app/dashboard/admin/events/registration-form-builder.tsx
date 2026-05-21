"use client";

import { useMemo, useState } from "react";

import type { JoinApprovalConfig } from "@/db/schema/events";
import type { Messages } from "@/i18n/messages/en";
import {
  defaultDependsOnValue,
  normalizeRegistrationQuestions,
  type RegistrationQuestionDraft,
} from "@/lib/event-registration";

type Copy = Messages["adminEventForm"];

function inputClass() {
  return "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";
}

function labelClass() {
  return "block text-sm font-medium text-zinc-800";
}

type ApprovalMode = "auto" | "manual" | "conditional";

type Props = {
  copy: Copy;
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

export function RegistrationFormBuilder({
  copy,
  initialQuestions,
  initialApprovalMode,
  initialApprovalConfig,
}: Props) {
  const questionTypes = useMemo(
    () =>
      [
        { value: "checkbox" as const, label: copy.questionTypeCheckbox },
        { value: "yes_no" as const, label: copy.questionTypeYesNo },
        { value: "text" as const, label: copy.questionTypeText },
        { value: "number" as const, label: copy.questionTypeNumber },
      ],
    [copy],
  );

  const ruleWhenOptions = useMemo(
    (): Record<
      RegistrationQuestionDraft["questionType"],
      { value: JoinApprovalConfig["rules"][0]["when"]; label: string }[]
    > => ({
      checkbox: [
        { value: "checked", label: copy.ruleWhenChecked },
        { value: "unchecked", label: copy.ruleWhenUnchecked },
      ],
      yes_no: [
        { value: "yes", label: copy.ruleWhenYes },
        { value: "no", label: copy.ruleWhenNo },
      ],
      text: [
        { value: "equals", label: copy.ruleWhenEquals },
        { value: "not_equals", label: copy.ruleWhenNotEquals },
      ],
      number: [
        { value: "equals", label: copy.ruleWhenEquals },
        { value: "not_equals", label: copy.ruleWhenNotEquals },
      ],
    }),
    [copy],
  );
  const [questions, setQuestions] = useState<RegistrationQuestionDraft[]>(() =>
    initialQuestions.length > 0
      ? normalizeRegistrationQuestions(initialQuestions)
      : [],
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
    setQuestions((prev) => {
      let next = prev.map((q) => (q.id === id ? { ...q, ...patch } : q));
      if (patch.questionType) {
        next = next.map((q) => {
          if (q.dependsOnQuestionId !== id) return q;
          const parent = next.find((p) => p.id === id);
          if (!parent) return q;
          return {
            ...q,
            dependsOnValue: defaultDependsOnValue(parent),
          };
        });
      }
      return normalizeRegistrationQuestions(next);
    });
  }

  function setDependsOnParent(questionId: string, parentId: string | null) {
    if (!parentId) {
      updateQuestion(questionId, {
        dependsOnQuestionId: null,
        dependsOnValue: null,
      });
      return;
    }
    const parent = questions.find((p) => p.id === parentId);
    if (!parent) return;
    updateQuestion(questionId, {
      dependsOnQuestionId: parentId,
      dependsOnValue: defaultDependsOnValue(parent),
    });
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
          {copy.registrationHeading}
        </h2>
        <p className="mt-1 text-sm text-zinc-600">{copy.registrationBlurb}</p>
      </div>

      <input type="hidden" name="registrationQuestionsJson" value={questionsJson} />
      <input type="hidden" name="joinApprovalMode" value={approvalMode} />
      <input type="hidden" name="joinApprovalConfigJson" value={approvalConfigJson} />

      <div className="space-y-4">
        {questions.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600">
            {copy.noQuestionsYet}
          </p>
        ) : null}

        {questions.map((q, index) => {
          const parents = parentCandidates.filter(
            (p) => p.id !== q.id && p.sortOrder < q.sortOrder,
          );
          const showDepends = parents.length > 0;

          return (
            <div
              key={q.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {copy.questionN.replace("{n}", String(index + 1))}
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
                    {copy.remove}
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass()}>{copy.questionLabel}</label>
                  <input
                    value={q.label}
                    onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                    placeholder={copy.questionLabelPlaceholder}
                    className={`${inputClass()} mt-1`}
                    maxLength={500}
                  />
                </div>
                <div>
                  <label className={labelClass()}>{copy.answerType}</label>
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
                    {questionTypes.map((t) => (
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
                    {copy.required}
                  </label>
                </div>
              </div>

              {showDepends ? (
                <div className="mt-4 rounded-md border border-zinc-100 bg-zinc-50 p-3">
                  <p className="text-xs font-medium text-zinc-700">{copy.showOnlyWhen}</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <select
                      value={q.dependsOnQuestionId ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDependsOnParent(q.id, v === "" ? null : v);
                      }}
                      className={inputClass()}
                    >
                      <option value="">{copy.alwaysShow}</option>
                      {parents.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label || copy.untitled}
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
                                <option value="yes">{copy.dependsYes}</option>
                                <option value="no">{copy.dependsNo}</option>
                              </>
                            );
                          }
                          return (
                            <>
                              <option value="true">{copy.dependsChecked}</option>
                              <option value="false">{copy.dependsUnchecked}</option>
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
        {copy.addQuestion}
      </button>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="text-sm font-semibold text-zinc-900">{copy.joinApproval}</h3>
        <p className="mt-1 text-xs text-zinc-600">{copy.joinApprovalBlurb}</p>

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
              <span className="font-medium text-zinc-900">{copy.approvalAuto}</span>
              <span className="block text-zinc-600">{copy.approvalAutoHint}</span>
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
              <span className="font-medium text-zinc-900">{copy.approvalManual}</span>
              <span className="block text-zinc-600">{copy.approvalManualHint}</span>
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
              <span className="font-medium text-zinc-900">{copy.approvalConditional}</span>
              <span className="block text-zinc-600">{copy.approvalConditionalHint}</span>
              {ruleQuestionCandidates.length === 0 ? (
                <span className="mt-1 block text-xs text-amber-800">
                  {copy.approvalConditionalNeedQuestion}
                </span>
              ) : null}
            </span>
          </label>
        </fieldset>

        {approvalMode === "conditional" && ruleQuestionCandidates.length > 0 ? (
          <div className="mt-4 space-y-3 rounded-md border border-zinc-200 bg-white p-3">
            <p className="text-xs font-medium text-zinc-700">{copy.whenAnswer}</p>
            <select
              value={approvalConfig.rules[0]?.questionId ?? ""}
              onChange={(e) => {
                const q = ruleQuestionCandidates.find((x) => x.id === e.target.value);
                if (!q) return;
                const when = ruleWhenOptions[q.questionType][0]?.value ?? "checked";
                setPrimaryRule(q.id, when);
              }}
              className={inputClass()}
            >
              <option value="">{copy.selectQuestion}</option>
              {ruleQuestionCandidates.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label || copy.untitled}
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
                  {ruleWhenOptions[selectedRuleQuestion.questionType].map((o) => (
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
                    placeholder={copy.valueToMatch}
                    className={inputClass()}
                  />
                ) : null}

                <p className="text-sm text-zinc-800">
                  {copy.thenStatus}{" "}
                  <strong>
                    {approvalConfig.rules[0]?.outcome === "pending"
                      ? copy.statusPending
                      : copy.statusAutoAccepted}
                  </strong>
                  <button
                    type="button"
                    onClick={invertPrimaryRuleOutcome}
                    className="ml-2 text-xs font-medium text-zinc-600 underline hover:text-zinc-900"
                  >
                    {copy.switchOutcome}
                  </button>
                </p>

                <div className="border-t border-zinc-100 pt-3">
                  <label className={labelClass()}>{copy.everyoneElse}</label>
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
                    <option value="accepted">{copy.defaultAutoAccept}</option>
                    <option value="pending">{copy.defaultPending}</option>
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
