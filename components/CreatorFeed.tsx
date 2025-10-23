'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ArrowPathIcon,
  BookmarkIcon,
  ShareIcon,
  PlusIcon,
  FireIcon,
  TrophyIcon,
  UserGroupIcon,
  SparklesIcon,
  EyeIcon,
  HandThumbUpIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface CreatorPost {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorTier: 'free' | 'pro' | 'elite';
  content: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'audio' | 'text';
  platform: string;
  hashtags: string[];
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  engagement: number;
  viralityScore: number;
  aiGenerated: boolean;
  createdAt: Date;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
}

interface CreatorProfile {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  bio: string;
  tier: 'free' | 'pro' | 'elite';
  followers: number;
  following: number;
  posts: number;
  totalLikes: number;
  totalViews: number;
  engagementRate: number;
  verified: boolean;
  badges: string[];
  categories: string[];
  isFollowing: boolean;
  lastActive: Date;
}

interface TrendingCreator {
  id: string;
  profile: CreatorProfile;
  trendingScore: number;
  growthRate: number;
  viralPosts: number;
  reason: string;
  category: string;
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: Date;
  endDate: Date;
  rules: string[];
  rewards: string[];
  participants: number;
  submissions: number;
  isActive: boolean;
  isParticipating: boolean;
  progress: number;
  leaderboard: Array<{
    rank: number;
    creatorId: string;
    creatorName: string;
    score: number;
  }>;
}

const CreatorFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'challenges'>('feed');
  const [posts, setPosts] = useState<CreatorPost[]>([]);
  const [trendingCreators, setTrendingCreators] = useState<TrendingCreator[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    loadFeed();
    loadTrendingCreators();
    loadChallenges();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/creator-feed?action=feed&userId=user-123');
      const data = await response.json();
      setPosts(data.feed || []);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingCreators = async () => {
    try {
      const response = await fetch('/api/creator-feed?action=trending&limit=10');
      const data = await response.json();
      setTrendingCreators(data.trending || []);
    } catch (error) {
      console.error('Error loading trending creators:', error);
    }
  };

  const loadChallenges = async () => {
    try {
      const response = await fetch('/api/creator-feed?action=challenges&limit=5');
      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch('/api/creator-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like',
          postId,
          userId: 'user-123'
        })
      });

      if (response.ok) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleRepost = async (postId: string) => {
    try {
      const response = await fetch('/api/creator-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'repost',
          postId,
          userId: 'user-123'
        })
      });

      if (response.ok) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isReposted: !post.isReposted,
                reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  const generateAIContent = async () => {
    try {
      setAiGenerating(true);
      const response = await fetch('/api/creator-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_content',
          prompt: 'Create an engaging social media post about AI content creation',
          style: 'engaging'
        })
      });

      const data = await response.json();
      if (data.content) {
        setNewPostContent(data.content);
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite': return 'text-yellow-400 bg-yellow-400/20';
      case 'pro': return 'text-purple-400 bg-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-8 rounded-2xl shadow-xl text-white max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">🌟 Creator Community</h2>
          <p className="text-gray-200">Connect, inspire, and grow together</p>
        </div>
        <motion.button
          onClick={() => setShowCreatePost(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Post</span>
        </motion.button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-8 bg-white/10 rounded-xl p-2">
        {[
          { id: 'feed', label: 'Feed', icon: '📱' },
          { id: 'trending', label: 'Trending', icon: '🔥' },
          { id: 'challenges', label: 'Challenges', icon: '🏆' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'text-gray-300 hover:bg-white/20'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Posts Yet</h3>
                <p className="text-gray-400 mb-6">Be the first to share something amazing!</p>
                <motion.button
                  onClick={() => setShowCreatePost(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Create First Post
                </motion.button>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6 rounded-xl border border-white/10"
                  >
                    {/* Post Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {post.creatorName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-white">{post.creatorName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(post.creatorTier)}`}>
                            {post.creatorTier.toUpperCase()}
                          </span>
                          {post.aiGenerated && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                              AI Generated
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{formatTimeAgo(post.createdAt)}</p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-white mb-3">{post.content}</p>
                      
                      {/* Hashtags */}
                      {post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.hashtags.map((tag, index) => (
                            <span key={index} className="text-blue-400 text-sm">#{tag}</span>
                          ))}
                        </div>
                      )}

                      {/* Media */}
                      {post.mediaUrls.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {post.mediaUrls.slice(0, 4).map((url, index) => (
                            <div key={index} className="aspect-square bg-white/10 rounded-lg overflow-hidden">
                              <img src={url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Post Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <span>{post.views.toLocaleString()} views</span>
                        <span>{post.engagement.toFixed(1)}% engagement</span>
                        <span className="flex items-center space-x-1">
                          <FireIcon className="h-4 w-4" />
                          <span>{post.viralityScore}/100</span>
                        </span>
                      </div>
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <motion.button
                          onClick={() => handleLike(post.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`flex items-center space-x-2 ${
                            post.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                          }`}
                        >
                          {post.isLiked ? (
                            <HeartSolidIcon className="h-5 w-5" />
                          ) : (
                            <HeartIcon className="h-5 w-5" />
                          )}
                          <span>{post.likes}</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex items-center space-x-2 text-gray-400 hover:text-blue-400"
                        >
                          <ChatBubbleLeftIcon className="h-5 w-5" />
                          <span>{post.comments}</span>
                        </motion.button>

                        <motion.button
                          onClick={() => handleRepost(post.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`flex items-center space-x-2 ${
                            post.isReposted ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
                          }`}
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                          <span>{post.reposts}</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-gray-400 hover:text-yellow-400"
                        >
                          <BookmarkIcon className="h-5 w-5" />
                        </motion.button>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-white"
                      >
                        <ShareIcon className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'trending' && (
          <motion.div
            key="trending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid gap-4">
              {trendingCreators.map((creator, index) => (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass p-6 rounded-xl border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {creator.profile.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-white text-lg">{creator.profile.displayName}</h3>
                          {creator.profile.verified && (
                            <span className="text-blue-400">✓</span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(creator.profile.tier)}`}>
                            #{index + 1}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">@{creator.profile.username}</p>
                        <p className="text-gray-300 text-sm mt-1">{creator.profile.bio}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{creator.trendingScore}</div>
                      <div className="text-sm text-gray-400">Trending Score</div>
                      <div className="text-sm text-green-400">+{creator.growthRate}% growth</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <span>{creator.profile.followers.toLocaleString()} followers</span>
                      <span>{creator.profile.posts} posts</span>
                      <span>{creator.viralPosts} viral</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">{creator.reason}</span>
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                        {creator.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid gap-6">
              {challenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-6 rounded-xl border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrophyIcon className="h-6 w-6 text-yellow-400" />
                        <h3 className="text-xl font-semibold text-white">{challenge.title}</h3>
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                          {challenge.category}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-4">{challenge.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
                        <span className="flex items-center space-x-1">
                          <UserGroupIcon className="h-4 w-4" />
                          <span>{challenge.participants} participants</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <EyeIcon className="h-4 w-4" />
                          <span>{challenge.submissions} submissions</span>
                        </span>
                        <span>Ends {formatTimeAgo(challenge.endDate)}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                        <div 
                          className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${challenge.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {challenge.rewards.map((reward, index) => (
                        <span key={index} className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                          {reward}
                        </span>
                      ))}
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-6 py-2 rounded-lg font-medium ${
                        challenge.isParticipating
                          ? 'bg-green-500 text-white'
                          : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      }`}
                    >
                      {challenge.isParticipating ? 'Participating' : 'Join Challenge'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreatePost(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Create New Post</h3>
                <motion.button
                  onClick={() => setShowCreatePost(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">What's on your mind?</label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full p-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 h-32 resize-none"
                    placeholder="Share your thoughts, ideas, or experiences..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <motion.button
                    onClick={generateAIContent}
                    disabled={aiGenerating}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    <span>{aiGenerating ? 'Generating...' : 'AI Generate'}</span>
                  </motion.button>

                  <div className="flex items-center space-x-4">
                    <motion.button
                      onClick={() => setShowCreatePost(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      Cancel
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Post
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CreatorFeed;
