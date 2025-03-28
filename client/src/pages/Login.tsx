import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowLeft, User, Lock, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Login() {
  const [_, navigate] = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [aiTipVisible, setAiTipVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just navigate to dashboard without authentication
    navigate("/dashboard");
  };

  const toggleView = () => {
    setIsSignUp(!isSignUp);
  };

  // AI Assistant tips
  const showRandomTip = () => {
    setAiTipVisible(true);
    setTimeout(() => {
      setAiTipVisible(false);
    }, 8000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-slate-800 text-white flex flex-col justify-center items-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 text-gray-400 hover:text-white"
          onClick={() => navigate("/intro")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to intro
        </Button>

        <div className="glass-panel rounded-2xl p-8 border-none">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center neon-border">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              )}

              {!isSignUp && (
                <div className="flex justify-end">
                  <Button
                    variant="link"
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto text-sm"
                  >
                    Forgot password?
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 neon-blue-box-shadow border-none"
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <Button
                variant="link"
                onClick={toggleView}
                className="text-blue-400 hover:text-blue-300 p-0 h-auto text-sm ml-1"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </Button>
            </p>
          </div>
        </div>

        {/* AI Assistant tip button */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="ghost"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
            onClick={showRandomTip}
          >
            <Brain className="h-4 w-4" />
            <span>AI Assistant Tips</span>
          </Button>
        </div>

        {/* AI Tip Popup */}
        {aiTipVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            <Card className="glass-panel border-none p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-400 mb-1">TaskFlow AI</h4>
                  <p className="text-sm text-gray-300">
                    Using the "Ideas Cloud" feature, you can get AI-generated insights related to your tasks, helping you with time management and productivity tips.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}