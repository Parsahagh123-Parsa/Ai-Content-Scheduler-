'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ContentPlan {
  title: string;
  description: string;
  days: Array<{
    day: string;
    platform: string;
    caption: string;
    hashtags: string[];
    trendingTopics: string[];
    viralScore: number;
    videoScript?: string;
    thumbnailPrompt?: string;
  }>;
  liveHashtags: string[];
  trendingSounds: string[];
  engagementPrediction: number;
  targetAudience: string;
  contentStrategy: string;
}

export default function EnhancedContentForm() {
  const [formData, setFormData] = useState({
    creatorType: '',
    niche: '',
    targetAudience: '',
    tone: 'professional',
    platforms: [] as string[],
    duration: 7,
    goals: ''
  });
  
  const [content, setContent] = useState<ContentPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    
    try {
      await fetch('/api/save-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      alert('Content plan saved successfully!');
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🚀 AI Content Scheduler
          </h1>
          <p className="text-xl text-blue-200">
            Generate viral content plans with AI-powered insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Content Generator</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white mb-2">Creator Type</label>
                <select
                  value={formData.creatorType}
                  onChange={(e) => setFormData({...formData, creatorType: e.target.value})}
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70"
                >
                  <option value="">Select your type</option>
                  <option value="influencer">Influencer</option>
                  <option value="business">Business</option>
                  <option value="educator">Educator</option>
                  <option value="entertainer">Entertainer</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Niche</label>
                <input
                  type="text"
                  value={formData.niche}
                  onChange={(e) => setFormData({...formData, niche: e.target.value})}
                  placeholder="e.g., fitness, tech, fashion"
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Target Audience</label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                  placeholder="e.g., Gen Z, professionals, fitness enthusiasts"
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({...formData, tone: e.target.value})}
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="funny">Funny</option>
                  <option value="motivational">Motivational</option>
                  <option value="educational">Educational</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Platforms</label>
                <div className="space-y-2">
                  {['TikTok', 'Instagram', 'YouTube', 'Twitter', 'LinkedIn'].map(platform => (
                    <label key={platform} className="flex items-center text-white">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, platforms: [...formData.platforms, platform]});
                          } else {
                            setFormData({...formData, platforms: formData.platforms.filter(p => p !== platform)});
                          }
                        }}
                        className="mr-3"
                      />
                      {platform}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Content Duration (days)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  min="1"
                  max="30"
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Goals</label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  placeholder="What do you want to achieve with this content?"
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 h-20"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isGenerating}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-6 rounded-lg disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  'Generate Content Plan 🚀'
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Generated Content</h2>
            
            {content ? (
              <div className="space-y-6">
                <div className="bg-white/20 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-white mb-2">{content.title}</h3>
                  <p className="text-blue-200">{content.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-lg p-4">
                    <h4 className="font-bold text-white">Viral Score</h4>
                    <p className="text-2xl text-green-400">{content.engagementPrediction}%</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <h4 className="font-bold text-white">Target Audience</h4>
                    <p className="text-blue-200">{content.targetAudience}</p>
                  </div>
                </div>

                {content.liveHashtags && Array.isArray(content.liveHashtags) && content.liveHashtags.length > 0 && (
                  <div className="bg-white/20 rounded-lg p-4">
                    <h4 className="font-bold text-white mb-2">🔥 Live Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {content.liveHashtags.slice(0, 5).map((hashtag: string, index: number) => (
                        <span
                          key={index}
                          className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm"
                        >
                          #{hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-bold text-white">Content Schedule</h4>
                  {content.days.map((day, index) => (
                    <div key={index} className="bg-white/20 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-white">{day.day}</h5>
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">
                          {day.platform}
                        </span>
                      </div>
                      <p className="text-blue-200 mb-2">{day.caption}</p>
                      <div className="flex flex-wrap gap-1">
                        {day.hashtags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center">
                        <span className="text-yellow-400 text-sm">Viral Score: {day.viralScore}/100</span>
                      </div>
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={handleSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Save Content Plan 💾
                </motion.button>
              </div>
            ) : (
              <div className="text-center text-blue-200">
                <p>Fill out the form and click "Generate Content Plan" to see your AI-powered content strategy!</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}