import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

/** Community suggestions submitted by members for platform admins. */
export const communityIdea = pgTable("community_idea", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at").notNull(),
});
