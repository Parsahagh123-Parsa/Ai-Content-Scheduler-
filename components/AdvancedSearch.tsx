'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  Calendar,
  Tag,
  User,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'content-plan' | 'post' | 'asset' | 'template';
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  relevance: number;
}

/**
 * AdvancedSearch Component
 * 
 * Universal search across all content:
 * - Full-text search
 * - Filter by type, date, tags
 * - Relevance ranking
 * - Quick actions
 */
export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    tags: [] as string[],
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&type=${filters.type}&dateRange=${filters.dateRange}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content-plan':
        return <FileText className="w-5 h-5" />;
      case 'post':
        return <TrendingUp className="w-5 h-5" />;
      case 'asset':
        return <Tag className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'content-plan':
        return 'bg-blue-500/20 text-blue-300';
      case 'post':
        return 'bg-green-500/20 text-green-300';
      case 'asset':
        return 'bg-purple-500/20 text-purple-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

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
            <Search className="w-10 h-10" />
            Advanced Search
          </h1>
          <p className="text-blue-200">Search across all your content, posts, and assets</p>
        </motion.div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/60" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search content plans, posts, assets, templates..."
              className="w-full pl-14 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/20"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-white/60" />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Types</option>
            <option value="content-plan">Content Plans</option>
            <option value="post">Posts</option>
            <option value="asset">Assets</option>
            <option value="template">Templates</option>
          </select>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="text-white/60 mb-4">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </div>
            {results.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-sm ${getTypeColor(result.type)}`}>
                        {result.type.replace('-', ' ')}
                      </span>
                      <span className="text-white/40 text-sm">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-pink-300 text-sm font-semibold">
                        {result.relevance}% match
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{result.title}</h3>
                    <p className="text-white/70 mb-4">{result.description}</p>
                    {result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-pink-500/20 rounded text-xs text-pink-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {query && results.length === 0 && !isSearching && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-xl">No results found</p>
            <p className="text-white/40 mt-2">Try different keywords or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

