import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

/** Pending platform-admin invite before the user registers. */
export const platformAdminInvite = pgTable("platform_admin_invite", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  tokenHash: text("token_hash").notNull().unique(),
  invitedByUserId: text("invited_by_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
});
