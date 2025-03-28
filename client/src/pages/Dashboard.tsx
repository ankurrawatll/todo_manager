import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Search,
  FilterIcon,
  SortDesc,
  CheckCircle,
  Bell,
  Calendar,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useTasks, useCategories } from "@/hooks/use-tasks";
import { TaskFormValues, Task } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import TaskCard from "@/components/TaskCard";
import AddTaskModal from "@/components/AddTaskModal";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";

export default function Dashboard() {
  const {
    tasks,
    isLoading,
    stats,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTasksByDate,
    isCreating,
    isUpdating,
  } = useTasks();
  
  const { categories } = useCategories();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskFormValues | undefined>(undefined);

  // Group tasks by date
  const { today, tomorrow, later } = getTasksByDate();

  // Current date formatted nicely
  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

  // Filter tasks based on search query
  const filterTasks = (tasks: Task[]) => {
    if (!searchQuery) return tasks;
    
    return tasks.filter((task) => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  // Handle task creation/update
  const handleTaskSubmit = (data: TaskFormValues) => {
    if (editingTask && editingTask.id) {
      updateTask({ id: editingTask.id, data });
    } else {
      createTask(data);
    }
    setIsAddTaskModalOpen(false);
    setEditingTask(undefined);
  };

  // Handle task edit button click
  const handleEditTask = (task: Task) => {
    // Format the task data for the form
    const dueDate = task.dueDate 
      ? format(new Date(task.dueDate), "yyyy-MM-dd") 
      : null;
    
    let dueTime = null;
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      dueTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    setEditingTask({
      ...task,
      dueDate,
      dueTime
    });
    setIsAddTaskModalOpen(true);
  };

  // Handle task deletion
  const handleDeleteTask = (task: Task) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id);
    }
  };

  // Check if tasks are all loaded and empty
  const isTasksEmpty = !isLoading && tasks.length === 0;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <MobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 md:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Today's Tasks</h1>
              <p className="text-gray-600">{currentDate}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  className="pl-10 pr-4 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex items-center">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                
                <Button variant="outline" size="sm" className="flex items-center">
                  <SortDesc className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </div>
            </div>
          </div>
          
          {/* Task summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Tasks"
              value={stats.totalTasks}
              subtitle="in your list"
              icon={<CheckCircle className="h-5 w-5 text-primary" />}
              iconColor="bg-primary"
              trend="up"
            />
            
            <StatCard
              title="Due Today"
              value={stats.dueToday}
              subtitle="tasks to complete"
              icon={<Calendar className="h-5 w-5 text-amber-500" />}
              iconColor="bg-amber-500"
              trend={stats.dueToday > 5 ? "up" : "neutral"}
            />
            
            <StatCard
              title="Completed"
              value={stats.completed}
              subtitle="tasks done"
              icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
              iconColor="bg-emerald-500"
              trend="up"
            />
            
            <StatCard
              title="High Priority"
              value={stats.highPriority}
              subtitle="urgent tasks"
              icon={<AlertCircle className="h-5 w-5 text-red-500" />}
              iconColor="bg-red-500"
              trend={stats.highPriority > 3 ? "up" : "down"}
            />
          </div>
          
          {/* Task Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button className="category-pill shadow-sm">All Tasks</Button>
            {categories.map((category) => (
              <Button 
                key={category.id} 
                variant="outline" 
                className="category-pill shadow-sm hover:bg-gray-50"
              >
                {category.name}
              </Button>
            ))}
            <Button 
              variant="outline" 
              className="category-pill shadow-sm text-primary border-dashed border-primary"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Category
            </Button>
          </div>
          
          {/* Task List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading tasks...</p>
            </div>
          ) : isTasksEmpty ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No tasks yet</h3>
              <p className="mt-2 text-gray-500">Get started by adding your first task</p>
              <Button 
                className="mt-4"
                onClick={() => setIsAddTaskModalOpen(true)}
              >
                Add Task
              </Button>
            </div>
          ) : (
            <motion.div 
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Today's tasks */}
              {filterTasks(today).length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Today</h2>
                  {filterTasks(today).map((task) => (
                    <TaskCard 
                      key={task.id}
                      task={task}
                      categories={categories}
                      onToggleStatus={toggleTaskCompletion}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
              
              {/* Tomorrow's tasks */}
              {filterTasks(tomorrow).length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Tomorrow</h2>
                  {filterTasks(tomorrow).map((task) => (
                    <TaskCard 
                      key={task.id}
                      task={task}
                      categories={categories}
                      onToggleStatus={toggleTaskCompletion}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
              
              {/* Later tasks */}
              {filterTasks(later).length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Later</h2>
                  {filterTasks(later).map((task) => (
                    <TaskCard 
                      key={task.id}
                      task={task}
                      categories={categories}
                      onToggleStatus={toggleTaskCompletion}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
              
              {/* No results from search */}
              {searchQuery && 
               filterTasks(today).length === 0 && 
               filterTasks(tomorrow).length === 0 && 
               filterTasks(later).length === 0 && (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No matching tasks</h3>
                  <p className="mt-2 text-gray-500">Try adjusting your search criteria</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
        
        {/* Floating Action Button */}
        <motion.button
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          onClick={() => {
            setEditingTask(undefined);
            setIsAddTaskModalOpen(true);
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </main>
      
      {/* Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => {
          setIsAddTaskModalOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={handleTaskSubmit}
        categories={categories}
        editTask={editingTask}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
