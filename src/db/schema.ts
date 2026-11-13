import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const quizzes = sqliteTable("quizzes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  prompt: text("prompt").notNull(),
  image: text("image"),
  options: text("options", { mode: "json" }).$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation").notNull().default(""),
});

export const attempts = sqliteTable("attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Each answer keeps a snapshot of the question as it was when answered,
// so editing a quiz later never rewrites the history of past attempts.
export const answers = sqliteTable("answers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  attemptId: integer("attempt_id")
    .notNull()
    .references(() => attempts.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  prompt: text("prompt").notNull(),
  image: text("image"),
  options: text("options", { mode: "json" }).$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
  selectedIndex: integer("selected_index"),
  explanation: text("explanation").notNull().default(""),
});

export type Quiz = typeof quizzes.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type Answer = typeof answers.$inferSelect;
