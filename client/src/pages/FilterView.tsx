import { useTasks, useCategories } from "@/hooks/use-tasks";
import { useRoute } from "wouter";
import { Task } from "@shared/schema";
import TaskCard from "@/components/TaskCard";
import { 
  Star, CheckCircle, Calendar, Activity,
  BarChart3, PieChart 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, 
  YAxis, CartesianGrid, Tooltip, Legend, BarChart, 
  Bar, PieChart as RechartsPreChart, Pie, Cell 
} from "recharts";
import { isToday, parseISO, format, isThisWeek } from "date-fns";

export default function FilterView() {
  const [, params] = useRoute("/filter/:filterType");
  const [, categoryParams] = useRoute("/category/:categoryId");
  const filterType = params?.filterType;
  const categoryId = categoryParams?.categoryId ? parseInt(categoryParams.categoryId) : undefined;
  
  const { tasks } = useTasks();
  const { categories } = useCategories();

  // Get the current category if we're filtering by category
  const currentCategory = categoryId 
    ? categories.find(cat => cat.id === categoryId) 
    : undefined;

  // Filter tasks based on filter type
  const getFilteredTasks = () => {
    if (categoryId) {
      return tasks.filter(task => task.categoryId === categoryId);
    }
    
    switch(filterType) {
      case "high-priority":
        return tasks.filter(task => task.priority === "high");
      case "today":
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          return isToday(new Date(task.dueDate));
        });
      case "completed":
        return tasks.filter(task => task.completed);
      default:
        return [];
    }
  };
  
  const filteredTasks = getFilteredTasks();
  
  // Generate page title based on filter type
  const getPageTitle = () => {
    if (categoryId && currentCategory) {
      return currentCategory.name;
    }
    
    switch(filterType) {
      case "high-priority":
        return "High Priority Tasks";
      case "today":
        return "Today's Tasks";
      case "completed":
        return "Completed Tasks";
      default:
        return "Tasks";
    }
  };
  
  // Get page icon
  const getPageIcon = () => {
    if (categoryId) {
      return (
        <span 
          className="w-5 h-5 rounded-full mr-3" 
          style={{ 
            backgroundColor: currentCategory?.color || '#9ca3af',
            boxShadow: `0 0 5px ${currentCategory?.color || '#9ca3af'}`
          }}
        />
      );
    }
    
    switch(filterType) {
      case "high-priority":
        return <Star className="mr-3 h-6 w-6 text-red-400" />;
      case "today":
        return <Calendar className="mr-3 h-6 w-6 text-blue-400" />;
      case "completed":
        return <CheckCircle className="mr-3 h-6 w-6 text-green-400" />;
      default:
        return <Activity className="mr-3 h-6 w-6 text-purple-400" />;
    }
  };
  
  // For "today" and "high-priority" views, we'll add some charts
  const getChartComponent = () => {
    if (filterType === "high-priority") {
      // Completion rate for high priority tasks
      const completed = filteredTasks.filter(task => task.completed).length;
      const total = filteredTasks.length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const data = [
        { name: "Completed", value: completed, color: "#10B981" },
        { name: "Remaining", value: total - completed, color: "#EF4444" }
      ];
      
      return (
        <Card className="glass-panel p-6 rounded-xl border-none">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <PieChart className="mr-2 h-5 w-5 text-red-400" />
            High Priority Completion Rate
          </h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPreChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ filter: `drop-shadow(0 0 4px ${entry.color})` }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151',
                    color: '#F9FAFB' 
                  }}
                />
              </RechartsPreChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-3xl font-bold text-red-400">{completionRate}%</div>
            <div className="text-gray-400">Completion Rate</div>
          </div>
        </Card>
      );
    }
    
    if (filterType === "today") {
      // Show task distribution by category for today
      const categoryCounts = categories.map(category => {
        const count = filteredTasks.filter(task => task.categoryId === category.id).length;
        return {
          name: category.name,
          count,
          color: category.color
        };
      }).filter(item => item.count > 0);
      
      return (
        <Card className="glass-panel p-6 rounded-xl border-none">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-blue-400" />
            Today's Tasks by Category
          </h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryCounts}
                margin={{ top: 20, right: 20, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9CA3AF' }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151',
                    color: '#F9FAFB' 
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Bar 
                  dataKey="count" 
                  name="Tasks" 
                  radius={[4, 4, 0, 0]}
                >
                  {categoryCounts.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ filter: `drop-shadow(0 0 3px ${entry.color})` }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      );
    }
    
    if (filterType === "completed") {
      // Show completion trend over time (last 7 days)
      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return date;
      });
      
      const completionData = last7Days.map(date => {
        const formattedDate = format(date, "yyyy-MM-dd");
        const tasksCompletedOnDay = tasks.filter(task => {
          // Only count tasks completed on this specific day
          if (!task.completed) return false;
          const completedOn = task.completedAt 
            ? parseISO(task.completedAt) 
            : undefined;
          
          return completedOn && 
            format(completedOn, "yyyy-MM-dd") === formattedDate;
        }).length;
        
        return {
          date: format(date, "MMM dd"),
          completed: tasksCompletedOnDay
        };
      });
      
      return (
        <Card className="glass-panel p-6 rounded-xl border-none">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-green-400" />
            Completion Trend
          </h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={completionData}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151',
                    color: '#F9FAFB' 
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Legend 
                  wrapperStyle={{ color: '#9CA3AF' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  name="Tasks Completed" 
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: '#10B981', strokeWidth: 0 }}
                  style={{ filter: 'drop-shadow(0 0 3px #10B981)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      );
    }
    
    if (categoryId) {
      // For category views, show task status breakdown
      const completed = filteredTasks.filter(task => task.completed).length;
      const dueSoon = filteredTasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        const dueDate = new Date(task.dueDate);
        return isThisWeek(dueDate);
      }).length;
      const total = filteredTasks.length;
      
      const data = [
        { name: "Completed", value: completed, color: "#10B981" },
        { name: "Due Soon", value: dueSoon, color: "#F59E0B" },
        { name: "Pending", value: total - completed - dueSoon, color: "#3B82F6" }
      ].filter(item => item.value > 0);
      
      return (
        <Card className="glass-panel p-6 rounded-xl border-none">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            {getPageIcon()}
            <span>Status Breakdown</span>
          </h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPreChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ filter: `drop-shadow(0 0 4px ${entry.color})` }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151',
                    color: '#F9FAFB' 
                  }}
                />
              </RechartsPreChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-3xl font-bold" style={{ color: currentCategory?.color || '#9ca3af' }}>
              {total}
            </div>
            <div className="text-gray-400">Total Tasks</div>
          </div>
        </Card>
      );
    }
    
    return null;
  };
  
  const toggleTaskCompletion = async (task: Task) => {
    // Implementation handled in TaskCard via hooks
  };

  return (
    <div className="p-6 h-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <h1 className="text-3xl font-bold mb-8 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        {getPageIcon()}
        {getPageTitle()}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  categories={categories}
                  onToggleStatus={toggleTaskCompletion}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          ) : (
            <Card className="glass-panel p-8 text-center border-none">
              <p className="text-lg text-gray-400">No tasks found</p>
              <p className="text-sm text-gray-500 mt-2">
                {filterType === "high-priority" && "Create high priority tasks to see them here"}
                {filterType === "today" && "Create tasks due today to see them here"}
                {filterType === "completed" && "Complete tasks to see them here"}
                {categoryId && "Add tasks to this category to see them here"}
              </p>
            </Card>
          )}
        </div>
        
        {getChartComponent()}
      </div>
    </div>
  );
}