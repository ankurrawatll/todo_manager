import { Menu, Bell } from "lucide-react";

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export default function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
  return (
    <div className="md:hidden bg-white border-b border-gray-200 w-full py-3 px-4 flex items-center sticky top-0 z-10">
      <button 
        className="text-gray-500 focus:outline-none mr-4" 
        onClick={onOpenSidebar}
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex items-center space-x-2">
        <span className="material-icons text-primary">check_circle</span>
        <h1 className="text-xl font-bold text-gray-800">TaskFlow</h1>
      </div>
      
      <div className="ml-auto flex items-center space-x-4">
        <button className="text-gray-500 relative">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">U</span>
        </div>
      </div>
    </div>
  );
}
