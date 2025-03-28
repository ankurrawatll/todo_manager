import { useTasks, useCategories } from "@/hooks/use-tasks";
import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TaskCard from "@/components/TaskCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Separator } from "@/components/ui/separator";

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const { data: tasks = [] } = useTasks();
  const { data: categories = [] } = useCategories();

  // Get tasks for selected date
  const tasksForSelectedDate = tasks.filter(
    (task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    }
  );

  // Get tasks data for current month (for chart)
  const getTasksForMonth = () => {
    // Get all days in the current month
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).getDate();
    
    const monthData = Array.from({ length: daysInMonth }, (_, i) => {
      const currentDate = new Date(month.getFullYear(), month.getMonth(), i + 1);
      const tasksForDay = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.getDate() === currentDate.getDate() &&
          taskDate.getMonth() === currentDate.getMonth() &&
          taskDate.getFullYear() === currentDate.getFullYear()
        );
      });
      
      return {
        day: i + 1,
        count: tasksForDay.length,
        date: format(currentDate, 'MMM dd')
      };
    });
    
    return monthData;
  };

  const toggleTaskCompletion = (task: Task) => {
    // Implementation handled in TaskCard via hooks
  };

  const handlePrevMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
  };

  return (
    <div className="p-6 h-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Calendar
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Task Calendar</h2>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handlePrevMonth}
                className="neomorphic border-none bg-transparent hover:bg-blue-800 hover:bg-opacity-20"
              >
                <ChevronLeft className="h-4 w-4 text-blue-400" />
              </Button>
              <h3 className="text-blue-300">{format(month, 'MMMM yyyy')}</h3>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleNextMonth}
                className="neomorphic border-none bg-transparent hover:bg-blue-800 hover:bg-opacity-20"
              >
                <ChevronRight className="h-4 w-4 text-blue-400" />
              </Button>
            </div>
          </div>
          
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && setDate(date)}
            month={month}
            onMonthChange={setMonth}
            className="bg-transparent rounded-lg"
            classNames={{
              day_selected: "bg-blue-800 text-white hover:bg-blue-700 hover:text-white neon-blue-box-shadow",
              day_today: "bg-blue-900 bg-opacity-50 text-white",
              day: cn(
                "hover:bg-blue-800 hover:bg-opacity-20",
                "aria-selected:opacity-100"
              ),
            }}
            components={{
              DayContent: (props) => {
                const dayStr = props.date.toISOString().split('T')[0];
                const tasksOnDay = tasks.filter(task => {
                  return task.dueDate?.split('T')[0] === dayStr;
                });
                
                return (
                  <div className="relative">
                    <div>{props.date.getDate()}</div>
                    {tasksOnDay.length > 0 && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-blue-500 rounded-full" 
                        style={{boxShadow: '0 0 5px #3b82f6'}}></div>
                    )}
                  </div>
                );
              }
            }}
          />
        </div>
        
        <div className="glass-panel p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-blue-400" />
            Tasks Distribution
          </h2>
          
          <div className="h-72 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getTasksForMonth()}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
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
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                  fillOpacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="text-sm text-gray-300">
            Task distribution through the current month
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <Separator className="my-6 bg-gray-700" />
        
        <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Tasks for {format(date, 'MMMM dd, yyyy')}
        </h2>
        
        {tasksForSelectedDate.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasksForSelectedDate.map((task) => (
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
          <div className="glass-panel p-8 rounded-xl text-center">
            <p className="text-lg text-gray-400">No tasks scheduled for this date</p>
            <p className="text-sm text-gray-500 mt-2">
              Select a different date or add a new task with this date
            </p>
          </div>
        )}
      </div>
    </div>
  );
}