import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

/** Single row id — public landing & /about use `published_*`. */
export const SITE_ABOUT_ROW_ID = "default" as const;

export type AboutBlock =
  | { type: "heading"; text: string; level: 1 | 2 | 3 }
  | { type: "paragraph"; text: string }
  | { type: "image"; url: string; alt?: string }
  /** Full-width banner (max one per page). Image or muted looping video. */
  | {
      type: "hero";
      media: "image" | "video";
      url: string;
      alt?: string;
      posterUrl?: string;
    }
  /** Inline muted looping video (no audio). */
  | { type: "video"; url: string; posterUrl?: string }
  | { type: "button"; label: string; url: string; variant: "primary" | "outline" }
  | { type: "divider" };

export const siteAboutPage = pgTable("site_about_page", {
  id: text("id").primaryKey(),
  draftBlocks: jsonb("draft_blocks").$type<AboutBlock[]>().notNull(),
  publishedBlocks: jsonb("published_blocks").$type<AboutBlock[]>().notNull(),
  draftPageStyle: text("draft_page_style").notNull().default("default"),
  publishedPageStyle: text("published_page_style").notNull().default("default"),
  updatedAt: timestamp("updated_at").notNull(),
  publishedAt: timestamp("published_at"),
  draftUpdatedByUserId: text("draft_updated_by_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
});
