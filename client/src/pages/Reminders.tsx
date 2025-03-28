import { useTasks, useCategories } from "@/hooks/use-tasks";
import { useState } from "react";
import { Bell, Calendar, Clock } from "lucide-react";
import { Task } from "@shared/schema";
import TaskCard from "@/components/TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { format, isToday, addDays, isTomorrow, isThisWeek, isAfter } from "date-fns";

export default function Reminders() {
  const { data: tasks = [] } = useTasks();
  const { data: categories = [] } = useCategories();
  const [activeTab, setActiveTab] = useState("today");

  // Filter tasks for different time periods
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    return isToday(new Date(task.dueDate));
  });

  const tomorrowTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    return isTomorrow(new Date(task.dueDate));
  });

  const upcomingTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return isThisWeek(dueDate) && !isToday(dueDate) && !isTomorrow(dueDate);
  });

  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    return !task.completed && isAfter(new Date(), new Date(task.dueDate));
  });

  // Prepare data for pie chart
  const getPriorityData = () => {
    const highPriority = tasks.filter(task => task.priority === "high").length;
    const mediumPriority = tasks.filter(task => task.priority === "medium").length;
    const lowPriority = tasks.filter(task => task.priority === "low").length;
    
    return [
      { name: "High", value: highPriority, color: "#ef4444" },
      { name: "Medium", value: mediumPriority, color: "#f59e0b" },
      { name: "Low", value: lowPriority, color: "#3b82f6" }
    ].filter(item => item.value > 0);
  };

  const toggleTaskCompletion = (task: Task) => {
    // Implementation handled in TaskCard via hooks
  };

  // Schedule all future reminders - this would be expanded in a production app
  const scheduleAllReminders = () => {
    window.showTaskNotification("All reminders scheduled", "success");
  };

  return (
    <div className="p-6 h-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
          Reminders
        </h1>
        <Button 
          className="mt-4 md:mt-0 neon-pink-box-shadow bg-gradient-to-r from-pink-600 to-purple-600 border-none"
          onClick={scheduleAllReminders}
        >
          <Bell className="mr-2 h-4 w-4" />
          Schedule All Reminders
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8 glass-panel border-none">
              <TabsTrigger 
                value="today" 
                className="data-[state=active]:bg-pink-900 data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Today
                {todayTasks.length > 0 && (
                  <span className="ml-2 bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {todayTasks.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="tomorrow"
                className="data-[state=active]:bg-purple-900 data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Tomorrow
                {tomorrowTasks.length > 0 && (
                  <span className="ml-2 bg-purple-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {tomorrowTasks.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="upcoming"
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                This Week
              </TabsTrigger>
              <TabsTrigger 
                value="overdue"
                className="data-[state=active]:bg-red-900 data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Overdue
                {overdueTasks.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {overdueTasks.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="mt-0">
              {todayTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todayTasks.map((task) => (
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
                  <p className="text-lg text-gray-400">No tasks scheduled for today</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Enjoy your free time or add a new task
                  </p>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="tomorrow" className="mt-0">
              {tomorrowTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tomorrowTasks.map((task) => (
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
                  <p className="text-lg text-gray-400">No tasks scheduled for tomorrow</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Plan ahead by adding tasks for tomorrow
                  </p>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-0">
              {upcomingTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingTasks.map((task) => (
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
                  <p className="text-lg text-gray-400">No upcoming tasks this week</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your schedule is clear for the week ahead
                  </p>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="overdue" className="mt-0">
              {overdueTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overdueTasks.map((task) => (
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
                  <p className="text-lg text-gray-400">No overdue tasks</p>
                  <p className="text-sm text-gray-500 mt-2">
                    You're all caught up!
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="glass-panel p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-6">Priority Distribution</h2>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getPriorityData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {getPriorityData().map((entry, index) => (
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
                  formatter={(value, name) => [`${value} tasks`, name]}
                />
                <Legend 
                  formatter={(value) => <span style={{ color: '#D1D5DB' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg neomorphic">
              <div className="flex items-center">
                <Calendar className="mr-3 h-5 w-5 text-pink-400" />
                <span>Today's Tasks</span>
              </div>
              <span className="text-pink-400 font-semibold">{todayTasks.length}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg neomorphic">
              <div className="flex items-center">
                <Clock className="mr-3 h-5 w-5 text-red-400" />
                <span>Overdue Tasks</span>
              </div>
              <span className="text-red-400 font-semibold">{overdueTasks.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}