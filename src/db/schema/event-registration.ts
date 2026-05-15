import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { events, eventParticipants } from "./events";

export const registrationQuestionType = pgEnum("registration_question_type", [
  "checkbox",
  "yes_no",
  "text",
  "number",
]);

export const eventRegistrationQuestions = pgTable("event_registration_questions", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  questionType: registrationQuestionType("question_type").notNull(),
  required: boolean("required").notNull().default(false),
  /** JSON array of strings for single-choice (future); unused for MVP types. */
  options: text("options"),
  sortOrder: integer("sort_order").notNull().default(0),
  /** Show this question only when the parent answer matches. */
  dependsOnQuestionId: text("depends_on_question_id"),
  dependsOnValue: text("depends_on_value"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const eventParticipantAnswers = pgTable(
  "event_participant_answers",
  {
    id: text("id").primaryKey(),
    participantId: text("participant_id")
      .notNull()
      .references(() => eventParticipants.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => eventRegistrationQuestions.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (t) => [
    uniqueIndex("event_participant_answers_participant_question_uidx").on(
      t.participantId,
      t.questionId,
    ),
  ],
);
