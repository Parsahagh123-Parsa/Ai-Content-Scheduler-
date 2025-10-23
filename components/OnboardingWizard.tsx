"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LiquidGlassCard from "./LiquidGlassCard";
import { supabase } from "@/lib/supabase";

interface OnboardingData {
  step: number;
  totalSteps: number;
  niche: string;
  goals: string[];
  platforms: string[];
  experience: 'beginner' | 'intermediate' | 'expert';
  contentFrequency: 'daily' | 'weekly' | 'monthly';
  targetAudience: string;
  brandTone: string;
  budget: 'free' | 'pro' | 'elite';
  completed: boolean;
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to AI Content Scheduler! 🚀",
    subtitle: "Let's personalize your experience",
    component: "welcome"
  },
  {
    id: 2,
    title: "What's your creative niche?",
    subtitle: "This helps us tailor AI suggestions",
    component: "niche"
  },
  {
    id: 3,
    title: "What are your content goals?",
    subtitle: "Select all that apply",
    component: "goals"
  },
  {
    id: 4,
    title: "Which platforms do you create for?",
    subtitle: "We'll optimize content for each platform",
    component: "platforms"
  },
  {
    id: 5,
    title: "What's your experience level?",
    subtitle: "This helps us adjust complexity",
    component: "experience"
  },
  {
    id: 6,
    title: "How often do you want to create content?",
    subtitle: "We'll schedule accordingly",
    component: "frequency"
  },
  {
    id: 7,
    title: "Who's your target audience?",
    subtitle: "Describe your ideal viewer",
    component: "audience"
  },
  {
    id: 8,
    title: "What's your brand tone?",
    subtitle: "This shapes your AI-generated content",
    component: "tone"
  },
  {
    id: 9,
    title: "Choose your plan",
    subtitle: "Start free, upgrade anytime",
    component: "plan"
  },
  {
    id: 10,
    title: "You're all set! 🎉",
    subtitle: "Let's create your first AI content plan",
    component: "complete"
  }
];

const nicheOptions = [
  { id: 'fitness', label: 'Fitness & Health', icon: '💪', color: 'from-green-500/20 to-emerald-500/20' },
  { id: 'tech', label: 'Technology', icon: '💻', color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'beauty', label: 'Beauty & Fashion', icon: '✨', color: 'from-pink-500/20 to-rose-500/20' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', color: 'from-purple-500/20 to-violet-500/20' },
  { id: 'cooking', label: 'Food & Cooking', icon: '🍳', color: 'from-orange-500/20 to-red-500/20' },
  { id: 'travel', label: 'Travel & Lifestyle', icon: '✈️', color: 'from-cyan-500/20 to-blue-500/20' },
  { id: 'business', label: 'Business & Finance', icon: '💼', color: 'from-slate-500/20 to-gray-500/20' },
  { id: 'education', label: 'Education & Learning', icon: '📚', color: 'from-indigo-500/20 to-purple-500/20' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎭', color: 'from-yellow-500/20 to-orange-500/20' },
  { id: 'other', label: 'Other', icon: '🌟', color: 'from-gray-500/20 to-slate-500/20' }
];

const goalOptions = [
  { id: 'grow-followers', label: 'Grow followers', icon: '📈' },
  { id: 'increase-engagement', label: 'Increase engagement', icon: '❤️' },
  { id: 'build-brand', label: 'Build personal brand', icon: '🏷️' },
  { id: 'monetize-content', label: 'Monetize content', icon: '💰' },
  { id: 'educate-audience', label: 'Educate audience', icon: '🎓' },
  { id: 'entertain-followers', label: 'Entertain followers', icon: '🎪' },
  { id: 'drive-sales', label: 'Drive sales', icon: '🛒' },
  { id: 'network-connect', label: 'Network & connect', icon: '🤝' }
];

const platformOptions = [
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'from-black/20 to-gray-900/20' },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: 'from-pink-500/20 to-purple-500/20' },
  { id: 'youtube-shorts', label: 'YouTube Shorts', icon: '🎬', color: 'from-red-500/20 to-pink-500/20' },
  { id: 'twitter', label: 'Twitter/X', icon: '🐦', color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'from-blue-600/20 to-blue-800/20' },
  { id: 'facebook', label: 'Facebook', icon: '👥', color: 'from-blue-700/20 to-blue-900/20' }
];

