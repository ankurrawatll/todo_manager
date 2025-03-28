import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  trend = "neutral",
}: StatCardProps) {
  // Get color based on title for the card glow
  const getGlowColor = () => {
    if (title.includes("Total")) return "rgba(139, 92, 246, 0.5)"; // purple
    if (title.includes("Due")) return "rgba(245, 158, 11, 0.5)"; // amber
    if (title.includes("Completed")) return "rgba(16, 185, 129, 0.5)"; // emerald
    if (title.includes("High")) return "rgba(239, 68, 68, 0.5)"; // red
    return "rgba(139, 92, 246, 0.5)"; // default purple
  };

  return (
    <motion.div
      className="glass-panel rounded-xl neomorphic p-6 relative overflow-hidden"
      style={{
        boxShadow: `0 0 15px ${getGlowColor()}`
      }}
      whileHover={{ 
        y: -5,
        boxShadow: `0 0 25px ${getGlowColor()}`,
        scale: 1.03
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-2xl bg-opacity-10 blur-lg" 
           style={{background: getGlowColor(), filter: "blur(25px)"}} />
           
      <div className="flex items-center mb-4">
        <div className={cn("p-3 rounded-lg neon-border", `bg-opacity-20 ${iconColor}`)}
          style={{boxShadow: `0 0 10px ${getGlowColor()}`}}>
          {icon}
        </div>
        <h3 className="ml-3 text-lg font-semibold text-white">{title}</h3>
      </div>
      
      <motion.p 
        className="text-4xl font-bold text-white"
        initial={{ scale: 0.8, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
      >
        {value}
      </motion.p>
      
      <div className="flex items-center mt-2 text-sm">
        {trend === "up" && (
          <span className="text-green-400 text-sm" style={{textShadow: "0 0 5px #10b981"}}>↑</span>
        )}
        {trend === "down" && (
          <span className="text-red-400 text-sm" style={{textShadow: "0 0 5px #ef4444"}}>↓</span>
        )}
        <span className={cn(
          "ml-2",
          trend === "up" ? "text-green-400" : 
          trend === "down" ? "text-red-400" : "text-gray-400"
        )}>
          {subtitle}
        </span>
      </div>
    </motion.div>
  );
}
