'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Clock,
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    averageEngagement: number;
    growthRate: number;
  };
  platformStats: {
    platform: string;
    posts: number;
    views: number;
    engagement: number;
    growth: number;
  }[];
  topPosts: {
    id: string;
    platform: string;
    content: string;
    views: number;
    engagement: number;
    viralScore: number;
    postedAt: string;
  }[];
  engagementTrend: {
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }[];
  audienceInsights: {
    peakHours: number[];
    bestDays: string[];
    topHashtags: string[];
    contentTypes: { type: string; count: number; avgEngagement: number }[];
  };
  goals: {
    current: number;
    target: number;
    metric: string;
    progress: number;
  }[];
}

/**
 * AnalyticsDashboard Component
 * 
 * Professional analytics dashboard with comprehensive metrics:
 * - Overview statistics
 * - Platform performance comparison
 * - Top performing posts
 * - Engagement trends over time
 * - Audience insights
 * - Goal tracking
 * - Real-time updates
 */
export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'engagement' | 'growth'>('engagement');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <BarChart3 className="w-10 h-10" />
                Analytics Dashboard
              </h1>
              <p className="text-blue-200">Comprehensive performance insights</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <button className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-bold hover:scale-105 transition-all">
                Export Report
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Target}
            label="Total Posts"
            value={analytics.overview.totalPosts.toLocaleString()}
            change={analytics.overview.growthRate}
            color="from-blue-500 to-cyan-600"
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={analytics.overview.totalViews.toLocaleString()}
            change={12.5}
            color="from-purple-500 to-pink-600"
          />
          <StatCard
            icon={Heart}
            label="Total Likes"
            value={analytics.overview.totalLikes.toLocaleString()}
            change={8.3}
            color="from-red-500 to-pink-600"
          />
          <StatCard
            icon={Activity}
            label="Avg Engagement"
            value={`${analytics.overview.averageEngagement.toFixed(1)}%`}
            change={analytics.overview.growthRate}
            color="from-green-500 to-emerald-600"
          />
        </div>

        {/* Platform Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <PieChart className="w-6 h-6" />
            Platform Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.platformStats.map((stat, index) => (
              <div
                key={stat.platform}
                className="p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold capitalize">{stat.platform}</span>
                  <span className={`text-sm ${stat.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.growth > 0 ? '+' : ''}{stat.growth}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.posts}</div>
                <div className="text-sm text-white/60">Posts</div>
                <div className="mt-2 text-sm text-white/80">
                  {stat.views.toLocaleString()} views • {stat.engagement.toFixed(1)}% engagement
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Engagement Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Engagement Trend
            </h2>
            <div className="flex gap-2">
              {(['views', 'engagement', 'growth'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedMetric === metric
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.engagementTrend.map((data, index) => {
              const maxValue = Math.max(...analytics.engagementTrend.map(d => d.views));
              const height = (data.views / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-pink-500 to-purple-600 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                    title={`${data.views} views`}
                  />
                  <div className="text-xs text-white/60 mt-2 text-center">
                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Top Performing Posts
          </h2>
          <div className="space-y-4">
            {analytics.topPosts.map((post, index) => (
              <div
                key={post.id}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-pink-400">#{index + 1}</span>
                      <span className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm capitalize">
                        {post.platform}
                      </span>
                      <span className="px-3 py-1 bg-green-500/20 rounded-lg text-green-300 text-sm font-semibold">
                        {post.viralScore}/100 Viral Score
                      </span>
                    </div>
                    <p className="text-white/80 mb-3 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-6 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        {post.engagement.toFixed(1)}% engagement
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(post.postedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Goals & Audience Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6" />
              Goals Progress
            </h2>
            <div className="space-y-4">
              {analytics.goals.map((goal, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{goal.metric}</span>
                    <span className="text-white/60">
                      {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Audience Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Audience Insights
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Peak Engagement Hours</h3>
                <div className="flex flex-wrap gap-2">
                  {analytics.audienceInsights.peakHours.map((hour) => (
                    <span
                      key={hour}
                      className="px-3 py-1 bg-pink-500/20 rounded-lg text-pink-300 text-sm"
                    >
                      {hour}:00
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Best Days</h3>
                <div className="flex flex-wrap gap-2">
                  {analytics.audienceInsights.bestDays.map((day) => (
                    <span
                      key={day}
                      className="px-3 py-1 bg-purple-500/20 rounded-lg text-purple-300 text-sm"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Top Hashtags</h3>
                <div className="flex flex-wrap gap-2">
                  {analytics.audienceInsights.topHashtags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-500/20 rounded-lg text-blue-300 text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change: number;
  color: string;
}

function StatCard({ icon: Icon, label, value, change, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 border border-white/20`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-white/80" />
        <div className={`flex items-center gap-1 ${change > 0 ? 'text-green-300' : 'text-red-300'}`}>
          {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm font-semibold">{Math.abs(change)}%</span>
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-white/80 text-sm">{label}</div>
    </motion.div>
  );
}

