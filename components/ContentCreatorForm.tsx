"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Sparkles, Calendar, Hash, Image, Clock } from "lucide-react";

interface FormData {
  creatorType: string;
  platform: string;
  contentGoal: string;
  targetAudience: string;
}

const creatorTypes = [
  { value: "fitness", label: "Fitness & Health", icon: "💪" },
  { value: "tech", label: "Technology", icon: "💻" },
  { value: "beauty", label: "Beauty & Skincare", icon: "✨" },
  { value: "gaming", label: "Gaming", icon: "🎮" },
  { value: "cooking", label: "Cooking & Food", icon: "🍳" },
  { value: "travel", label: "Travel & Lifestyle", icon: "✈️" },
  { value: "business", label: "Business & Finance", icon: "💼" },
  { value: "education", label: "Education & Learning", icon: "📚" },
];

const platforms = [
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "youtube-shorts", label: "YouTube Shorts", icon: "📺" },
  { value: "instagram", label: "Instagram Reels", icon: "📸" },
  { value: "instagram-stories", label: "Instagram Stories", icon: "📱" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
];

interface GeneratedPlan {
  creatorType: string;
  platform: string;
  plan: any;
  trendingTopics?: string[];
}

export default function ContentCreatorForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [userId] = useState("demo-user-123"); // In a real app, this would come from auth
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  
  const selectedCreatorType = watch("creatorType");
  const selectedPlatform = watch("platform");

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorType: data.creatorType,
          platform: data.platform,
          contentGoal: data.contentGoal,
          targetAudience: data.targetAudience,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content plan');
      }

      const result = await response.json();
      
      setGeneratedPlan({
        creatorType: data.creatorType,
        platform: data.platform,
        plan: result.data.contentPlan,
        trendingTopics: result.data.trendingTopics,
      });
    } catch (error) {
      console.error('Error generating content:', error);
      // Fallback to mock data if API fails
      setGeneratedPlan({
        creatorType: data.creatorType,
        platform: data.platform,
        plan: generateMockPlan(data.creatorType, data.platform),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlan = async () => {
    if (!generatedPlan) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/save-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          creatorType: generatedPlan.creatorType,
          platform: generatedPlan.platform,
          contentPlan: generatedPlan.plan,
          trendingTopics: generatedPlan.trendingTopics,
        }),
      });

      if (response.ok) {
        alert('Content plan saved successfully!');
      } else {
        throw new Error('Failed to save plan');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save content plan');
    } finally {
      setIsSaving(false);
    }
  };

  const generateMockPlan = (creatorType: string, platform: string) => {
    const plans = {
      fitness: {
        "Day 1": {
          title: "Morning Workout Routine",
          caption: "Start your day with energy! This 10-minute routine will get your blood flowing and set the tone for success. #MorningWorkout #FitnessMotivation #HealthyLifestyle",
          hashtags: "#MorningWorkout #FitnessMotivation #HealthyLifestyle #WorkoutRoutine #FitnessTips #GetFit #Exercise #Motivation",
          time: "6:00 AM",
          thumbnail: "💪"
        },
        "Day 2": {
          title: "Healthy Breakfast Ideas",
          caption: "Fuel your body right! These protein-packed breakfast options will keep you energized all morning. #HealthyEating #BreakfastIdeas #Nutrition #FitnessFood",
          hashtags: "#HealthyEating #BreakfastIdeas #Nutrition #FitnessFood #Protein #HealthyRecipes #MealPrep #Wellness",
          time: "7:30 AM",
          thumbnail: "🥗"
        },
        "Day 3": {
          title: "5-Minute Core Workout",
          caption: "No equipment needed! Strengthen your core with these simple exercises you can do anywhere. #CoreWorkout #HomeWorkout #FitnessTips #NoEquipment",
          hashtags: "#CoreWorkout #HomeWorkout #FitnessTips #NoEquipment #Abs #StrengthTraining #QuickWorkout #FitnessMotivation",
          time: "8:00 PM",
          thumbnail: "🔥"
        }
      }
    };
    
    return plans[creatorType as keyof typeof plans] || plans.fitness;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Sparkles className="h-10 w-10 text-primary" />
          AI Content Creator
        </h1>
        <p className="text-xl text-muted-foreground">
          Generate viral content plans tailored to your niche and platform
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg border p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Creator Type Selection */}
          <div>
            <label className="block text-lg font-semibold mb-4">
              What's your creator type?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {creatorTypes.map((type) => (
                <label
                  key={type.value}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary ${
                    selectedCreatorType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    value={type.value}
                    {...register("creatorType", { required: "Please select a creator type" })}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-medium">{type.label}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.creatorType && (
              <p className="text-destructive mt-2">{errors.creatorType.message}</p>
            )}
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-lg font-semibold mb-4">
              Which platform are you creating for?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <label
                  key={platform.value}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary ${
                    selectedPlatform === platform.value
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    value={platform.value}
                    {...register("platform", { required: "Please select a platform" })}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-3xl mb-2">{platform.icon}</div>
                    <div className="font-medium">{platform.label}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.platform && (
              <p className="text-destructive mt-2">{errors.platform.message}</p>
            )}
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Content Goal (Optional)
              </label>
              <select
                {...register("contentGoal")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2"
              >
                <option value="">Select a goal</option>
                <option value="grow-followers">Grow Followers</option>
                <option value="increase-engagement">Increase Engagement</option>
                <option value="drive-sales">Drive Sales</option>
                <option value="build-brand">Build Brand Awareness</option>
                <option value="educate-audience">Educate Audience</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Audience (Optional)
              </label>
              <input
                type="text"
                {...register("targetAudience")}
                placeholder="e.g., Young professionals, Fitness enthusiasts"
                className="w-full rounded-lg border border-input bg-background px-3 py-2"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isGenerating}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate My 7-Day Plan
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Generated Plan Display */}
      {generatedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your 7-Day Content Plan</h2>
            <button
              onClick={savePlan}
              disabled={isSaving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Save Plan
                </>
              )}
            </button>
          </div>
          
          {/* Trending Topics */}
          {generatedPlan.trendingTopics && (
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Trending Topics This Week
              </h3>
              <div className="flex flex-wrap gap-2">
                {generatedPlan.trendingTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(generatedPlan.plan).map(([day, content]: [string, any]) => (
              <div key={day} className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">{day}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {content.time}
                  </div>
                </div>
                
                <div className="text-4xl mb-3 text-center">{content.thumbnail}</div>
                
                <h4 className="font-semibold mb-2">{content.title}</h4>
                
                <p className="text-sm text-muted-foreground mb-3">{content.caption}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Hashtags:</span>
                  </div>
                  <p className="text-xs text-muted-foreground break-words">{content.hashtags}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
