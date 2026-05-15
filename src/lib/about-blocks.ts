import { z } from "zod";

import type { AboutBlock } from "@/db/schema/site-about";

const headingBlock = z.object({
  type: z.literal("heading"),
  text: z.string().trim().min(1).max(200),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

const paragraphBlock = z.object({
  type: z.literal("paragraph"),
  text: z.string().trim().min(1).max(12_000),
});

const imageBlock = z.object({
  type: z.literal("image"),
  url: z
    .string()
    .trim()
    .min(1)
    .max(2_500_000)
    .refine(
      (u) =>
        /^https?:\/\//i.test(u) || /^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(u),
      "Image URL must be https or a small embedded image.",
    ),
  alt: z.string().trim().max(300).optional(),
});

const buttonBlock = z.object({
  type: z.literal("button"),
  label: z.string().trim().min(1).max(120),
  url: z
    .string()
    .trim()
    .min(1)
    .max(2000)
    .refine((u) => /^https?:\/\//i.test(u) || u.startsWith("/"), "Button link must be https or a site path."),
  variant: z.enum(["primary", "outline"]),
});

const dividerBlock = z.object({
  type: z.literal("divider"),
});

function isPosterOk(p: string): boolean {
  const t = p.trim();
  return (
    /^https?:\/\//i.test(t) || /^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(t)
  );
}

const heroBlock = z
  .object({
    type: z.literal("hero"),
    media: z.enum(["image", "video"]),
    url: z.string().trim().min(1).max(2_500_000),
    alt: z.string().trim().max(300).optional(),
    posterUrl: z.string().trim().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.media === "image") {
      const ok =
        /^https?:\/\//i.test(data.url) ||
        /^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(data.url);
      if (!ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Hero image URL must be https or a small embedded image.",
          path: ["url"],
        });
      }
    } else if (!/^https?:\/\//i.test(data.url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hero video URL must be https (MP4 or WebM link, or upload with Blob).",
        path: ["url"],
      });
    }
    if (data.posterUrl?.trim() && !isPosterOk(data.posterUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Poster must be an https image or small embedded image.",
        path: ["posterUrl"],
      });
    }
  });

const videoBlock = z
  .object({
    type: z.literal("video"),
    url: z.string().trim().min(1).max(2000),
    posterUrl: z.string().trim().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (!/^https?:\/\//i.test(data.url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Video URL must be https (direct .mp4 / .webm file).",
        path: ["url"],
      });
    }
    if (data.posterUrl?.trim() && !isPosterOk(data.posterUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Poster must be an https image or small embedded image.",
        path: ["posterUrl"],
      });
    }
  });

export const aboutBlockSchema = z.discriminatedUnion("type", [
  headingBlock,
  paragraphBlock,
  imageBlock,
  heroBlock,
  videoBlock,
  buttonBlock,
  dividerBlock,
]);

export const aboutBlocksArraySchema = z
  .array(aboutBlockSchema)
  .max(56)
  .superRefine((blocks, ctx) => {
    let heroCount = 0;
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i]?.type === "hero") {
        heroCount += 1;
        if (heroCount > 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Only one main hero is allowed — remove extra hero blocks.",
            path: [i, "type"],
          });
        }
      }
    }
  });

export const aboutPageStyleSchema = z.enum(["default", "warm", "sky"]);

export function parseAboutBlocksJson(raw: unknown): AboutBlock[] | null {
  if (typeof raw !== "string") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  const r = aboutBlocksArraySchema.safeParse(parsed);
  return r.success ? (r.data as AboutBlock[]) : null;
}

export function safeParseAboutBlocks(data: unknown): AboutBlock[] | null {
  if (!Array.isArray(data)) return null;
  const r = aboutBlocksArraySchema.safeParse(data);
  return r.success ? (r.data as AboutBlock[]) : null;
}
