import { motion } from "framer-motion";
import { MoreVertical, Clock, Bell, RefreshCw } from "lucide-react";
import { Category, Task } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  categories: Category[];
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskCard({ 
  task, 
  categories, 
  onToggleStatus, 
  onEdit, 
  onDelete 
}: TaskCardProps) {
  // Find the category for this task
  const category = categories.find(c => c.id === task.categoryId);
  
  // Format date/time for display
  const formatTime = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  // Get priority styling
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-900 bg-opacity-30";
      case "medium":
        return "text-amber-400 bg-amber-900 bg-opacity-30";
      case "low":
        return "text-emerald-400 bg-emerald-900 bg-opacity-30";
      default:
        return "text-gray-400 bg-gray-800";
    }
  };

  // Get checkbox styling based on priority
  const getCheckboxBorderColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 hover:bg-red-900 hover:bg-opacity-20";
      case "medium":
        return "border-amber-500 hover:bg-amber-900 hover:bg-opacity-20";
      case "low":
        return "border-emerald-500 hover:bg-emerald-900 hover:bg-opacity-20";
      default:
        return "border-gray-400 hover:bg-gray-800";
    }
  };
  
  // Get neon glow color based on priority
  const getNeonGlowColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444"; // red-500
      case "medium":
        return "#f59e0b"; // amber-500
      case "low":
        return "#10b981"; // emerald-500
      default:
        return "#6b7280"; // gray-500
    }
  };

  return (
    <motion.div 
      className="glass-panel rounded-xl neomorphic-card overflow-hidden task-card mb-4"
      style={{
        boxShadow: `0 0 10px rgba(0, 0, 0, 0.2), 0 0 5px ${getNeonGlowColor(task.priority)}`
      }}
      whileHover={{ 
        y: -3,
        boxShadow: `0 10px 20px rgba(0, 0, 0, 0.3), 0 0 8px ${getNeonGlowColor(task.priority)}`
      }}
      transition={{ duration: 0.3 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center p-4">
        <div className="checkbox-container mr-4">
          <div 
            onClick={() => onToggleStatus(task)}
            className={`flex items-center justify-center w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-300 ${
              task.status === "complete" 
                ? "bg-green-500 border-green-500 neon-green-shadow" 
                : getCheckboxBorderColor(task.priority)
            }`}
            style={{
              boxShadow: task.status === "complete" 
                ? "0 0 5px #22c55e" 
                : `0 0 3px ${getNeonGlowColor(task.priority)}`
            }}
          >
            {task.status === "complete" && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h3 className={`text-base font-medium truncate ${
              task.status === "complete" ? "text-gray-400 line-through" : "text-white"
            }`}>
              {task.title}
            </h3>
            <div className="flex items-center mt-1 md:mt-0 space-x-2">
              {category && (
                <span className="text-xs font-medium text-gray-300 glass-badge rounded-full px-3 py-1"
                    style={{borderLeft: `3px solid ${category.color}`}}>
                  {category.name}
                </span>
              )}
              <span className={`inline-flex items-center text-xs font-medium rounded-full px-3 py-1 ${
                getPriorityColor(task.priority)
              }`}
              style={{
                boxShadow: `0 0 5px ${getNeonGlowColor(task.priority)}`
              }}>
                <span className={`w-2 h-2 mr-1 rounded-full`}
                  style={{
                    backgroundColor: getNeonGlowColor(task.priority),
                    boxShadow: `0 0 3px ${getNeonGlowColor(task.priority)}`
                  }}>
                </span>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
          </div>
          
          {task.description && (
            <div className="mt-2">
              <p className={`text-sm line-clamp-2 ${
                task.status === "complete" ? "text-gray-500" : "text-gray-300"
              }`}>
                {task.description}
              </p>
            </div>
          )}
          
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {task.dueDate && (
              <div className="flex items-center text-xs text-gray-400 hover:text-blue-400 transition-colors">
                <Clock className="w-4 h-4 mr-1" style={{color: '#60a5fa'}} />
                <span>{formatTime(task.dueDate)}</span>
              </div>
            )}
            
            {task.hasReminder && (
              <div className="flex items-center text-xs text-gray-400 hover:text-pink-400 transition-colors">
                <Bell className="w-4 h-4 mr-1" style={{color: '#f472b6'}} />
                <span>
                  {task.reminderTime 
                    ? `${task.reminderTime} mins before` 
                    : "Reminder set"}
                </span>
              </div>
            )}
            
            <div className="flex items-center text-xs text-gray-500 ml-auto">
              <RefreshCw className="text-purple-400 w-4 h-4 mr-1" />
              <span>
                Updated {formatDistanceToNow(
                  new Date(task.dueDate || Date.now()),
                  { addSuffix: true }
                )}
              </span>
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800 hover:bg-opacity-50 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-dropdown border-gray-800">
              <DropdownMenuItem 
                onClick={() => onEdit(task)}
                className="hover:bg-gray-800 hover:bg-opacity-50 focus:bg-gray-800 focus:bg-opacity-50 text-gray-300 hover:text-white"
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onToggleStatus(task)}
                className="hover:bg-blue-900 hover:bg-opacity-30 focus:bg-blue-900 focus:bg-opacity-30 text-blue-400"
              >
                Mark as {task.status === "complete" ? "incomplete" : "complete"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(task)}
                className="hover:bg-red-900 hover:bg-opacity-30 focus:bg-red-900 focus:bg-opacity-30 text-red-400"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
