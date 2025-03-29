import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  CheckCircle, 
  LayoutDashboard, 
  Calendar, 
  Bell, 
  Settings, 
  AlertCircle,
  Trophy,
  Target,
  Brain
} from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { useCategories } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { stats } = useTasks();
  const { categories } = useCategories();
  
  return (
    <aside className={cn(
      "glass-panel border-r border-gray-800 w-full md:w-64 md:flex md:flex-col md:fixed md:inset-y-0 z-10 transform transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="p-4 flex justify-between items-center border-b border-gray-800 md:h-16">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-purple-400 neon-text" />
          <h1 className="text-xl font-bold neon-text bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">TaskFlow</h1>
        </div>
        <button 
          className="md:hidden text-gray-300 hover:text-white focus:outline-none" 
          onClick={onClose}
        >
          <span className="material-icons">close</span>
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="mb-8">
          <h2 className="text-xs uppercase font-semibold text-purple-300 tracking-wider mb-3">Menu</h2>
          <ul className="space-y-3">
            <li className="hover-scale">
              <Link href="/dashboard">
                <div className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer ${
                  location === "/dashboard" 
                    ? "neon-border text-white bg-opacity-20 bg-purple-900" 
                    : "text-gray-300 hover:text-white hover:bg-opacity-10 hover:bg-purple-800 transition-all duration-300"
                }`}>
                  <LayoutDashboard className={`mr-3 h-5 w-5 ${location === "/dashboard" ? "text-purple-400" : "text-gray-400"}`} />
                  <span>Dashboard</span>
                </div>
              </Link>
            </li>
            <li className="hover-scale">
              <Link href="/calendar">
                <div className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer ${
                  location === "/calendar" 
                    ? "neon-blue-border text-white bg-opacity-20 bg-blue-900" 
                    : "text-gray-300 hover:text-white hover:bg-opacity-10 hover:bg-blue-800 transition-all duration-300"
                }`}>
                  <Calendar className={`mr-3 h-5 w-5 ${location === "/calendar" ? "text-blue-400" : "text-gray-400"}`} />
                  <span>Calendar</span>
                </div>
              </Link>
            </li>
            <li className="hover-scale">
              <Link href="/reminders">
                <div className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer ${
                  location === "/reminders" 
                    ? "neon-pink-border text-white bg-opacity-20 bg-pink-900" 
                    : "text-gray-300 hover:text-white hover:bg-opacity-10 hover:bg-pink-800 transition-all duration-300"
                }`}>
                  <Bell className={`mr-3 h-5 w-5 ${location === "/reminders" ? "text-pink-400" : "text-gray-400"}`} />
                  <span>Reminders</span>
                  {stats.dueToday > 0 && (
                    <span className="ml-auto bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {stats.dueToday}
                    </span>
                  )}
                </div>
              </Link>
            </li>
            <li className="hover-scale">
              <Link href="/goals">
                <div className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer ${
                  location === "/goals" 
                    ? "neon-green-border text-white bg-opacity-20 bg-emerald-900" 
                    : "text-gray-300 hover:text-white hover:bg-opacity-10 hover:bg-emerald-800 transition-all duration-300"
                }`}>
                  <Brain className={`mr-3 h-5 w-5 ${location === "/goals" ? "text-emerald-400" : "text-gray-400"}`} />
                  <span>Goal Planner</span>
                </div>
              </Link>
            </li>
            <li className="hover-scale">
              <Link href="/leaderboard">
                <div className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer ${
                  location === "/leaderboard" 
                    ? "neon-yellow-border text-white bg-opacity-20 bg-amber-900" 
                    : "text-gray-300 hover:text-white hover:bg-opacity-10 hover:bg-amber-800 transition-all duration-300"
                }`}>
                  <Trophy className={`mr-3 h-5 w-5 ${location === "/leaderboard" ? "text-amber-400" : "text-gray-400"}`} />
                  <span>Leaderboard</span>
                </div>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase font-semibold text-blue-300 tracking-wider">Categories</h2>
            <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
              <span className="text-sm">+</span> Add New
            </button>
          </div>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id} className="hover-scale">
                <Link href={`/category/${category.id}`}>
                  <div className="flex items-center px-3 py-2 text-gray-300 rounded-lg neomorphic transition-all duration-300 hover:text-white cursor-pointer">
                    <span 
                      className="w-3 h-3 rounded-full mr-3" 
                      style={{ 
                        backgroundColor: category.color,
                        boxShadow: `0 0 5px ${category.color}`
                      }}
                    />
                    <span>{category.name}</span>
                    <span className="ml-auto text-gray-400 text-sm">
                      {/* Count could be added here */}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h2 className="text-xs uppercase font-semibold text-pink-300 tracking-wider mb-3">Filters</h2>
          <ul className="space-y-2">
            <li className="hover-scale">
              <Link href="/filter/high-priority">
                <div className="flex items-center px-3 py-2 text-gray-300 rounded-lg neomorphic hover:text-white transition-all duration-300 cursor-pointer">
                  <span className="w-3 h-3 rounded-full bg-red-500 mr-3" style={{boxShadow: '0 0 5px #ef4444'}}></span>
                  <span>High Priority</span>
                </div>
              </Link>
            </li>
            <li className="hover-scale">
              <Link href="/filter/today">
                <div className="flex items-center px-3 py-2 text-gray-300 rounded-lg neomorphic hover:text-white transition-all duration-300 cursor-pointer">
                  <span className="mr-3 text-blue-400 text-sm" style={{textShadow: '0 0 3px #60a5fa'}}>●</span>
                  <span>Today</span>
                </div>
              </Link>
            </li>
            <li className="hover-scale">
              <Link href="/filter/completed">
                <div className="flex items-center px-3 py-2 text-gray-300 rounded-lg neomorphic hover:text-white transition-all duration-300 cursor-pointer">
                  <span className="mr-3 text-green-400 text-sm" style={{textShadow: '0 0 3px #4ade80'}}>✓</span>
                  <span>Completed</span>
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center glass-panel p-2 rounded-xl">
          <div className="w-9 h-9 rounded-full neon-border bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-white">SJ</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">User</p>
            <p className="text-xs text-gray-400">user@example.com</p>
          </div>
          <button className="ml-auto text-blue-400 hover:text-blue-300 transition-colors p-1 rounded-full hover:bg-blue-900 hover:bg-opacity-20">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
