import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, AlertTriangle, X } from "lucide-react";

interface NotificationSnackbarProps {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
  onDismiss: () => void;
}

export default function NotificationSnackbar({
  message,
  type,
  visible,
  onDismiss,
}: NotificationSnackbarProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <Bell className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white py-3 px-4 rounded-lg shadow-lg"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="flex items-center">
            {getIcon()}
            <span className="ml-2">{message}</span>
            <button
              className="ml-4 text-gray-300 hover:text-white focus:outline-none"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
