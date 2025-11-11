'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Repeat,
  Zap,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
  Copy,
  Filter,
  Download,
  Upload,
} from 'lucide-react';

interface RecurringPost {
  id: string;
  name: string;
  content: string;
  platforms: string[];
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    days?: number[];
    time: string;
    timezone: string;
  };
  hashtags: string[];
  isActive: boolean;
  nextRun: Date;
  totalRuns: number;
}

/**
 * AdvancedScheduler Component
 * 
 * Professional scheduling features:
 * - Recurring posts (daily, weekly, monthly)
 * - Bulk post operations
 * - Schedule templates
 * - Calendar view
 * - Batch editing
 */
export default function AdvancedScheduler() {
  const [recurringPosts, setRecurringPosts] = useState<RecurringPost[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateRecurring = async (data: Partial<RecurringPost>) => {
    // Create recurring post
    console.log('Creating recurring post:', data);
    setShowCreateModal(false);
  };

  const handleBulkDelete = async (ids: string[]) => {
    // Bulk delete
    console.log('Deleting posts:', ids);
  };

  const handleBulkSchedule = async (posts: any[], scheduleTime: Date) => {
    // Bulk schedule
    console.log('Scheduling posts:', posts, scheduleTime);
  };

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
                <Calendar className="w-10 h-10" />
                Advanced Scheduler
              </h1>
              <p className="text-blue-200">Recurring posts, bulk operations, and smart scheduling</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-bold hover:scale-105 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Recurring Post
              </button>
              <button className="p-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                <Download className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-xl p-2 border border-white/20">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Calendar View
            </button>
          </div>
        </motion.div>

        {/* Recurring Posts List */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {recurringPosts.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
                <Repeat className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60 text-xl mb-2">No recurring posts yet</p>
                <p className="text-white/40 mb-6">Create your first recurring post to automate your content</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-bold hover:scale-105 transition-all"
                >
                  Create Recurring Post
                </button>
              </div>
            ) : (
              recurringPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{post.name}</h3>
                        <span className={`px-3 py-1 rounded-lg text-sm ${
                          post.isActive
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {post.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p className="text-white/80 mb-4">{post.content}</p>
                      <div className="flex items-center gap-6 text-sm text-white/60">
                        <span className="flex items-center gap-2">
                          <Repeat className="w-4 h-4" />
                          {post.schedule.frequency}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {post.schedule.time}
                        </span>
                        <span className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          {post.totalRuns} runs
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Next: {post.nextRun.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                        <Edit className="w-5 h-5 text-white" />
                      </button>
                      <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                        <Copy className="w-5 h-5 text-white" />
                      </button>
                      <button className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30">
                        <Trash2 className="w-5 h-5 text-red-300" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <p className="text-white/60 text-center py-12">Calendar view coming soon...</p>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-2xl w-full mx-4"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Create Recurring Post</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">Post Name</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Morning Motivation"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Content</label>
                  <textarea
                    className="w-full h-32 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Your post content..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2">Frequency</label>
                    <select className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Time</label>
                    <input
                      type="time"
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 bg-white/10 rounded-xl text-white font-bold hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCreateRecurring({})}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-bold hover:scale-105 transition-all"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

