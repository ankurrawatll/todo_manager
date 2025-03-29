import OpenAI from "openai";
import { Goal, InsertGoal } from "../../shared/schema";

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class OpenAIService {
  /**
   * Generate a task roadmap for a user's goal
   * @param goal The goal information provided by the user
   * @returns A structured roadmap with daily, weekly, and monthly tasks
   */
  async generateGoalRoadmap(goal: Partial<InsertGoal>): Promise<any> {
    try {
      // Construct the prompt for generating a roadmap based on the goal
      const prompt = `
        Generate a detailed, structured roadmap for the following goal:
        
        Goal Title: ${goal.title}
        Description: ${goal.description || "Not provided"}
        Category: ${goal.category}
        Timeframe: ${goal.timeframe}
        
        Create a structured JSON roadmap with the following format:
        {
          "overview": "Brief 2-3 sentence summary of the roadmap approach",
          "milestones": [
            {
              "title": "Milestone title",
              "description": "Description of the milestone",
              "duration": "estimated duration (e.g., '2 weeks')",
              "tasks": [
                {
                  "title": "Task title",
                  "description": "Detailed task description",
                  "priority": "high/medium/low",
                  "difficulty": "easy/normal/hard",
                  "estimated_time": "estimated time to complete (e.g., '3 hours')",
                  "resources": ["URLs, books, or other resources to help"]
                }
              ]
            }
          ],
          "weekly_plan": [
            {
              "week": 1,
              "focus": "Main focus for this week",
              "tasks": ["Task 1", "Task 2", "Task 3"]
            }
          ],
          "monthly_goals": [
            {
              "month": 1,
              "focus": "Main focus for this month",
              "targets": ["Target 1", "Target 2"]
            }
          ],
          "success_metrics": ["Metric 1", "Metric 2", "Metric 3"]
        }
        
        Make the roadmap realistic, actionable, and adaptive to the timeframe.
        Break down large goals into manageable steps.
        Include specific, measurable actions.
        Tailor the weekly and monthly plans to the goal's category.
      `;

      // Call OpenAI API to generate the roadmap
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are an expert goal planning assistant specializing in creating structured, achievable roadmaps for personal and professional goals." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      // Parse the response content as JSON
      const roadmapContent = response.choices[0].message.content;
      return JSON.parse(roadmapContent);
    } catch (error) {
      console.error("Error generating goal roadmap:", error);
      throw new Error(`Failed to generate roadmap: ${error.message}`);
    }
  }

  /**
   * Generate AI advice for improving productivity or achieving goals
   */
  async generateProductivityTips(context: {
    recentTasks: number;
    completedTasks: number;
    overdueCount: number;
    highPriorityCount: number;
    goals?: any[];
  }): Promise<string[]> {
    try {
      const prompt = `
        Based on the following user stats, generate 3 practical, specific productivity tips:
        
        Recent Tasks: ${context.recentTasks}
        Completed Tasks: ${context.completedTasks}
        Overdue Tasks: ${context.overdueCount}
        High Priority Tasks: ${context.highPriorityCount}
        Current Goals: ${context.goals?.map(g => g.title).join(", ") || "None"}
        
        Format the response as a JSON array of 3 strings, where each string is a productivity tip.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a productivity coach specializing in personalized productivity advice." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error("Error generating productivity tips:", error);
      return [
        "Try breaking down complex tasks into smaller, manageable steps.",
        "Consider using the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break.",
        "Review and prioritize your tasks at the beginning of each day."
      ];
    }
  }
}

export const openAIService = new OpenAIService();