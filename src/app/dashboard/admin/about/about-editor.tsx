"use client";

import { useActionState, useState } from "react";

import type { AboutBlock } from "@/db/schema/site-about";
import type { Messages } from "@/i18n/messages/en";

import { publishAboutAction, saveAboutDraftAction } from "./about-actions";

type PageStyle = "default" | "warm" | "sky";

type Props = {
  initialDraftBlocks: AboutBlock[];
  initialDraftStyle: PageStyle;
  publishedBlocks: AboutBlock[];
  publishedStyle: PageStyle;
  publishedAt: Date | null;
  copy: Messages["aboutEditor"];
};

function labelCls() {
  return "block text-xs font-medium text-zinc-600";
}

function inputCls() {
  return "mt-1 w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";
}

export function AboutPageEditor({
  initialDraftBlocks,
  initialDraftStyle,
  publishedBlocks,
  publishedStyle,
  publishedAt,
  copy,
}: Props) {
  const [blocks, setBlocks] = useState<AboutBlock[]>(initialDraftBlocks);
  const [style, setStyle] = useState<PageStyle>(initialDraftStyle);
  const [uploadIdx, setUploadIdx] = useState<number | null>(null);

  const [saveState, saveAction, savePending] = useActionState(saveAboutDraftAction, {});
  const [pubState, pubAction, pubPending] = useActionState(publishAboutAction, {});

  function patchBlock(index: number, next: AboutBlock) {
    setBlocks((prev) => {
      const n = [...prev];
      n[index] = next;
      return n;
    });
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const n = [...prev];
      [n[index], n[j]] = [n[j], n[index]];
      return n;
    });
  }

  function addBlock(b: AboutBlock) {
    setBlocks((prev) => [...prev, b]);
  }

  async function uploadMedia(index: number, file: File, mode: "image" | "video" | "poster") {
    setUploadIdx(index);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const endpoint = mode === "video" ? "/api/admin/about-media" : "/api/admin/event-image";
      const res = await fetch(endpoint, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) return;
      const cur = blocks[index];
      if (!cur) return;
      if (mode === "poster") {
        if (cur.type === "video") {
          patchBlock(index, { ...cur, posterUrl: data.url });
        } else if (cur.type === "hero" && cur.media === "video") {
          patchBlock(index, { ...cur, posterUrl: data.url });
        }
        return;
      }
      if (mode === "image" && cur.type === "image") {
        patchBlock(index, { ...cur, url: data.url });
      } else if (mode === "image" && cur.type === "hero" && cur.media === "image") {
        patchBlock(index, { ...cur, url: data.url });
      } else if (mode === "video" && cur.type === "hero" && cur.media === "video") {
        patchBlock(index, { ...cur, url: data.url });
      } else if (mode === "video" && cur.type === "video") {
        patchBlock(index, { ...cur, url: data.url });
      }
    } finally {
      setUploadIdx(null);
    }
  }

  const saveMsg = saveState?.message;
  const pubMsg = pubState?.message;
  const hasHero = blocks.some((b) => b.type === "hero");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{copy.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">{copy.blurb}</p>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4">
        <h2 className="text-sm font-medium text-zinc-900">{copy.previewLabel}</h2>
        <p className="mt-1 text-xs text-zinc-600">
          {copy.lastPublished}:{" "}
          {publishedAt
            ? new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(publishedAt))
            : copy.neverPublished}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          {publishedStyle} · {publishedBlocks.length} blocks
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={hasHero}
            title={hasHero ? copy.heroAlreadyAdded : undefined}
            className="rounded-md border border-violet-300 bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-900 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() =>
              addBlock({
                type: "hero",
                media: "image",
                url: "https://",
                alt: "",
              })
            }
          >
            + {copy.addHero}
          </button>
          <button
            type="button"
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            onClick={() =>
              addBlock({ type: "heading", level: 2, text: copy.blockDefaultHeading })
            }
          >
            + {copy.addHeading}
          </button>
          <button
            type="button"
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            onClick={() =>
              addBlock({
                type: "paragraph",
                text: copy.blockDefaultParagraph,
              })
            }
          >
            + {copy.addParagraph}
          </button>
          <button
            type="button"
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            onClick={() =>
              addBlock({
                type: "image",
                url: "https://",
                alt: "",
              })
            }
          >
            + {copy.addImage}
          </button>
          <button
            type="button"
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            onClick={() =>
              addBlock({
                type: "video",
                url: "https://",
              })
            }
          >
            + {copy.addVideo}
          </button>
          <button
            type="button"
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            onClick={() =>
              addBlock({
                type: "button",
                label: copy.blockDefaultButtonLabel,
                url: "/login",
                variant: "primary",
              })
            }
          >
            + {copy.addButton}
          </button>
          <button
            type="button"
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            onClick={() => addBlock({ type: "divider" })}
          >
            + {copy.addDivider}
          </button>
        </div>
        <p className="text-xs text-amber-900/80">{copy.heroSingleHint}</p>
        <p className="text-xs text-zinc-500">{copy.videoMutedHint}</p>

        <div>
          <label className={labelCls()} htmlFor="draftPageStyle">
            {copy.pageStyle}
          </label>
          <select
            id="draftPageStyle"
            name="draftPageStyle"
            value={style}
            onChange={(e) => setStyle(e.target.value as PageStyle)}
            className={`${inputCls()} max-w-xs`}
          >
            <option value="default">{copy.styleDefault}</option>
            <option value="warm">{copy.styleWarm}</option>
            <option value="sky">{copy.styleSky}</option>
          </select>
        </div>

        <ul className="space-y-4">
          {blocks.map((block, index) => (
            <li
              key={`${index}-${block.type}`}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {block.type}
                </span>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    className="rounded border border-zinc-200 px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-50"
                    onClick={() => moveBlock(index, -1)}
                  >
                    {copy.moveUp}
                  </button>
                  <button
                    type="button"
                    className="rounded border border-zinc-200 px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-50"
                    onClick={() => moveBlock(index, 1)}
                  >
                    {copy.moveDown}
                  </button>
                  <button
                    type="button"
                    className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-800 hover:bg-red-50"
                    onClick={() => removeBlock(index)}
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-3">
                {block.type === "heading" ? (
                  <>
                    <div>
                      <label className={labelCls()}>{copy.headingText}</label>
                      <input
                        className={inputCls()}
                        value={block.text}
                        onChange={(e) =>
                          patchBlock(index, { ...block, text: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls()}>{copy.headingLevel}</label>
                      <select
                        className={inputCls()}
                        value={block.level}
                        onChange={(e) =>
                          patchBlock(index, {
                            ...block,
                            level: Number(e.target.value) as 1 | 2 | 3,
                          })
                        }
                      >
                        <option value={1}>{copy.level1}</option>
                        <option value={2}>{copy.level2}</option>
                        <option value={3}>{copy.level3}</option>
                      </select>
                    </div>
                  </>
                ) : null}

                {block.type === "paragraph" ? (
                  <div>
                    <label className={labelCls()}>{copy.paragraphText}</label>
                    <textarea
                      className={`${inputCls()} min-h-[5rem]`}
                      value={block.text}
                      onChange={(e) =>
                        patchBlock(index, { ...block, text: e.target.value })
                      }
                    />
                    <p className="mt-1 text-xs text-zinc-500">{copy.paragraphLinkHint}</p>
                  </div>
                ) : null}

                {block.type === "image" ? (
                  <>
                    <div>
                      <label className={labelCls()}>{copy.imageUrl}</label>
                      <input
                        className={inputCls()}
                        value={block.url}
                        onChange={(e) =>
                          patchBlock(index, { ...block, url: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls()}>{copy.imageAlt}</label>
                      <input
                        className={inputCls()}
                        value={block.alt ?? ""}
                        onChange={(e) =>
                          patchBlock(index, { ...block, alt: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        id={`about-up-img-${index}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void uploadMedia(index, f, "image");
                        }}
                      />
                      <label
                        htmlFor={`about-up-img-${index}`}
                        className={`inline-flex cursor-pointer rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 ${uploadIdx === index ? "pointer-events-none opacity-50" : ""}`}
                      >
                        {uploadIdx === index ? copy.uploading : copy.uploadImage}
                      </label>
                    </div>
                  </>
                ) : null}

                {block.type === "hero" ? (
                  <>
                    <div>
                      <label className={labelCls()}>{copy.heroMediaKind}</label>
                      <select
                        className={inputCls()}
                        value={block.media}
                        onChange={(e) => {
                          const media = e.target.value as "image" | "video";
                          patchBlock(index, {
                            type: "hero",
                            media,
                            url: "https://",
                            alt: "",
                            posterUrl: "",
                          });
                        }}
                      >
                        <option value="image">{copy.heroAsImage}</option>
                        <option value="video">{copy.heroAsVideo}</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls()}>{copy.heroMainUrl}</label>
                      <input
                        className={inputCls()}
                        value={block.url}
                        onChange={(e) =>
                          patchBlock(index, { ...block, url: e.target.value })
                        }
                      />
                    </div>
                    {block.media === "image" ? (
                      <>
                        <div>
                          <label className={labelCls()}>{copy.imageAlt}</label>
                          <input
                            className={inputCls()}
                            value={block.alt ?? ""}
                            onChange={(e) =>
                              patchBlock(index, { ...block, alt: e.target.value })
                            }
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            id={`about-hero-img-${index}`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              e.target.value = "";
                              if (f) void uploadMedia(index, f, "image");
                            }}
                          />
                          <label
                            htmlFor={`about-hero-img-${index}`}
                            className={`inline-flex cursor-pointer rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 ${uploadIdx === index ? "pointer-events-none opacity-50" : ""}`}
                          >
                            {uploadIdx === index ? copy.uploading : copy.uploadImage}
                          </label>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className={labelCls()}>{copy.videoPosterUrl}</label>
                          <input
                            className={inputCls()}
                            value={block.posterUrl ?? ""}
                            onChange={(e) =>
                              patchBlock(index, { ...block, posterUrl: e.target.value })
                            }
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            id={`about-hero-vid-${index}`}
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              e.target.value = "";
                              if (f) void uploadMedia(index, f, "video");
                            }}
                          />
                          <label
                            htmlFor={`about-hero-vid-${index}`}
                            className={`inline-flex cursor-pointer rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 ${uploadIdx === index ? "pointer-events-none opacity-50" : ""}`}
                          >
                            {uploadIdx === index ? copy.uploading : copy.uploadVideo}
                          </label>
                          <input
                            id={`about-hero-poster-${index}`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              e.target.value = "";
                              if (f) void uploadMedia(index, f, "poster");
                            }}
                          />
                          <label
                            htmlFor={`about-hero-poster-${index}`}
                            className={`inline-flex cursor-pointer rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 ${uploadIdx === index ? "pointer-events-none opacity-50" : ""}`}
                          >
                            {copy.uploadPoster}
                          </label>
                        </div>
                      </>
                    )}
                  </>
                ) : null}

                {block.type === "video" ? (
                  <>
                    <div>
                      <label className={labelCls()}>{copy.videoUrl}</label>
                      <input
                        className={inputCls()}
                        value={block.url}
                        onChange={(e) =>
                          patchBlock(index, { ...block, url: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls()}>{copy.videoPosterUrl}</label>
                      <input
                        className={inputCls()}
                        value={block.posterUrl ?? ""}
                        onChange={(e) =>
                          patchBlock(index, { ...block, posterUrl: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        id={`about-vid-${index}`}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void uploadMedia(index, f, "video");
                        }}
                      />
                      <label
                        htmlFor={`about-vid-${index}`}
                        className={`inline-flex cursor-pointer rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 ${uploadIdx === index ? "pointer-events-none opacity-50" : ""}`}
                      >
                        {uploadIdx === index ? copy.uploading : copy.uploadVideo}
                      </label>
                      <input
                        id={`about-vid-poster-${index}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void uploadMedia(index, f, "poster");
                        }}
                      />
                      <label
                        htmlFor={`about-vid-poster-${index}`}
                        className={`inline-flex cursor-pointer rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 ${uploadIdx === index ? "pointer-events-none opacity-50" : ""}`}
                      >
                        {copy.uploadPoster}
                      </label>
                    </div>
                  </>
                ) : null}

                {block.type === "button" ? (
                  <>
                    <div>
                      <label className={labelCls()}>{copy.buttonLabel}</label>
                      <input
                        className={inputCls()}
                        value={block.label}
                        onChange={(e) =>
                          patchBlock(index, { ...block, label: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls()}>{copy.buttonUrl}</label>
                      <input
                        className={inputCls()}
                        value={block.url}
                        onChange={(e) =>
                          patchBlock(index, { ...block, url: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls()}>{copy.buttonVariant}</label>
                      <select
                        className={inputCls()}
                        value={block.variant}
                        onChange={(e) =>
                          patchBlock(index, {
                            ...block,
                            variant: e.target.value as "primary" | "outline",
                          })
                        }
                      >
                        <option value="primary">{copy.variantPrimary}</option>
                        <option value="outline">{copy.variantOutline}</option>
                      </select>
                    </div>
                  </>
                ) : null}

                {block.type === "divider" ? (
                  <p className="text-xs text-zinc-500">{copy.dividerHint}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <form action={saveAction} className="inline">
          <input type="hidden" name="draftJson" value={JSON.stringify(blocks)} readOnly />
          <input type="hidden" name="draftPageStyle" value={style} readOnly />
          <button
            type="submit"
            disabled={savePending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {savePending ? "…" : copy.saveDraft}
          </button>
        </form>
        <form action={pubAction} className="inline">
          <button
            type="submit"
            disabled={pubPending}
            className="rounded-md border border-emerald-700 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
          >
            {pubPending ? "…" : copy.publish}
          </button>
        </form>
      </div>

      {saveMsg ? (
        <p
          className={`text-sm ${saveState?.ok ? "text-emerald-800" : "text-red-800"}`}
          role="status"
        >
          {saveMsg}
        </p>
      ) : null}
      {pubMsg ? (
        <p
          className={`text-sm ${pubState?.ok ? "text-emerald-800" : "text-red-800"}`}
          role="status"
        >
          {pubMsg}
        </p>
      ) : null}
    </div>
  );
}
