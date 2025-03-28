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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f1118]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <MobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 md:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 glass-panel rounded-3xl p-6"
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4}}
          >
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                Today's Tasks
              </h1>
              <p className="text-gray-400">{currentDate}</p>
            </div>
            
            <div className="mt-5 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  className="pl-10 pr-4 py-2 bg-gray-900 bg-opacity-40 border-gray-800 text-white placeholder:text-gray-500 rounded-full focus:ring-purple-500 focus:border-purple-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-purple-400" />
              </div>
              
              <div className="flex space-x-3">
                <motion.div
                  whileHover={{scale: 1.05}}
                  className="inline-block"
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center rounded-full bg-gray-900 bg-opacity-40 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-purple-500 transition-all duration-300"
                  >
                    <FilterIcon className="h-4 w-4 mr-2 text-purple-400" />
                    Filter
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{scale: 1.05}}
                  className="inline-block"
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center rounded-full bg-gray-900 bg-opacity-40 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-blue-500 transition-all duration-300"
                  >
                    <SortDesc className="h-4 w-4 mr-2 text-blue-400" />
                    Sort
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
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
          <motion.div 
            className="flex flex-wrap gap-3 glass-panel rounded-3xl p-3 mb-8"
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, delay: 0.2}}
          >
            <motion.div whileHover={{scale: 1.05}} className="m-1">
              <Button 
                className="rounded-full bg-purple-700 bg-opacity-70 text-white border-0 shadow-lg hover:bg-purple-600 transition-all duration-300"
                style={{boxShadow: "0 0 10px rgba(139, 92, 246, 0.5)"}}
              >
                All Tasks
              </Button>
            </motion.div>
            
            {categories.map((category) => (
              <motion.div 
                key={category.id} 
                whileHover={{scale: 1.05}}
                className="m-1"
              >
                <Button 
                  variant="outline" 
                  className="rounded-full glass-panel border-gray-800 text-gray-300 hover:text-white transition-all duration-300"
                  style={{
                    borderLeft: `3px solid ${category.color}`,
                    boxShadow: `0 0 8px rgba(0, 0, 0, 0.3), 0 0 5px ${category.color}`
                  }}
                >
                  <span 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{
                      backgroundColor: category.color,
                      boxShadow: `0 0 5px ${category.color}`
                    }}
                  />
                  {category.name}
                </Button>
              </motion.div>
            ))}
            
            <motion.div 
              whileHover={{scale: 1.05, rotate: 5}} 
              className="m-1"
            >
              <Button 
                variant="outline" 
                className="rounded-full bg-gray-900 bg-opacity-40 text-purple-400 border-dashed border-purple-500 hover:bg-purple-900 hover:bg-opacity-30 transition-all duration-300"
                style={{boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)"}}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Task List */}
          {isLoading ? (
            <div className="text-center py-12 glass-panel rounded-3xl">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto"
                   style={{boxShadow: "0 0 15px rgba(139, 92, 246, 0.7)"}}></div>
              <p className="mt-6 text-purple-300">Loading your tasks...</p>
            </div>
          ) : isTasksEmpty ? (
            <motion.div 
              className="text-center py-16 glass-panel rounded-3xl relative overflow-hidden"
              initial={{opacity: 0, scale: 0.9}}
              animate={{opacity: 1, scale: 1}}
              transition={{duration: 0.5}}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-opacity-5 pointer-events-none">
                <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-purple-500 blur-3xl opacity-10"></div>
                <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-blue-500 blur-3xl opacity-10"></div>
              </div>
              
              <div className="mx-auto w-20 h-20 bg-gray-900 neon-border rounded-full flex items-center justify-center"
                   style={{boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)"}}>
                <CheckCircle className="h-8 w-8 text-purple-400" />
              </div>
              
              <h3 className="mt-6 text-xl font-medium text-white">No tasks yet</h3>
              <p className="mt-3 text-gray-400 max-w-md mx-auto">Get started by adding your first task using the button below</p>
              
              <motion.div 
                whileHover={{scale: 1.05}} 
                className="mt-6 inline-block"
              >
                <Button 
                  className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 px-6"
                  onClick={() => setIsAddTaskModalOpen(true)}
                  style={{boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)"}}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Task
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Today's tasks */}
              {filterTasks(today).length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center mb-6">
                    <div className="w-3 h-10 bg-purple-500 rounded-r-full mr-3" 
                         style={{boxShadow: "0 0 10px rgba(139, 92, 246, 0.7)"}}></div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">Today</h2>
                  </div>
                  
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
                <div className="mb-10">
                  <div className="flex items-center mb-6">
                    <div className="w-3 h-10 bg-blue-500 rounded-r-full mr-3" 
                         style={{boxShadow: "0 0 10px rgba(59, 130, 246, 0.7)"}}></div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">Tomorrow</h2>
                  </div>
                  
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
                <div className="mb-10">
                  <div className="flex items-center mb-6">
                    <div className="w-3 h-10 bg-pink-500 rounded-r-full mr-3" 
                         style={{boxShadow: "0 0 10px rgba(236, 72, 153, 0.7)"}}></div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 text-transparent bg-clip-text">Later</h2>
                  </div>
                  
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
                <motion.div 
                  className="text-center py-12 glass-panel rounded-3xl"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{duration: 0.3}}
                >
                  <div className="mx-auto w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center neon-border">
                    <Search className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-white">No matching tasks</h3>
                  <p className="mt-3 text-gray-400">Try adjusting your search criteria</p>
                  
                  <motion.div 
                    whileHover={{scale: 1.05}} 
                    className="mt-6 inline-block"
                  >
                    <Button 
                      variant="outline" 
                      className="mt-4 rounded-full border-purple-500 text-purple-400 hover:bg-purple-900 hover:bg-opacity-30"
                      onClick={() => setSearchQuery("")}
                      style={{boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)"}}
                    >
                      Clear Search
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
        
        {/* Floating Action Button */}
        <motion.button
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-xl flex items-center justify-center focus:outline-none"
          onClick={() => {
            setEditingTask(undefined);
            setIsAddTaskModalOpen(true);
          }}
          whileHover={{ 
            scale: 1.1, 
            rotate: 15,
            boxShadow: "0 0 25px rgba(139, 92, 246, 0.7)"
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3, type: "spring" }}
          style={{
            boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)"
          }}
        >
          <Plus className="h-8 w-8" />
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
