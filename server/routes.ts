import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTaskSchema, taskSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all tasks
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get task by ID
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const task = await storage.getTaskById(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  // Create new task
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const validatedData = taskSchema.parse(req.body);
      
      // Process due date and time
      let dueDate = null;
      if (validatedData.dueDate) {
        dueDate = new Date(validatedData.dueDate);
        if (validatedData.dueTime) {
          const [hours, minutes] = validatedData.dueTime.split(":");
          dueDate.setHours(parseInt(hours), parseInt(minutes));
        }
      }
      
      const taskData = {
        title: validatedData.title,
        description: validatedData.description || "",
        dueDate: dueDate,
        priority: validatedData.priority,
        status: validatedData.status,
        categoryId: validatedData.categoryId || null,
        userId: null, // We're not handling authentication in this demo
        hasReminder: validatedData.hasReminder,
        reminderTime: validatedData.reminderTime,
      };

      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update task
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const task = await storage.getTaskById(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const validatedData = taskSchema.partial().parse(req.body);
      
      // Process due date and time
      let dueDate = undefined;
      if (validatedData.dueDate !== undefined) {
        if (validatedData.dueDate === null) {
          dueDate = null;
        } else {
          dueDate = new Date(validatedData.dueDate);
          if (validatedData.dueTime) {
            const [hours, minutes] = validatedData.dueTime.split(":");
            dueDate.setHours(parseInt(hours), parseInt(minutes));
          }
        }
      }
      
      const taskData: any = {
        ...validatedData,
        dueDate,
      };
      
      // Remove properties that shouldn't be sent to storage
      delete taskData.dueTime;
      
      const updatedTask = await storage.updateTask(id, taskData);
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Delete task
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const task = await storage.getTaskById(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create new category
  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        color: z.string(),
      });

      const { name, color } = schema.parse(req.body);
      const category = await storage.createCategory({
        name,
        color,
        userId: null, // We're not handling authentication in this demo
      });

      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Get task statistics
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const allTasks = await storage.getAllTasks();
      const dueTodayTasks = await storage.getTasksDueToday();
      const completedTasks = await storage.getCompletedTasks();
      const highPriorityTasks = await storage.getHighPriorityTasks();

      res.json({
        totalTasks: allTasks.length,
        dueToday: dueTodayTasks.length,
        completed: completedTasks.length,
        highPriority: highPriorityTasks.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
