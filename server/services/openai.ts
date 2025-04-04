import { GoogleGenerativeAI } from "@google/generative-ai";
import { Goal, InsertGoal } from "../../shared/schema";

// Initialize Gemini client
const geminiAI = new GoogleGenerativeAI("AIzaSyDjVjlcUgWCRcpKBNU7rdTAhFTFl9pBPQs"); // Using public demo API key

export class OpenAIService {
  /**
   * Generate a task roadmap for a user's goal
   * @param goal The goal information provided by the user
   * @returns A structured roadmap with daily, weekly, and monthly tasks
   */
  async generateGoalRoadmap(goal: Partial<InsertGoal>): Promise<any> {
    try {
      // Get Gemini pro model
      const model = geminiAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Construct the prompt for generating a roadmap based on the goal
      const prompt = `
        Generate a detailed, structured roadmap for the following goal:
        
        Goal Title: ${goal.title}
        Description: ${goal.description || "Not provided"}
        Category: ${goal.category || "personal"}
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
        IMPORTANT: Your response must be valid JSON. Do not include any explanations, markdown formatting, or text outside the JSON object.
      `;

      // Generate roadmap content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response (in case there's any text before or after the JSON)
      const jsonMatch = text.match(/(\{.*\})/s);
      
      if (jsonMatch && jsonMatch[0]) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error("Error parsing JSON from Gemini response:", parseError);
          return { 
            error: "Failed to parse JSON response",
            overview: "A roadmap couldn't be generated in the correct format. Please try again with more details about your goal."
          };
        }
      }
      
      return { 
        error: "Invalid response format", 
        overview: "Could not generate a properly formatted roadmap. Please try again with more details."
      };
    } catch (error: any) {
      console.error("Error generating goal roadmap:", error);
      return {
        error: error.message,
        overview: "Failed to generate a roadmap due to a technical issue. Please try again later."
      };
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
      // Get Gemini pro model
      const model = geminiAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        Based on the following user stats, generate 3 practical, specific productivity tips:
        
        Recent Tasks: ${context.recentTasks}
        Completed Tasks: ${context.completedTasks}
        Overdue Tasks: ${context.overdueCount}
        High Priority Tasks: ${context.highPriorityCount}
        Current Goals: ${context.goals?.map(g => g.title).join(", ") || "None"}
        
        Format the response as a JSON array of 3 strings, where each string is a productivity tip.
        For example: ["Tip 1 here", "Tip 2 here", "Tip 3 here"]
        
        ONLY return the JSON array, without any additional text, explanation or markdown.
      `;

      // Generate productivity tips
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON array from response
      const jsonMatch = text.match(/(\[.*\])/s);
      
      if (jsonMatch && jsonMatch[0]) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error("Error parsing JSON from Gemini response:", parseError);
        }
      }
      
      // Fallback tips if parsing fails
      return [
        "Try breaking down complex tasks into smaller, manageable steps.",
        "Consider using the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break.",
        "Review and prioritize your tasks at the beginning of each day."
      ];
    } catch (error: any) {
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