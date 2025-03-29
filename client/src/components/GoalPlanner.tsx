import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Milestone, Target, Brain, Calendar, Sparkles, ListTodo, BadgeHelp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Form schema for goal creation
const formSchema = z.object({
  goal: z.string().min(2, {
    message: 'Goal title must be at least 2 characters.',
  }),
  details: z.string().optional(),
  timeframe: z.enum(['short-term', 'medium-term', 'long-term']),
  category: z.string().min(1, {
    message: 'Please select a category.',
  }),
});

type GoalFormValues = z.infer<typeof formSchema>;

// Helper component for displaying a roadmap milestone
const MilestoneCard = ({ milestone, index }: { milestone: any, index: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="mb-4"
    >
      <Card className="bg-black/30 border-purple-900/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Milestone className="h-5 w-5 mr-2 text-purple-400" />
              <CardTitle className="text-white text-lg">{milestone.title}</CardTitle>
            </div>
            <Badge variant="outline" className="bg-purple-900/30">
              {milestone.duration || '2-4 weeks'}
            </Badge>
          </div>
          <CardDescription className="text-gray-400">
            {milestone.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center">
            <ListTodo className="h-4 w-4 mr-1" /> Tasks
          </h4>
          <ul className="space-y-2">
            {milestone.tasks?.map((task: any, idx: number) => (
              <li key={idx} className="text-sm bg-black/20 p-3 rounded-md border border-purple-900/30">
                <div className="flex justify-between">
                  <span className="font-medium text-white">{task.title}</span>
                  <Badge 
                    className={
                      task.priority === 'high' ? 'bg-red-900/50' : 
                      task.priority === 'medium' ? 'bg-amber-900/50' : 
                      'bg-green-900/50'
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-gray-400 mt-1">{task.description}</p>
                {task.estimated_time && (
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" /> {task.estimated_time}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Helper component for weekly plan display
const WeeklyPlanSection = ({ weeklyPlan }: { weeklyPlan: any[] }) => {
  return (
    <div className="space-y-4">
      {weeklyPlan?.map((week, idx) => (
        <Card key={idx} className="bg-black/30 border-purple-900/40">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-400" />
              <CardTitle className="text-white text-lg">Week {week.week}</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Focus: {week.focus}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {week.tasks?.map((task: string, taskIdx: number) => (
                <li key={taskIdx} className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-blue-900/30 flex-shrink-0 flex items-center justify-center mr-2 mt-0.5 text-xs border border-blue-700/30">
                    {taskIdx + 1}
                  </div>
                  <span className="text-gray-300 text-sm">{task}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Main component for goal planning
export default function GoalPlanner() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('create');
  const { toast } = useToast();

  // Initialize form
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: '',
      details: '',
      timeframe: 'medium-term',
      category: 'career',
    },
  });

  // Handle form submission
  const onSubmit = async (values: GoalFormValues) => {
    setIsGenerating(true);
    try {
      // Prepare the payload for the API
      const requestData = {
        title: values.goal,
        description: values.details || '',
        category: values.category,
        timeframe: values.timeframe,
      };
      
      const response = await apiRequest('/api/ai/generate-roadmap', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response && response.roadmap) {
        // Check if the roadmap has an error message
        if (response.roadmap.error) {
          toast({
            title: 'Generation Issue',
            description: response.roadmap.overview || response.roadmap.error,
            variant: 'destructive',
          });
        } else {
          setRoadmap(response.roadmap);
          setActiveTab('roadmap');
          toast({
            title: 'Roadmap Generated with Gemini',
            description: 'Your goal roadmap has been created successfully!',
          });
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate your roadmap. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save roadmap and create tasks
  const saveRoadmap = async () => {
    if (!roadmap) return;

    try {
      // First save the goal
      const goalData = {
        title: form.getValues('goal'),
        description: form.getValues('details'),
        category: form.getValues('category'),
        timeframe: form.getValues('timeframe'),
        roadmap: roadmap,
      };

      const savedGoal = await apiRequest('/api/goals', {
        method: 'POST',
        body: JSON.stringify(goalData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Then create the first milestone's tasks
      if (roadmap.milestones && roadmap.milestones.length > 0) {
        const firstMilestone = roadmap.milestones[0];
        
        // Create tasks from the milestone
        for (const task of firstMilestone.tasks || []) {
          const taskData = {
            title: task.title,
            description: task.description,
            priority: task.priority,
            difficulty: task.difficulty || "normal",
            isGoalTask: true,
            goalId: savedGoal.id,
            status: "incomplete"
          };

          await apiRequest('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
      }

      toast({
        title: 'Roadmap Saved',
        description: 'Goal and initial tasks have been created successfully!',
      });
      
      // Reset form and roadmap
      form.reset();
      setRoadmap(null);
      setActiveTab('create');
      
    } catch (error) {
      console.error('Error saving roadmap:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save your roadmap. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="glass-panel neomorphic rounded-xl p-6 relative overflow-hidden w-full">
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-600/10 blur-2xl" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-white flex items-center">
              <Brain className="h-6 w-6 mr-2 text-purple-400" /> Gemini Goal Planner
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Create personalized roadmaps for your life and career goals
            </p>
          </div>
          
          <TabsList className="grid grid-cols-2 bg-black/30 border border-purple-900/40">
            <TabsTrigger value="create" disabled={isGenerating}>
              Create
            </TabsTrigger>
            <TabsTrigger value="roadmap" disabled={!roadmap}>
              Roadmap
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="create" className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Goal Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Become an Army Officer" 
                          className="bg-black/20 border-purple-900/40 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-black/20 border-purple-900/40 text-white">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-purple-800">
                            <SelectItem value="career">Career</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="health">Health & Fitness</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="personal">Personal Growth</SelectItem>
                            <SelectItem value="skills">Skills Development</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="timeframe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Timeframe</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-black/20 border-purple-900/40 text-white">
                              <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-purple-800">
                            <SelectItem value="short-term">Short-term (1-3 months)</SelectItem>
                            <SelectItem value="medium-term">Medium-term (3-12 months)</SelectItem>
                            <SelectItem value="long-term">Long-term (1+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Additional Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your goal in more detail. What's your current situation? Any specific challenges or requirements?" 
                        className="min-h-[120px] bg-black/20 border-purple-900/40 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin mr-2">⚙️</span> 
                    Generating Your Roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> 
                    Generate Gemini Roadmap
                  </>
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 p-4 border border-purple-900/30 rounded-lg bg-black/20">
            <div className="flex items-center mb-2">
              <BadgeHelp className="h-5 w-5 mr-2 text-purple-400" />
              <h3 className="text-white font-medium">Tips for Better Roadmaps</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Be specific about your goal - the more details, the better the plan</li>
              <li>• Include your current skill level and any relevant experience</li>
              <li>• Mention any constraints like time availability or resources</li>
              <li>• For career goals, include industry specifics and target roles</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="roadmap" className="space-y-6">
          {roadmap && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-purple-900/30 bg-black/20 mb-6"
              >
                <h3 className="text-lg font-medium text-white mb-2">Overview</h3>
                <p className="text-gray-300">{roadmap.overview || roadmap.summary}</p>
              </motion.div>
              
              <Tabs defaultValue="milestones">
                <TabsList className="grid grid-cols-3 bg-black/30 border border-purple-900/40 mb-4">
                  <TabsTrigger value="milestones">
                    <Milestone className="h-4 w-4 mr-2" /> Milestones
                  </TabsTrigger>
                  <TabsTrigger value="weekly">
                    <Calendar className="h-4 w-4 mr-2" /> Weekly Plan
                  </TabsTrigger>
                  <TabsTrigger value="resources">
                    <Target className="h-4 w-4 mr-2" /> Resources
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="milestones">
                  <div className="space-y-4">
                    {roadmap.milestones?.map((milestone: any, idx: number) => (
                      <MilestoneCard key={idx} milestone={milestone} index={idx} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="weekly">
                  <WeeklyPlanSection 
                    weeklyPlan={roadmap.weekly_plan || roadmap.weeklyPlan || []} 
                  />
                </TabsContent>
                
                <TabsContent value="resources">
                  <Card className="bg-black/30 border-purple-900/40">
                    <CardHeader>
                      <CardTitle className="text-white">Resources & Tips</CardTitle>
                      <CardDescription>Helpful resources to support your journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {roadmap.resources && roadmap.resources.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-purple-300 mb-2">Resources</h4>
                          <ul className="space-y-2">
                            {roadmap.resources.map((resource: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-300 bg-black/20 p-3 rounded-md border border-purple-900/30">
                                {resource}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {roadmap.tips && roadmap.tips.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-purple-300 mb-2">Tips for Success</h4>
                          <ul className="space-y-2">
                            {roadmap.tips.map((tip: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-300 flex">
                                <span className="text-purple-400 mr-2">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {roadmap.challenges && roadmap.challenges.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-purple-300 mb-2">Potential Challenges</h4>
                          <ul className="space-y-2">
                            {roadmap.challenges.map((challenge: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-300 flex">
                                <span className="text-amber-400 mr-2">!</span>
                                {challenge}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {roadmap.success_metrics && roadmap.success_metrics.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-purple-300 mb-2">Success Metrics</h4>
                          <ul className="space-y-2">
                            {roadmap.success_metrics.map((metric: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-300 flex">
                                <span className="text-green-400 mr-2">✓</span>
                                {metric}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('create')}
                  className="border-purple-900/40 bg-black/20 hover:bg-purple-900/20"
                >
                  Edit Goal
                </Button>
                
                <Button 
                  onClick={saveRoadmap}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                >
                  <ListTodo className="mr-2 h-4 w-4" />
                  Save & Create Tasks
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}