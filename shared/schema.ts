import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  score: integer("score").default(0).notNull(),
  level: text("level").default("Bronze").notNull(),
  region: text("region").default("Global"),
  country: text("country").default("Global"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  score: true,
  level: true,
  region: true,
  country: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  points: integer("points").notNull().default(10),
  requirement: integer("requirement").notNull(),  // Number required to earn (e.g., 5 tasks completed)
  category: text("category").notNull(), // completion, streak, priority, etc.
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  name: true,
  description: true,
  icon: true,
  points: true,
  requirement: true,
  category: true,
});

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementId: true,
});

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  timeframe: text("timeframe").notNull(), // short-term, medium-term, long-term
  progress: integer("progress").default(0).notNull(),
  roadmap: jsonb("roadmap"), // Stores AI-generated roadmap
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  title: true,
  description: true,
  category: true,
  timeframe: true,
  roadmap: true,
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export const goalTaskMappings = pgTable("goal_task_mappings", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").references(() => goals.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGoalTaskMappingSchema = createInsertSchema(goalTaskMappings).pick({
  goalId: true,
  taskId: true,
});

export type InsertGoalTaskMapping = z.infer<typeof insertGoalTaskMappingSchema>;
export type GoalTaskMapping = typeof goalTaskMappings.$inferSelect;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true,
  userId: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("incomplete"),
  categoryId: integer("category_id").references(() => categories.id),
  userId: integer("user_id").references(() => users.id),
  hasReminder: boolean("has_reminder").default(false),
  reminderTime: integer("reminder_time"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  points: integer("points").default(10).notNull(), // Points awarded for completion
  difficulty: text("difficulty").default("normal"), // easy, normal, hard
  isGoalTask: boolean("is_goal_task").default(false), // if part of a goal roadmap
  goalId: integer("goal_id").references(() => goals.id),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  dueDate: true,
  priority: true,
  status: true,
  categoryId: true,
  userId: true,
  hasReminder: true,
  reminderTime: true,
  completed: true,
  completedAt: true,
  points: true,
  difficulty: true,
  isGoalTask: true,
  goalId: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const taskSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  dueTime: z.string().optional().nullable(),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["complete", "incomplete"]).default("incomplete"),
  categoryId: z.number().optional().nullable(),
  hasReminder: z.boolean().default(false),
  reminderTime: z.number().optional().nullable(),
  points: z.number().optional(),
  difficulty: z.enum(["easy", "normal", "hard"]).optional(),
  isGoalTask: z.boolean().optional(),
  goalId: z.number().optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export const goalSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, { message: "Goal title is required" }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }),
  timeframe: z.enum(["short-term", "medium-term", "long-term"]),
  roadmap: z.any().optional(),
});

export type GoalFormValues = z.infer<typeof goalSchema>;

export const leaderboardEntrySchema = z.object({
  userId: z.number(),
  username: z.string(),
  score: z.number(),
  level: z.string(),
  region: z.string().optional(),
  country: z.string().optional(),
  rank: z.number(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
