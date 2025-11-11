'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Instagram, 
  TikTok, 
  Youtube, 
  Twitter, 
  Send, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Video,
  FileText
} from 'lucide-react';

interface Post {
  id: string;
  platform: string;
  content: string;
  media?: string[];
  hashtags: string[];
  scheduledTime?: Date;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  viralScore?: number;
}

interface SimplePostingWorkflowProps {
  userId?: string;
  contentPlanId?: string;
}

/**
 * SimplePostingWorkflow Component
 * 
 * A simplified, user-friendly posting workflow that makes it easy for anyone
 * to become an influencer. Features:
 * 
 * - One-click posting to multiple platforms
 * - Smart scheduling with optimal time suggestions
 * - AI-powered content optimization
 * - Visual preview before posting
 * - Auto-hashtag suggestions
 * - Viral score prediction
 * - Batch posting capabilities
 * 
 * This component is designed to be intuitive for beginners while powerful
 * enough for professional creators.
 */
export default function SimplePostingWorkflow({ userId, contentPlanId }: SimplePostingWorkflowProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [media, setMedia] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [viralScore, setViralScore] = useState<number | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [step, setStep] = useState<'content' | 'platforms' | 'schedule' | 'preview' | 'success'>('content');
  const [posts, setPosts] = useState<Post[]>([]);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
    { id: 'tiktok', name: 'TikTok', icon: TikTok, color: 'from-black to-gray-800' },
    { id: 'youtube', name: 'YouTube Shorts', icon: Youtube, color: 'from-red-500 to-red-700' },
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'from-blue-400 to-blue-600' },
  ];

  // Load content from plan if provided
  useEffect(() => {
    if (contentPlanId) {
      loadContentFromPlan(contentPlanId);
    }
  }, [contentPlanId]);

  const loadContentFromPlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/user-plans/${planId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.content_plan) {
          // Extract content from the plan
          const firstDay = Object.values(data.content_plan)[0] as any;
          if (firstDay) {
            setContent(firstDay.caption || '');
            setHashtags(firstDay.hashtags?.split(' ') || []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading content plan:', error);
    }
  };

  const optimizeContent = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/analyze-viral-potential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          hashtags,
          platforms: selectedPlatforms,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setViralScore(data.viralScore || 0);
        if (data.optimizedContent) {
          setContent(data.optimizedContent);
        }
        if (data.suggestedHashtags) {
          setHashtags(data.suggestedHashtags);
        }
      }
    } catch (error) {
      console.error('Error optimizing content:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getOptimalPostingTime = async (platform: string) => {
    try {
      const response = await fetch(`/api/optimal-posting-time?platform=${platform}`);
      if (response.ok) {
        const data = await response.json();
        return new Date(data.optimalTime);
      }
    } catch (error) {
      console.error('Error getting optimal time:', error);
    }
    // Default: 2 hours from now
    return new Date(Date.now() + 2 * 60 * 60 * 1000);
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSchedule = async () => {
    const optimalTimes = await Promise.all(
      selectedPlatforms.map(platform => getOptimalPostingTime(platform))
    );

    const newPosts: Post[] = selectedPlatforms.map((platform, index) => ({
      id: `post-${Date.now()}-${index}`,
      platform,
      content,
      hashtags,
      media,
      scheduledTime: optimalTimes[index],
      status: 'scheduled',
      viralScore: viralScore || undefined,
    }));

    setPosts(newPosts);
    setScheduledTime(optimalTimes[0]);
    setStep('preview');
  };

  const handlePost = async (postNow: boolean = false) => {
    try {
      const response = await fetch('/api/post-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posts: postNow ? posts.map(p => ({ ...p, scheduledTime: new Date() })) : posts,
          userId,
        }),
      });

      if (response.ok) {
        setStep('success');
        // Reset after 3 seconds
        setTimeout(() => {
          setStep('content');
          setContent('');
          setHashtags([]);
          setMedia([]);
          setPosts([]);
        }, 3000);
      }
    } catch (error) {
      console.error('Error posting content:', error);
      alert('Failed to post content. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10" />
            Simple Posting Workflow
          </h1>
          <p className="text-xl text-blue-200">
            Post to all platforms in 3 easy steps
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center space-x-4">
          {['content', 'platforms', 'schedule', 'preview'].map((s, index) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step === s
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white scale-110'
                    : ['content', 'platforms', 'schedule', 'preview'].indexOf(step) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-white/60'
                }`}
              >
                {['content', 'platforms', 'schedule', 'preview'].indexOf(step) > index ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div
                  className={`w-16 h-1 mx-2 transition-all ${
                    ['content', 'platforms', 'schedule', 'preview'].indexOf(step) > index
                      ? 'bg-green-500'
                      : 'bg-white/20'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Content */}
        {step === 'content' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Step 1: Create Your Content</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2">Your Post Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind? Write your post here..."
                  className="w-full h-32 p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <div className="mt-2 text-sm text-white/60">
                  {content.length} characters
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Hashtags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-500/20 rounded-full text-white text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => setHashtags(hashtags.filter((_, i) => i !== index))}
                        className="hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add hashtags (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      setHashtags([...hashtags, e.currentTarget.value.trim()]);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {viralScore !== null && (
                <div className="p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Viral Score</span>
                    <span className="text-2xl font-bold text-pink-300">{viralScore}/100</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${viralScore}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={optimizeContent}
                  disabled={!content || isOptimizing}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isOptimizing ? (
                    <>Optimizing...</>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Optimize with AI
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep('platforms')}
                  disabled={!content.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl text-white font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Choose Platforms →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Platforms */}
        {step === 'platforms' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Step 2: Select Platforms</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.id);
                
                return (
                  <motion.button
                    key={platform.id}
                    onClick={() => handlePlatformToggle(platform.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `bg-gradient-to-r ${platform.color} border-white text-white`
                        : 'bg-white/10 border-white/20 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-semibold">{platform.name}</div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 mx-auto mt-2" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('content')}
                className="flex-1 px-6 py-3 bg-white/10 rounded-xl text-white font-bold hover:bg-white/20 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('schedule')}
                disabled={selectedPlatforms.length === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl text-white font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Schedule →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Schedule */}
        {step === 'schedule' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Step 3: Schedule Your Posts</h2>
            
            <div className="space-y-6">
              <div className="p-6 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-blue-300" />
                  <h3 className="text-lg font-semibold text-white">Smart Scheduling</h3>
                </div>
                <p className="text-white/80 mb-4">
                  We'll automatically schedule your posts at the optimal times for maximum engagement on each platform.
                </p>
                <button
                  onClick={handleSchedule}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl text-white font-bold hover:scale-105 transition-all"
                >
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Schedule with Optimal Times
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('platforms')}
                  className="flex-1 px-6 py-3 bg-white/10 rounded-xl text-white font-bold hover:bg-white/20 transition-all"
                >
                  ← Back
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Preview */}
        {step === 'preview' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Step 4: Preview & Post</h2>
            
            <div className="space-y-4 mb-6">
              {posts.map((post) => {
                const platform = platforms.find(p => p.id === post.platform);
                const Icon = platform?.icon || Instagram;
                
                return (
                  <div
                    key={post.id}
                    className="p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-white" />
                        <span className="text-white font-semibold">{platform?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/60">
                          {post.scheduledTime?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/80 mb-2">{post.content}</p>
                    <div className="flex flex-wrap gap-1">
                      {post.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs text-blue-300">#{tag}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('schedule')}
                className="flex-1 px-6 py-3 bg-white/10 rounded-xl text-white font-bold hover:bg-white/20 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => handlePost(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Schedule Posts
              </button>
              <button
                onClick={() => handlePost(true)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-bold hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Post Now
              </button>
            </div>
          </motion.div>
        )}

        {/* Success */}
        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Posts Scheduled Successfully! 🎉</h2>
            <p className="text-xl text-blue-200">
              Your content is ready to go viral!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

