import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

/** Anonymous or signed-in page views for developer traffic analytics. */
export const usagePageViews = pgTable("usage_page_views", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  /** Stable cookie id before/without login. */
  visitorId: text("visitor_id").notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  pathname: text("pathname").notNull(),
  referrer: text("referrer"),
  /** Time spent on the previous page before this navigation (ms). */
  durationMs: integer("duration_ms"),
  ipAddress: text("ip_address"),
  country: text("country"),
  region: text("region"),
  city: text("city"),
  userAgent: text("user_agent"),
});
