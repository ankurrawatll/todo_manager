import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTaskSchema, taskSchema, goalSchema, type Goal } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { openAIService } from "./services/openai";

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
        completed: validatedData.status === "complete",
        completedAt: validatedData.status === "complete" ? new Date() : null,
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
      
      // Check for status change to complete
      const isCompletionToggle = 
        validatedData.status === "complete" && task.status !== "complete";
      
      const taskData: any = {
        ...validatedData,
        dueDate,
        // Set completed state based on status
        completed: validatedData.status === "complete",
        // Set completedAt date when a task is being marked as complete
        completedAt: isCompletionToggle ? new Date() : task.completedAt
      };
      
      // Remove properties that shouldn't be sent to storage
      delete taskData.dueTime;
      
      const updatedTask = await storage.updateTask(id, taskData);
      
      // Handle point awards and achievements when a task is completed
      if (isCompletionToggle) {
        // Calculate points based on task priority and difficulty
        let points = task.points || 10; // Default to 10 points
        
        // Adjust points based on priority
        if (task.priority === "high") {
          points *= 1.5;
        } else if (task.priority === "low") {
          points *= 0.8;
        }
        
        // Adjust points based on difficulty if specified
        if (task.difficulty === "hard") {
          points *= 1.5;
        } else if (task.difficulty === "easy") {
          points *= 0.7;
        }
        
        // Award points to the user (using a default user ID of 1 for this demo)
        const userId = task.userId || 1;
        await storage.addUserPoints(userId, Math.round(points));
        
        // Get completed task count for achievements
        const userTasks = await storage.getTasksByUser(userId);
        const completedTaskCount = userTasks.filter(t => t.completed).length;
        
        // Get high priority completed task count
        const completedHighPriorityCount = userTasks.filter(
          t => t.completed && t.priority === "high"
        ).length;
        
        // Check for achievements
        const achievements = await storage.getAllAchievements();
        
        // First task completed achievement
        const firstTaskAchievement = achievements.find(
          a => a.category === "completion" && a.requirement === 1
        );
        
        if (firstTaskAchievement && completedTaskCount === 1) {
          await storage.awardAchievement({
            userId,
            achievementId: firstTaskAchievement.id
          });
        }
        
        // Multiple tasks completed achievement
        const multipleTasksAchievement = achievements.find(
          a => a.category === "completion" && a.requirement === 10
        );
        
        if (multipleTasksAchievement && completedTaskCount >= 10) {
          // Check if user already has this achievement
          const userAchievements = await storage.getUserAchievements(userId);
          const hasAchievement = userAchievements.some(a => a.id === multipleTasksAchievement.id);
          
          if (!hasAchievement) {
            await storage.awardAchievement({
              userId,
              achievementId: multipleTasksAchievement.id
            });
          }
        }
        
        // High priority tasks achievement
        const priorityAchievement = achievements.find(
          a => a.category === "priority" && a.requirement === 5
        );
        
        if (priorityAchievement && completedHighPriorityCount >= 5) {
          // Check if user already has this achievement
          const userAchievements = await storage.getUserAchievements(userId);
          const hasAchievement = userAchievements.some(a => a.id === priorityAchievement.id);
          
          if (!hasAchievement) {
            await storage.awardAchievement({
              userId,
              achievementId: priorityAchievement.id
            });
          }
        }
      }
      
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

  // === LEADERBOARD ENDPOINTS ===
  
  // Get leaderboard
  app.get("/api/leaderboard/:type", async (req: Request, res: Response) => {
    try {
      const type = req.params.type as "global" | "country" | "region";
      if (!["global", "country", "region"].includes(type)) {
        return res.status(400).json({ message: "Invalid leaderboard type" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const leaderboard = await storage.getLeaderboard(type, limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  
  // Get user rank
  app.get("/api/leaderboard/user/:userId/:type", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const type = req.params.type as "global" | "country" | "region";
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      if (!["global", "country", "region"].includes(type)) {
        return res.status(400).json({ message: "Invalid leaderboard type" });
      }
      
      const rank = await storage.getUserRank(userId, type);
      if (rank === -1) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ userId, rank, type });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user rank" });
    }
  });
  
  // === ACHIEVEMENT ENDPOINTS ===
  
  // Get all achievements
  app.get("/api/achievements", async (req: Request, res: Response) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });
  
  // Get user achievements
  app.get("/api/achievements/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });
  
  // Award achievement to user
  app.post("/api/achievements/award", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.number(),
        achievementId: z.number()
      });
      
      const { userId, achievementId } = schema.parse(req.body);
      
      // Check if user and achievement exist
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const achievement = await storage.getAchievementById(achievementId);
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      const userAchievement = await storage.awardAchievement({ userId, achievementId });
      res.status(201).json(userAchievement);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to award achievement" });
    }
  });
  
  // === GOAL ENDPOINTS ===
  
  // Get all goals
  app.get("/api/goals", async (req: Request, res: Response) => {
    try {
      const goals = await storage.getAllGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });
  
  // Get goal by ID
  app.get("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }
      
      const goal = await storage.getGoalById(id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goal" });
    }
  });
  
  // Get goals by user
  app.get("/api/goals/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const goals = await storage.getGoalsByUser(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user goals" });
    }
  });
  
  // Create new goal
  app.post("/api/goals", async (req: Request, res: Response) => {
    try {
      const validatedData = goalSchema.parse(req.body);
      
      // For now, we're not handling authentication in this demo
      const userId = 1;
      
      const goalData = {
        title: validatedData.title,
        description: validatedData.description || "",
        category: validatedData.category,
        timeframe: validatedData.timeframe,
        userId: userId,
        roadmap: validatedData.roadmap || null
      };
      
      const goal = await storage.createGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });
  
  // Update goal
  app.patch("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }
      
      const goal = await storage.getGoalById(id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const validatedData = goalSchema.partial().parse(req.body);
      const updatedGoal = await storage.updateGoal(id, validatedData);
      
      res.json(updatedGoal);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update goal" });
    }
  });
  
  // Delete goal
  app.delete("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }
      
      const goal = await storage.getGoalById(id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      await storage.deleteGoal(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });
  
  // === AI ENDPOINTS ===
  
  // Generate goal roadmap with OpenAI
  app.post("/api/ai/generate-roadmap", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        goal: z.string(),
        timeframe: z.enum(["short-term", "medium-term", "long-term"]),
        details: z.string().optional(),
        category: z.string().optional()
      });
      
      const { goal, timeframe, details, category } = schema.parse(req.body);
      
      // Create goal object for OpenAI service
      const goalData = {
        title: goal,
        description: details || "",
        category: category || "personal",
        timeframe: timeframe
      };
      
      // Use our OpenAI service to generate the roadmap
      const roadmap = await openAIService.generateGoalRoadmap(goalData);
      
      // If no OPENAI_API_KEY is provided, fallback to the legacy Gemini implementation
      if (!process.env.OPENAI_API_KEY && roadmap instanceof Error) {
        // Initialize the Gemini AI client
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDSlSvLQyeqTmW-PQaxil06UzNN-IYU_NM");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        // Prepare prompt for AI
        let prompt = `
        Create a detailed, structured roadmap for the following goal: "${goal}".
        Timeframe: ${timeframe} (${
          timeframe === "short-term" ? "1-3 months" :
          timeframe === "medium-term" ? "3-12 months" : "1-5 years"
        }).
        
        ${details ? `Additional details: ${details}` : ""}
        
        Respond with a JSON object containing a structured roadmap with the following format:
        {
          "summary": "Brief summary of the approach",
          "milestones": [
            {
              "title": "Milestone title",
              "description": "Description",
              "timeframe": "When this should be accomplished",
              "tasks": [
                {
                  "title": "Task title",
                  "description": "Task description",
                  "priority": "high/medium/low",
                  "estimatedDuration": "Time needed"
                }
              ]
            }
          ],
          "weeklyPlan": [
            {
              "week": "1",
              "focus": "What to focus on",
              "tasks": ["Task 1", "Task 2", "Task 3"]
            }
          ],
          "resources": ["Resource 1", "Resource 2"],
          "challenges": ["Challenge 1", "Challenge 2"],
          "tips": ["Tip 1", "Tip 2"]
        }
        
        Only provide the JSON response with no additional text.
        Ensure all milestones and tasks are practical, actionable, and aligned with the goal.
        `;
        
        // Generate roadmap from Gemini AI
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the response and extract JSON
        let geminiRoadmap;
        try {
          // Find JSON content in the response
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            geminiRoadmap = JSON.parse(jsonMatch[0]);
            return res.json(geminiRoadmap);
          } else {
            // Fallback if no JSON structure is found
            throw new Error("Invalid AI response format");
          }
        } catch (err) {
          return res.status(500).json({ 
            message: "Failed to parse AI response",
            error: err.message
          });
        }
      }
      
      res.json({
        goal,
        timeframe,
        roadmap
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ 
        message: "Failed to generate roadmap",
        error: error.message
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
