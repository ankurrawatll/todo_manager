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

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50";
      case "medium":
        return "text-amber-500 bg-amber-50";
      case "low":
        return "text-emerald-500 bg-emerald-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  // Get border color for checkbox based on priority
  const getCheckboxBorderColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 hover:bg-red-50";
      case "medium":
        return "border-amber-500 hover:bg-amber-50";
      case "low":
        return "border-emerald-500 hover:bg-emerald-50";
      default:
        return "border-gray-400 hover:bg-gray-50";
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden task-card mb-4"
      whileHover={{ 
        y: -2,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      }}
      transition={{ duration: 0.2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center p-4">
        <div className="checkbox-container mr-4">
          <div 
            onClick={() => onToggleStatus(task)}
            className={`flex items-center justify-center w-6 h-6 rounded-full border-2 cursor-pointer transition-colors duration-200 ${
              task.status === "complete" 
                ? "bg-green-500 border-green-500" 
                : getCheckboxBorderColor(task.priority)
            }`}
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
              task.status === "complete" ? "text-gray-400 line-through" : "text-gray-900"
            }`}>
              {task.title}
            </h3>
            <div className="flex items-center mt-1 md:mt-0 space-x-2">
              {category && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                  {category.name}
                </span>
              )}
              <span className={`inline-flex items-center text-xs font-medium rounded-full px-3 py-1 ${
                getPriorityColor(task.priority)
              }`}>
                <span className={`w-2 h-2 mr-1 rounded-full bg-${
                  task.priority === "high" ? "red" : 
                  task.priority === "medium" ? "amber" : "emerald"
                }-500`}></span>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
          </div>
          
          {task.description && (
            <div className="mt-2">
              <p className={`text-sm line-clamp-2 ${
                task.status === "complete" ? "text-gray-400" : "text-gray-600"
              }`}>
                {task.description}
              </p>
            </div>
          )}
          
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {task.dueDate && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="text-gray-400 w-4 h-4 mr-1" />
                <span>{formatTime(task.dueDate)}</span>
              </div>
            )}
            
            {task.hasReminder && (
              <div className="flex items-center text-xs text-gray-500">
                <Bell className="text-gray-400 w-4 h-4 mr-1" />
                <span>
                  {task.reminderTime 
                    ? `${task.reminderTime} mins before` 
                    : "Reminder set"}
                </span>
              </div>
            )}
            
            <div className="flex items-center text-xs text-gray-500 ml-auto">
              <RefreshCw className="text-gray-400 w-4 h-4 mr-1" />
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
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onToggleStatus(task)}
                className="text-blue-600"
              >
                Mark as {task.status === "complete" ? "incomplete" : "complete"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(task)}
                className="text-red-600"
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
