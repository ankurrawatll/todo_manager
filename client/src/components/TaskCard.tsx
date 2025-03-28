import { motion } from "framer-motion";
import { MoreVertical, Clock, User, LayoutDashboard } from "lucide-react";
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

  // Get task status
  const getTaskStatus = (status: string) => {
    switch (status) {
      case "complete":
        return {
          class: "task-card-completed",
          label: "Completed", 
          progressClass: "progress-completed",
          percentage: 100
        };
      case "incomplete":
        if (task.priority === "high") {
          return {
            class: "task-card-not-started",
            label: "Not Started", 
            progressClass: "progress-not-started",
            percentage: 0
          };
        } else {
          return {
            class: "task-card-running",
            label: "Running", 
            progressClass: "progress-running",
            percentage: 60
          };
        }
      default:
        return {
          class: "task-card-not-started",
          label: "Not Started", 
          progressClass: "progress-not-started",
          percentage: 0
        };
    }
  };

  // Get task icon
  const getTaskIcon = () => {
    if (category) {
      if (category.name.toLowerCase().includes("design")) {
        return "D";
      } else if (category.name.toLowerCase().includes("dev")) {
        return "W";
      } else if (category.name.toLowerCase().includes("graphic")) {
        return "G";
      }
    }
    return "T";
  };

  // Get accent color class based on status
  const getAccentClass = (status: string) => {
    if (status === "complete") {
      return "accent-mint";
    } else if (task.priority === "high") {
      return "accent-pink";
    } else {
      return "accent-lavender";
    }
  };

  const taskStatus = getTaskStatus(task.status);

  return (
    <motion.div 
      className={`task-card mb-6 ${getAccentClass(task.status)}`}
      whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
      transition={{ duration: 0.2 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex p-4">
        <div className="mr-3">
          <div className="task-icon">
            {getTaskIcon()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <h3 className={`font-medium text-white ${
              task.status === "complete" ? "line-through opacity-60" : ""
            }`}>
              {task.title}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(task)}>
                  Mark as {task.status === "complete" ? "incomplete" : "complete"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(task)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="mt-1 text-xs text-gray-400">
            {category && (
              <span>Company Task</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-1 mt-2">
          <div className="flex">
            <div className="avatar-group">
              <div className="avatar bg-green-500"></div>
              <div className="avatar bg-blue-500"></div>
              <div className="avatar bg-purple-500"></div>
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="text-gray-400 mr-2">{taskStatus.percentage}%</span>
          </div>
        </div>
        
        <div className="progress-bar mt-1">
          <div 
            className={`progress-value ${taskStatus.progressClass}`}
            style={{ width: `${taskStatus.percentage}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
}
