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
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center mb-4">
        <div className={cn("p-2 rounded-lg", `bg-opacity-10 ${iconColor}`)}>
          {icon}
        </div>
        <h3 className="ml-2 text-lg font-semibold text-gray-700">{title}</h3>
      </div>
      <motion.p 
        className="text-3xl font-bold text-gray-900"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {value}
      </motion.p>
      <div className="flex items-center mt-2 text-sm">
        {trend === "up" && (
          <span className="material-icons text-green-500 text-sm">trending_up</span>
        )}
        {trend === "down" && (
          <span className="material-icons text-red-500 text-sm">trending_down</span>
        )}
        <span className={cn(
          "ml-1",
          trend === "up" ? "text-green-500" : 
          trend === "down" ? "text-red-500" : "text-gray-500"
        )}>
          {subtitle}
        </span>
      </div>
    </motion.div>
  );
}
