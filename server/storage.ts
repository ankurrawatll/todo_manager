import { 
  tasks, categories, users, goals, achievements, userAchievements, goalTaskMappings,
  type Task, type InsertTask, 
  type Category, type InsertCategory, 
  type User, type InsertUser,
  type Goal, type InsertGoal,
  type Achievement, type InsertAchievement,
  type UserAchievement, type InsertUserAchievement,
  type GoalTaskMapping, type InsertGoalTaskMapping,
  type LeaderboardEntry
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Task methods
  getAllTasks(): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  getTasksByUser(userId: number): Promise<Task[]>;
  getTasksByCategory(categoryId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksDueToday(): Promise<Task[]>;
  getHighPriorityTasks(): Promise<Task[]>;
  getCompletedTasks(): Promise<Task[]>;
  
  // Goal methods
  getAllGoals(): Promise<Goal[]>;
  getGoalById(id: number): Promise<Goal | undefined>;
  getGoalsByUser(userId: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  getGoalTasks(goalId: number): Promise<Task[]>;
  
  // Achievement methods
  getAllAchievements(): Promise<Achievement[]>;
  getAchievementById(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: number): Promise<Achievement[]>;
  awardAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  
  // Leaderboard methods
  getLeaderboard(type: "global" | "country" | "region", limit?: number): Promise<LeaderboardEntry[]>;
  getUserRank(userId: number, type: "global" | "country" | "region"): Promise<number>;
  addUserPoints(userId: number, points: number): Promise<User | undefined>;
  updateUserLevel(userId: number, level: string): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private categories: Map<number, Category>;
  private goals: Map<number, Goal>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private goalTaskMappings: Map<number, GoalTaskMapping>;
  private userIdCounter: number;
  private taskIdCounter: number;
  private categoryIdCounter: number;
  private goalIdCounter: number;
  private achievementIdCounter: number;
  private userAchievementIdCounter: number;
  private goalTaskMappingIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.categories = new Map();
    this.goals = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.goalTaskMappings = new Map();
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    this.categoryIdCounter = 1;
    this.goalIdCounter = 1;
    this.achievementIdCounter = 1;
    this.userAchievementIdCounter = 1;
    this.goalTaskMappingIdCounter = 1;
    
    // Initialize with default categories
    this.createCategory({ name: "Work", color: "#8b5cf6", userId: null });
    this.createCategory({ name: "Personal", color: "#3b82f6", userId: null });
    this.createCategory({ name: "Health", color: "#10b981", userId: null });
    
    // Initialize with default achievements
    this.createAchievement({ 
      name: "First Task Complete", 
      description: "Complete your first task", 
      icon: "🏆", 
      points: 10, 
      requirement: 1, 
      category: "completion" 
    });
    this.createAchievement({ 
      name: "High Achiever", 
      description: "Complete 10 tasks", 
      icon: "🌟", 
      points: 25, 
      requirement: 10, 
      category: "completion" 
    });
    this.createAchievement({ 
      name: "Priority Master", 
      description: "Complete 5 high-priority tasks", 
      icon: "⚡", 
      points: 30, 
      requirement: 5, 
      category: "priority" 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      score: insertUser.score || 0,
      level: insertUser.level || "Bronze",
      region: insertUser.region || "Global",
      country: insertUser.country || "Global",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { 
      ...insertCategory, 
      id,
      userId: insertCategory.userId ?? null
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...updateData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async getTasksByCategory(categoryId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.categoryId === categoryId
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    // Ensure all required fields have default values to satisfy TypeScript
    const task: Task = { 
      ...insertTask, 
      id,
      title: insertTask.title,
      description: insertTask.description ?? null,
      dueDate: insertTask.dueDate ?? null,
      priority: insertTask.priority ?? "medium",
      status: insertTask.status ?? "incomplete",
      categoryId: insertTask.categoryId ?? null,
      userId: insertTask.userId ?? null,
      hasReminder: insertTask.hasReminder ?? false,
      reminderTime: insertTask.reminderTime ?? null,
      completed: insertTask.completed ?? false,
      completedAt: insertTask.completedAt ?? null,
      points: insertTask.points ?? 10,
      difficulty: insertTask.difficulty ?? "normal",
      isGoalTask: insertTask.isGoalTask ?? false,
      goalId: insertTask.goalId ?? null
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updateData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getTasksDueToday(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return Array.from(this.tasks.values()).filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
  }

  async getHighPriorityTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.priority === "high"
    );
  }

  async getCompletedTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.completed === true || task.status === "complete"
    );
  }

  // Goal methods
  async getAllGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async getGoalById(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async getGoalsByUser(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId
    );
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.goalIdCounter++;
    const goal: Goal = {
      ...insertGoal,
      id,
      progress: 0,
      completedAt: null,
      roadmap: insertGoal.roadmap || null,
      description: insertGoal.description || null,
      createdAt: new Date()
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, updateData: Partial<InsertGoal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updateData };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  async getGoalTasks(goalId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.goalId === goalId
    );
  }

  // Achievement methods
  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getAchievementById(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementIdCounter++;
    const achievement: Achievement = { 
      ...insertAchievement, 
      id,
      points: insertAchievement.points || 10
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    const userAchievementEntries = Array.from(this.userAchievements.values()).filter(
      (userAchievement) => userAchievement.userId === userId
    );
    
    const achievements: Achievement[] = [];
    for (const userAchievement of userAchievementEntries) {
      const achievement = this.achievements.get(userAchievement.achievementId);
      if (achievement) {
        achievements.push(achievement);
      }
    }
    
    return achievements;
  }

  async awardAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.userAchievementIdCounter++;
    const userAchievement: UserAchievement = {
      ...insertUserAchievement,
      id,
      earnedAt: new Date()
    };
    this.userAchievements.set(id, userAchievement);
    
    // Add achievement points to user's score
    const achievement = this.achievements.get(userAchievement.achievementId);
    if (achievement) {
      await this.addUserPoints(userAchievement.userId, achievement.points);
    }
    
    return userAchievement;
  }

  // User related methods
  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Leaderboard methods
  async getLeaderboard(type: "global" | "country" | "region", limit: number = 10): Promise<LeaderboardEntry[]> {
    let users = Array.from(this.users.values());
    
    if (type === "country") {
      // Group by country, filter out users without a country
      const usersByCountry = new Map<string, User[]>();
      users.forEach(user => {
        if (user.country && user.country !== "Global") {
          if (!usersByCountry.has(user.country)) {
            usersByCountry.set(user.country, []);
          }
          usersByCountry.get(user.country)!.push(user);
        }
      });
      
      // Sort each country group by score
      for (const [country, countryUsers] of usersByCountry.entries()) {
        usersByCountry.set(country, countryUsers.sort((a, b) => b.score - a.score));
      }
      
      // Flatten the map back to an array
      users = [];
      for (const countryUsers of usersByCountry.values()) {
        users.push(...countryUsers.slice(0, limit));
      }
    } else if (type === "region") {
      // Group by region, filter out users without a region
      const usersByRegion = new Map<string, User[]>();
      users.forEach(user => {
        if (user.region && user.region !== "Global") {
          if (!usersByRegion.has(user.region)) {
            usersByRegion.set(user.region, []);
          }
          usersByRegion.get(user.region)!.push(user);
        }
      });
      
      // Sort each region group by score
      for (const [region, regionUsers] of usersByRegion.entries()) {
        usersByRegion.set(region, regionUsers.sort((a, b) => b.score - a.score));
      }
      
      // Flatten the map back to an array
      users = [];
      for (const regionUsers of usersByRegion.values()) {
        users.push(...regionUsers.slice(0, limit));
      }
    }
    
    // For global or after grouping, sort all users by score
    users.sort((a, b) => b.score - a.score);
    
    // Take only the requested number of users
    users = users.slice(0, limit);
    
    // Convert to LeaderboardEntry format with ranks
    return users.map((user, index) => ({
      userId: user.id,
      username: user.username,
      score: user.score,
      level: user.level,
      region: user.region || undefined,
      country: user.country || undefined,
      rank: index + 1
    }));
  }

  async getUserRank(userId: number, type: "global" | "country" | "region"): Promise<number> {
    const user = this.users.get(userId);
    if (!user) return -1;
    
    let users = Array.from(this.users.values());
    
    if (type === "country") {
      if (!user.country || user.country === "Global") return -1;
      users = users.filter(u => u.country === user.country);
    } else if (type === "region") {
      if (!user.region || user.region === "Global") return -1;
      users = users.filter(u => u.region === user.region);
    }
    
    // Sort by score in descending order
    users.sort((a, b) => b.score - a.score);
    
    // Find rank of the user
    const rank = users.findIndex(u => u.id === userId);
    return rank === -1 ? -1 : rank + 1;
  }

  async addUserPoints(userId: number, points: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const newScore = user.score + points;
    const newLevel = this.calculateLevel(newScore);
    
    const updatedUser = { 
      ...user, 
      score: newScore,
      level: newLevel 
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserLevel(userId: number, level: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, level };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Helper method to calculate user level based on score
  private calculateLevel(score: number): string {
    if (score >= 1000) return "Diamond";
    if (score >= 500) return "Platinum";
    if (score >= 250) return "Gold";
    if (score >= 100) return "Silver";
    return "Bronze";
  }
}

export const storage = new MemStorage();
