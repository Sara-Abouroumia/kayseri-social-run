import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  SITE_ABOUT_ROW_ID,
  type AboutBlock,
  siteAboutPage,
} from "@/db/schema/site-about";

import { safeParseAboutBlocks } from "./about-blocks";

export function getDefaultAboutBlocks(): AboutBlock[] {
  return [
    { type: "heading", level: 1, text: "Kayseri Social Run" },
    {
      type: "paragraph",
      text: "We are a social club in Kayseri. Explore our activities — runs, hikes, barbecues, and meetups — and connect with the community.",
    },
    { type: "divider" },
    { type: "heading", level: 2, text: "Join us" },
    {
      type: "paragraph",
      text: "Create an account to RSVP for events. Coordinators can share public links for each activity.",
    },
    { type: "button", label: "Log in", url: "/login", variant: "outline" },
    { type: "button", label: "Register", url: "/register", variant: "primary" },
  ];
}

export type SiteAboutPublished = {
  blocks: AboutBlock[];
  pageStyle: "default" | "warm" | "sky";
  publishedAt: Date | null;
};

export type SiteAboutDraft = {
  draftBlocks: AboutBlock[];
  publishedBlocks: AboutBlock[];
  draftPageStyle: "default" | "warm" | "sky";
  publishedPageStyle: "default" | "warm" | "sky";
  publishedAt: Date | null;
};

function normalizeStyle(s: string | null | undefined): "default" | "warm" | "sky" {
  if (s === "warm" || s === "sky") return s;
  return "default";
}

export async function ensureSiteAboutPageRow(): Promise<void> {
  const row = await db
    .select({ id: siteAboutPage.id })
    .from(siteAboutPage)
    .where(eq(siteAboutPage.id, SITE_ABOUT_ROW_ID))
    .limit(1);
  if (row.length > 0) return;

  const now = new Date();
  const blocks = getDefaultAboutBlocks();
  try {
    await db.insert(siteAboutPage).values({
      id: SITE_ABOUT_ROW_ID,
      draftBlocks: blocks,
      publishedBlocks: blocks,
      draftPageStyle: "default",
      publishedPageStyle: "default",
      updatedAt: now,
      publishedAt: now,
      draftUpdatedByUserId: null,
    });
  } catch {
    /* concurrent first insert */
  }
}

export async function getPublishedSiteAbout(): Promise<SiteAboutPublished> {
  await ensureSiteAboutPageRow();
  const rows = await db
    .select({
      publishedBlocks: siteAboutPage.publishedBlocks,
      publishedPageStyle: siteAboutPage.publishedPageStyle,
      publishedAt: siteAboutPage.publishedAt,
    })
    .from(siteAboutPage)
    .where(eq(siteAboutPage.id, SITE_ABOUT_ROW_ID))
    .limit(1);

  const raw = rows[0]?.publishedBlocks ?? [];
  const blocks = safeParseAboutBlocks(raw) ?? getDefaultAboutBlocks();

  return {
    blocks,
    pageStyle: normalizeStyle(rows[0]?.publishedPageStyle),
    publishedAt: rows[0]?.publishedAt ?? null,
  };
}

export async function getDraftSiteAbout(): Promise<SiteAboutDraft> {
  await ensureSiteAboutPageRow();
  const rows = await db
    .select({
      draftBlocks: siteAboutPage.draftBlocks,
      publishedBlocks: siteAboutPage.publishedBlocks,
      draftPageStyle: siteAboutPage.draftPageStyle,
      publishedPageStyle: siteAboutPage.publishedPageStyle,
      publishedAt: siteAboutPage.publishedAt,
    })
    .from(siteAboutPage)
    .where(eq(siteAboutPage.id, SITE_ABOUT_ROW_ID))
    .limit(1);

  const draftRaw = rows[0]?.draftBlocks ?? [];
  const pubRaw = rows[0]?.publishedBlocks ?? [];
  const draftBlocks = safeParseAboutBlocks(draftRaw) ?? getDefaultAboutBlocks();
  const publishedBlocks = safeParseAboutBlocks(pubRaw) ?? getDefaultAboutBlocks();

  return {
    draftBlocks,
    publishedBlocks,
    draftPageStyle: normalizeStyle(rows[0]?.draftPageStyle),
    publishedPageStyle: normalizeStyle(rows[0]?.publishedPageStyle),
    publishedAt: rows[0]?.publishedAt ?? null,
  };
}
