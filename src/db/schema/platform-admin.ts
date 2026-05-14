import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

/** Platform-wide admins (system settings, future moderation). */
export const platformAdmin = pgTable("platform_admin", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  grantedByUserId: text("granted_by_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
});
