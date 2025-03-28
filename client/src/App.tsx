import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import { useState, useEffect } from "react";
import NotificationSnackbar from "./components/NotificationSnackbar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  }>({
    message: "",
    type: "info",
    visible: false,
  });

  // Global function to show notifications - used for reminders and task status updates
  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setNotification({
      message,
      type,
      visible: true,
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification((prev) => ({
        ...prev,
        visible: false,
      }));
    }, 5000);
  };

  // Dismiss notification manually
  const dismissNotification = () => {
    setNotification((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  // Provide the notification functions to all components via window for task reminders
  useEffect(() => {
    (window as any).showTaskNotification = showNotification;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
      <NotificationSnackbar
        message={notification.message}
        type={notification.type}
        visible={notification.visible}
        onDismiss={dismissNotification}
      />
    </QueryClientProvider>
  );
}

export default App;
