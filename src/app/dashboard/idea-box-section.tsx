"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { SuccessToast } from "@/components/success-toast";
import type { IdeaBoxCopy } from "@/i18n/messages/idea-box";
import type { Locale } from "@/i18n/config";

import { IdeaBoxVault, type MyCommunityIdea } from "./idea-box-vault";
import { submitCommunityIdeaAction, type IdeaBoxActionState } from "./idea-box-actions";

type Props = {
  copy: IdeaBoxCopy;
  ideas: MyCommunityIdea[];
  locale: Locale;
};

function statusClass(ok: boolean | undefined) {
  return ok
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-red-200 bg-red-50 text-red-800";
}

export function IdeaBoxSection({ copy, ideas, locale }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    submitCommunityIdeaAction,
    undefined as IdeaBoxActionState | undefined,
  );

  useEffect(() => {
    if (!state?.ok) return;

    setOpen(false);
    formRef.current?.reset();
    setShowSuccessToast(true);
    router.refresh();

    const resetTimer = window.setTimeout(() => setShowSuccessToast(false), 5000);
    return () => window.clearTimeout(resetTimer);
  }, [state, router]);

  return (
    <>
      <SuccessToast
        message={state?.message ?? copy.submitSuccess}
        show={showSuccessToast}
      />

      <section
        className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
        aria-labelledby="idea-box-heading"
      >
        <h2
          id="idea-box-heading"
          className="text-lg font-semibold tracking-tight text-zinc-900"
        >
          {copy.sectionHeading}
        </h2>

        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-zinc-600">{copy.sectionBlurb}</p>

            {!open ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-4 inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
              >
                {copy.shareOpinion}
              </button>
            ) : null}
          </div>

          <IdeaBoxVault
            ideas={ideas}
            copy={copy}
            locale={locale}
            className="mx-auto sm:mx-0 sm:pt-1"
          />
        </div>

        {open ? (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50/80 p-5">
            <h3 className="text-base font-semibold text-zinc-900">{copy.formHeading}</h3>
            <p className="mt-2 text-sm text-zinc-600">{copy.formIntro}</p>

            {state?.message && !state.ok ? (
              <p
                className={`mt-4 rounded-md border px-3 py-2 text-sm ${statusClass(state.ok)}`}
                role="alert"
              >
                {state.message}
              </p>
            ) : null}

            <form ref={formRef} action={action} className="mt-4 space-y-4">
              <div>
                <label htmlFor="idea-title" className="mb-1 block text-sm font-medium text-zinc-800">
                  {copy.titleLabel}
                </label>
                <input
                  id="idea-title"
                  name="title"
                  type="text"
                  required
                  maxLength={200}
                  placeholder={copy.titlePlaceholder}
                  disabled={pending}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                />
              </div>
              <div>
                <label htmlFor="idea-detail" className="mb-1 block text-sm font-medium text-zinc-800">
                  {copy.detailLabel}
                </label>
                <textarea
                  id="idea-detail"
                  name="detail"
                  required
                  rows={5}
                  maxLength={5000}
                  placeholder={copy.detailPlaceholder}
                  disabled={pending}
                  className="w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                >
                  {pending ? copy.sending : copy.submit}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
                >
                  {copy.cancel}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </section>
    </>
  );
}
