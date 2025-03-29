import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import { useState, useEffect } from "react";
import NotificationSnackbar from "./components/NotificationSnackbar";
import AIAssistant from "./components/AIAssistant";

// Import pages
import Calendar from "@/pages/Calendar";
import Reminders from "@/pages/Reminders";
import FilterView from "@/pages/FilterView";
import Intro from "@/pages/Intro";
import Login from "@/pages/Login";

// Import new components as pages
import Leaderboard from "./components/Leaderboard";
import GoalPlanner from "./components/GoalPlanner";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Intro} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/intro" component={Intro} />
      <Route path="/login" component={Login} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/reminders" component={Reminders} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/goals" component={GoalPlanner} />
      <Route path="/filter/:filterType" component={FilterView} />
      <Route path="/category/:categoryId" component={FilterView} />
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

  // Check if we're on intro or login page
  const isAuthRoute = () => {
    return window.location.pathname === '/' || window.location.pathname === '/intro' || window.location.pathname === '/login';
  };

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
      {!isAuthRoute() && <AIAssistant />}
    </QueryClientProvider>
  );
}

export default App;
