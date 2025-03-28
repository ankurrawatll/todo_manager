import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  CheckCircle, 
  LayoutDashboard, 
  Calendar, 
  Bell, 
  Settings, 
  AlertCircle
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
      "bg-white border-r border-gray-200 w-full md:w-64 md:flex md:flex-col md:fixed md:inset-y-0 z-10 transform transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="p-4 flex justify-between items-center border-b border-gray-200 md:h-16">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-gray-800">TaskFlow</h1>
        </div>
        <button 
          className="md:hidden text-gray-500 focus:outline-none" 
          onClick={onClose}
        >
          <span className="material-icons">close</span>
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="mb-8">
          <h2 className="text-xs uppercase font-semibold text-gray-500 tracking-wider mb-2">Menu</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/">
                <a className={`flex items-center px-3 py-2 text-gray-700 rounded-lg ${
                  location === "/" ? "bg-gray-100 text-gray-800" : "hover:bg-gray-100 transition-colors duration-200"
                }`}>
                  <LayoutDashboard className="mr-3 h-5 w-5 text-primary" />
                  <span>Dashboard</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/calendar">
                <a className={`flex items-center px-3 py-2 text-gray-700 rounded-lg ${
                  location === "/calendar" ? "bg-gray-100 text-gray-800" : "hover:bg-gray-100 transition-colors duration-200"
                }`}>
                  <Calendar className="mr-3 h-5 w-5 text-gray-500" />
                  <span>Calendar</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/reminders">
                <a className={`flex items-center px-3 py-2 text-gray-700 rounded-lg ${
                  location === "/reminders" ? "bg-gray-100 text-gray-800" : "hover:bg-gray-100 transition-colors duration-200"
                }`}>
                  <Bell className="mr-3 h-5 w-5 text-gray-500" />
                  <span>Reminders</span>
                  {stats.dueToday > 0 && (
                    <span className="ml-auto bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full notification-badge">
                      {stats.dueToday}
                    </span>
                  )}
                </a>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Categories</h2>
            <button className="text-primary text-sm hover:underline">Add New</button>
          </div>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/category/${category.id}`}>
                  <a className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <span 
                      className="w-3 h-3 rounded-full mr-3" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                    <span className="ml-auto text-gray-500 text-sm">
                      {/* Count could be added here */}
                    </span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h2 className="text-xs uppercase font-semibold text-gray-500 tracking-wider mb-2">Filters</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/filter/high-priority">
                <a className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <span className="w-3 h-3 rounded-full bg-red-500 mr-3"></span>
                  <span>High Priority</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/filter/today">
                <a className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <span className="material-icons mr-3 text-gray-500 text-sm">today</span>
                  <span>Today</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/filter/completed">
                <a className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <span className="material-icons mr-3 text-gray-500 text-sm">check_circle</span>
                  <span>Completed</span>
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-gray-600">SJ</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">User</p>
            <p className="text-xs text-gray-500">user@example.com</p>
          </div>
          <button className="ml-auto text-gray-500 hover:text-gray-700">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
