import { tasks, categories, type Task, type InsertTask, type Category, type InsertCategory, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private categories: Map<number, Category>;
  private userIdCounter: number;
  private taskIdCounter: number;
  private categoryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.categories = new Map();
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    this.categoryIdCounter = 1;
    
    // Initialize with default categories
    this.createCategory({ name: "Work", color: "#8b5cf6", userId: null });
    this.createCategory({ name: "Personal", color: "#3b82f6", userId: null });
    this.createCategory({ name: "Health", color: "#10b981", userId: null });
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
    const user: User = { ...insertUser, id };
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
      completedAt: insertTask.completedAt ?? null
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
}

export const storage = new MemStorage();