const experienceOptions = [
  { id: 'beginner', label: 'Beginner', description: 'New to content creation', icon: '🌱' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience', icon: '🌿' },
  { id: 'expert', label: 'Expert', description: 'Very experienced', icon: '🌳' }
];

const frequencyOptions = [
  { id: 'daily', label: 'Daily', description: 'Every day', icon: '📅' },
  { id: 'weekly', label: 'Weekly', description: '3-7 times per week', icon: '📊' },
  { id: 'monthly', label: 'Monthly', description: '1-3 times per week', icon: '🗓️' }
];

const toneOptions = [
  { id: 'professional', label: 'Professional', description: 'Formal and authoritative', icon: '👔' },
  { id: 'casual', label: 'Casual', description: 'Friendly and relaxed', icon: '😊' },
  { id: 'energetic', label: 'Energetic', description: 'High-energy and exciting', icon: '⚡' },
  { id: 'humorous', label: 'Humorous', description: 'Funny and entertaining', icon: '😄' },
  { id: 'educational', label: 'Educational', description: 'Informative and helpful', icon: '🎓' },
  { id: 'inspirational', label: 'Inspirational', description: 'Motivating and uplifting', icon: '✨' }
];

const planOptions = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['3 AI generations per day', 'Basic content plans', 'Standard support'],
    color: 'from-gray-500/20 to-slate-500/20',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    features: ['100 AI generations per month', 'Advanced features', 'Priority support'],
    color: 'from-purple-500/20 to-pink-500/20',
    popular: true
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 99,
    features: ['Unlimited generations', 'All features', '24/7 support'],
    color: 'from-yellow-500/20 to-orange-500/20',
    popular: false
  }
];

export default function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    step: 1,
    totalSteps: onboardingSteps.length,
    niche: '',
    goals: [],
    platforms: [],
    experience: 'beginner',
    contentFrequency: 'weekly',
    targetAudience: '',
    brandTone: 'casual',
    budget: 'free',
    completed: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const currentStepData = onboardingSteps[currentStep];

  const handleNext = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setData(prev => ({ ...prev, step: currentStep + 2 }));
    } else {
      setIsLoading(true);
      await saveOnboardingData();
      onComplete({ ...data, completed: true });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setData(prev => ({ ...prev, step: currentStep }));
    }
  };

  const saveOnboardingData = async () => {
    try {
      // Save onboarding data to user preferences
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: 'demo-user-123', // In real app, get from auth
          preferred_platforms: data.platforms,
          theme_color: data.niche,
        });

      // Update user profile with onboarding data
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: 'demo-user-123',
          bio: `Creating ${data.niche} content for ${data.targetAudience}`,
        });
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: 'goals' | 'platforms', value: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const renderStepContent = () => {
    switch (currentStepData.component) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🚀
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Welcome to AI Content Scheduler!</h2>
            <p className="text-muted-foreground mb-6">
              We'll help you create viral content with AI. This takes just 2 minutes.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>AI-powered content generation</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Trend analysis and optimization</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Multi-platform scheduling</span>
              </div>
            </div>
          </div>
        );

      case 'niche':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {nicheOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateData('niche', option.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    data.niche === option.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {goalOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleArrayValue('goals', option.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    data.goals.includes(option.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'platforms':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {platformOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleArrayValue('platforms', option.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    data.platforms.includes(option.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            {experienceOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateData('experience', option.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  data.experience === option.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{option.icon}</div>
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 'frequency':
        return (
          <div className="space-y-4">
            {frequencyOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateData('contentFrequency', option.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  data.contentFrequency === option.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{option.icon}</div>
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-4">
            <textarea
              value={data.targetAudience}
              onChange={(e) => updateData('targetAudience', e.target.value)}
              placeholder="Describe your ideal audience (e.g., 'Young professionals interested in fitness and wellness')"
              className="w-full p-4 rounded-xl border border-border bg-background/50 backdrop-blur-sm resize-none h-24"
            />
          </div>
        );

      case 'tone':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {toneOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateData('brandTone', option.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    data.brandTone === option.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'plan':
        return (
          <div className="space-y-4">
            {planOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateData('budget', option.id)}
                className={`w-full p-6 rounded-xl border-2 transition-all relative ${
                  data.budget === option.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {option.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">
                    {option.price === 0 ? 'Free' : `$${option.price}/month`}
                  </div>
                  <div className="text-lg font-medium mb-3">{option.name}</div>
                  <div className="space-y-2">
                    {option.features.map((feature, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        ✓ {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
            <p className="text-muted-foreground mb-6">
              Your AI is now personalized for {data.niche} content. Let's create your first plan!
            </p>
            <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
              <div className="text-sm">
                <span className="font-medium">Niche:</span> {nicheOptions.find(n => n.id === data.niche)?.label}
              </div>
              <div className="text-sm">
                <span className="font-medium">Platforms:</span> {data.platforms.map(p => platformOptions.find(po => po.id === p)?.label).join(', ')}
              </div>
              <div className="text-sm">
                <span className="font-medium">Tone:</span> {toneOptions.find(t => t.id === data.brandTone)?.label}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStepData.component) {
      case 'welcome':
        return true;
      case 'niche':
        return data.niche !== '';
      case 'goals':
        return data.goals.length > 0;
      case 'platforms':
        return data.platforms.length > 0;
      case 'experience':
        return data.experience !== '';
      case 'frequency':
        return data.contentFrequency !== '';
      case 'audience':
        return data.targetAudience.trim() !== '';
      case 'tone':
        return data.brandTone !== '';
      case 'plan':
        return data.budget !== '';
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <LiquidGlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep + 1} of {onboardingSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">{currentStepData.title}</h1>
                <p className="text-muted-foreground">{currentStepData.subtitle}</p>
              </div>

              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onSkip}
                className="px-6 py-2 rounded-lg text-muted-foreground hover:text-foreground"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  );
}
