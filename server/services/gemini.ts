import { GoogleGenerativeAI } from "@google/generative-ai";
import { Goal, InsertGoal } from "../../shared/schema";

// Initialize Gemini client with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDSlSvLQyeqTmW-PQaxil06UzNN-IYU_NM");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export class GeminiService {
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
        Timeframe: ${goal.timeframe} (${
          goal.timeframe === "short-term" ? "1-3 months" :
          goal.timeframe === "medium-term" ? "3-12 months" : "1-5 years"
        })
        
        Respond with a JSON object containing a structured roadmap with the following format:
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
        Only provide the JSON response with no additional text.
      `;

      // Call Gemini API to generate the roadmap
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the response and extract JSON
      let roadmap;
      try {
        // Find JSON content in the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          roadmap = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback if no JSON structure is found
          throw new Error("Invalid AI response format");
        }
        return roadmap;
      } catch (error) {
        console.error("Error parsing Gemini response:", error);
        throw new Error(`Failed to parse roadmap: ${error.message}`);
      }
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
        Only provide the JSON array with no additional text.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        // Try to parse as JSON directly
        return JSON.parse(text);
      } catch (error) {
        // If direct parsing fails, try to extract JSON array
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        // If all parsing fails, return default tips
        return [
          "Try breaking down complex tasks into smaller, manageable steps.",
          "Consider using the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break.",
          "Review and prioritize your tasks at the beginning of each day."
        ];
      }
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

export const geminiService = new GeminiService();