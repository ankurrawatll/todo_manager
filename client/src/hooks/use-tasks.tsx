import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { type Task, type TaskFormValues } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export const useTasks = () => {
  const { toast } = useToast();

  // Get all tasks
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Get task statistics
  const { data: stats = { totalTasks: 0, dueToday: 0, completed: 0, highPriority: 0 } } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Create a new task
  const createMutation = useMutation({
    mutationFn: async (taskData: TaskFormValues) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update a task
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TaskFormValues> }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a task
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Toggle task completion status
  const toggleTaskCompletion = async (task: Task) => {
    const newStatus = task.status === "complete" ? "incomplete" : "complete";
    try {
      await updateMutation.mutateAsync({
        id: task.id,
        data: { status: newStatus },
      });

      // Show notification
      const message = newStatus === "complete" 
        ? "Task marked as complete!" 
        : "Task marked as incomplete";
      
      // Use the window function defined in App.tsx
      if (window && (window as any).showTaskNotification) {
        (window as any).showTaskNotification(message, "success");
      }
    } catch (error) {
      console.error("Error toggling task status:", error);
    }
  };

  // Sort and filter tasks
  const getTasksByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const todayTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= today && taskDate < tomorrow;
    });

    const tomorrowTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= tomorrow && taskDate < dayAfterTomorrow;
    });

    const laterTasks = tasks.filter((task) => {
      if (!task.dueDate) return true; // No due date tasks go to later
      const taskDate = new Date(task.dueDate);
      return taskDate >= dayAfterTomorrow;
    });

    return {
      today: todayTasks,
      tomorrow: tomorrowTasks,
      later: laterTasks,
    };
  };

  return {
    tasks,
    isLoading,
    error,
    stats,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    toggleTaskCompletion,
    getTasksByDate,
  };
};

export const useCategories = () => {
  const { toast } = useToast();

  // Get all categories
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Create a new category
  const createMutation = useMutation({
    mutationFn: async (categoryData: { name: string; color: string }) => {
      const response = await apiRequest("POST", "/api/categories", categoryData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};
