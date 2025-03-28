import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
});

export type TaskFormValues = z.infer<typeof taskSchema>;
