import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { communityIdea } from "./community-ideas";

/** Per-admin read state for community ideas (unread badge). */
export const communityIdeaRead = pgTable(
  "community_idea_read",
  {
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ideaId: text("idea_id")
      .notNull()
      .references(() => communityIdea.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.adminUserId, t.ideaId] })],
);
