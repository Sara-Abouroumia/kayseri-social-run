"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { SITE_ABOUT_ROW_ID, siteAboutPage, type AboutBlock } from "@/db/schema/site-about";
import {
  aboutBlocksArraySchema,
  aboutPageStyleSchema,
  parseAboutBlocksJson,
  safeParseAboutBlocks,
} from "@/lib/about-blocks";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin-session";
import { ensureSiteAboutPageRow } from "@/lib/site-about";

function stripEmptyParagraphs(blocks: AboutBlock[]): AboutBlock[] {
  return blocks.filter((b) => !(b.type === "paragraph" && !b.text.trim()));
}

export async function saveAboutDraftAction(
  _prev: { message?: string; ok?: boolean } | undefined,
  formData: FormData,
): Promise<{ message?: string; ok?: boolean }> {
  void _prev;
  const gate = await requirePlatformAdminSession();
  if (!gate.ok) {
    return {
      message:
        gate.message === "Unauthorized"
          ? "You must be signed in."
          : "You do not have permission to edit Kayseri Social Run.",
      ok: false,
    };
  }

  const rawJson = z.string().safeParse(formData.get("draftJson"));
  if (!rawJson.success) {
    return { message: "Missing page data.", ok: false };
  }
  const blocks = parseAboutBlocksJson(rawJson.data);
  if (!blocks) {
    return { message: "Could not read blocks. Check JSON and try again.", ok: false };
  }

  const cleaned = stripEmptyParagraphs(blocks);
  const checked = aboutBlocksArraySchema.safeParse(cleaned);
  if (!checked.success) {
    return {
      message: checked.error.issues[0]?.message ?? "Invalid blocks.",
      ok: false,
    };
  }

  const styleRaw = z.string().safeParse(formData.get("draftPageStyle"));
  const styleParsed = aboutPageStyleSchema.safeParse(styleRaw.success ? styleRaw.data : "default");
  const draftPageStyle = styleParsed.success ? styleParsed.data : "default";

  await ensureSiteAboutPageRow();
  const now = new Date();
  await db
    .update(siteAboutPage)
    .set({
      draftBlocks: checked.data,
      draftPageStyle,
      updatedAt: now,
      draftUpdatedByUserId: gate.session.user.id,
    })
    .where(eq(siteAboutPage.id, SITE_ABOUT_ROW_ID));

  revalidatePath("/");
  revalidatePath("/dashboard/admin/about");
  return { ok: true, message: "Draft saved." };
}

export async function publishAboutAction(
  _prev: { message?: string; ok?: boolean } | undefined,
  _formData: FormData,
): Promise<{ message?: string; ok?: boolean }> {
  void _prev;
  void _formData;
  const gate = await requirePlatformAdminSession();
  if (!gate.ok) {
    return {
      message:
        gate.message === "Unauthorized"
          ? "You must be signed in."
          : "You do not have permission to publish Kayseri Social Run.",
      ok: false,
    };
  }

  await ensureSiteAboutPageRow();
  const row = await db
    .select({
      draftBlocks: siteAboutPage.draftBlocks,
      draftPageStyle: siteAboutPage.draftPageStyle,
    })
    .from(siteAboutPage)
    .where(eq(siteAboutPage.id, SITE_ABOUT_ROW_ID))
    .limit(1);
  const draftBlocks = safeParseAboutBlocks(row[0]?.draftBlocks) ?? [];
  const cleaned = stripEmptyParagraphs(draftBlocks);
  const checked = aboutBlocksArraySchema.safeParse(cleaned);
  if (!checked.success) {
    return {
      message:
        "Draft is not valid to publish. Fix errors or save a valid draft first.",
      ok: false,
    };
  }

  const style = aboutPageStyleSchema.safeParse(row[0]?.draftPageStyle).success
    ? aboutPageStyleSchema.parse(row[0]?.draftPageStyle)
    : "default";

  const now = new Date();
  await db
    .update(siteAboutPage)
    .set({
      publishedBlocks: checked.data,
      publishedPageStyle: style,
      publishedAt: now,
      updatedAt: now,
    })
    .where(eq(siteAboutPage.id, SITE_ABOUT_ROW_ID));

  revalidatePath("/");
  revalidatePath("/dashboard/admin/about");
  return { ok: true, message: "Published. Visitors now see this version on the home page." };
}
