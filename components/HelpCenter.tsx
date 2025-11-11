'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Search,
  Book,
  Video,
  MessageCircle,
  ChevronRight,
  CheckCircle,
  Star,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  helpful: number;
  views: number;
  tags: string[];
}

/**
 * HelpCenter Component
 * 
 * Comprehensive help center with:
 * - Knowledge base articles
 * - Video tutorials
 * - Search functionality
 * - Categories
 * - FAQ section
 */
export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const categories = ['all', 'getting-started', 'posting', 'scheduling', 'analytics', 'team', 'billing'];
  
  const articles: Article[] = [
    {
      id: '1',
      title: 'Getting Started with ViralFlow',
      category: 'getting-started',
      content: 'Learn how to create your first content plan and schedule your first post...',
      helpful: 45,
      views: 120,
      tags: ['beginner', 'tutorial'],
    },
    {
      id: '2',
      title: 'How to Use the Simple Posting Workflow',
      category: 'posting',
      content: 'The simple posting workflow allows you to post to multiple platforms in just 3 steps...',
      helpful: 38,
      views: 95,
      tags: ['posting', 'workflow'],
    },
    {
      id: '3',
      title: 'Understanding Analytics Dashboard',
      category: 'analytics',
      content: 'Learn how to interpret your analytics and track your content performance...',
      helpful: 32,
      views: 78,
      tags: ['analytics', 'metrics'],
    },
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <HelpCircle className="w-10 h-10" />
            Help Center
          </h1>
          <p className="text-blue-200">Find answers and learn how to use ViralFlow</p>
        </motion.div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Articles */}
        {selectedArticle ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
          >
            <button
              onClick={() => setSelectedArticle(null)}
              className="text-blue-300 mb-4 hover:text-blue-200"
            >
              ← Back to articles
            </button>
            <h2 className="text-3xl font-bold text-white mb-4">{selectedArticle.title}</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-white/80 leading-relaxed">{selectedArticle.content}</p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>{selectedArticle.views} views</span>
                <span>{selectedArticle.helpful} found helpful</span>
              </div>
              <button className="px-4 py-2 bg-green-500/20 rounded-lg text-green-300 hover:bg-green-500/30 transition-all flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Helpful
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedArticle(article)}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-pink-500/20 rounded-lg text-pink-300 text-sm">
                    {article.category.replace('-', ' ')}
                  </span>
                  <ChevronRight className="w-5 h-5 text-white/60" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{article.title}</h3>
                <p className="text-white/70 mb-4 line-clamp-2">{article.content}</p>
                <div className="flex items-center justify-between text-sm text-white/60">
                  <div className="flex items-center gap-4">
                    <span>{article.views} views</span>
                    <span>{article.helpful} helpful</span>
                  </div>
                  <div className="flex gap-1">
                    {article.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        {!selectedArticle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
              <Book className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Documentation</h3>
              <p className="text-white/60 text-sm">Complete guides and references</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
              <Video className="w-12 h-12 text-pink-300 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Video Tutorials</h3>
              <p className="text-white/60 text-sm">Step-by-step video guides</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
              <MessageCircle className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Contact Support</h3>
              <p className="text-white/60 text-sm">Get help from our team</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

