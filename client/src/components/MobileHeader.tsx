import { Menu, Bell } from "lucide-react";
import { motion } from "framer-motion";

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export default function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
  return (
    <div className="md:hidden glass-panel border-b border-gray-800 w-full py-4 px-5 flex items-center sticky top-0 z-10">
      <motion.button 
        className="text-gray-400 focus:outline-none mr-5 hover:text-white transition-colors" 
        onClick={onOpenSidebar}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="h-6 w-6" />
      </motion.button>
      
      <div className="flex items-center space-x-2">
        <motion.div
          animate={{ 
            rotate: [0, 10, 0, -10, 0],
            scale: [1, 1.1, 1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 5
          }}
        >
          <span className="text-purple-400 neon-text text-xl">✓</span>
        </motion.div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">TaskFlow</h1>
      </div>
      
      <div className="ml-auto flex items-center space-x-4">
        <motion.button 
          className="text-gray-400 relative hover:text-pink-400 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full notification-badge"></span>
        </motion.button>
        
        <motion.div 
          className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center neon-border"
          whileHover={{ scale: 1.1, rotate: 5 }}
          style={{boxShadow: "0 0 10px rgba(139, 92, 246, 0.5)"}}
        >
          <span className="text-sm font-medium text-white">U</span>
        </motion.div>
      </div>
    </div>
  );
}
