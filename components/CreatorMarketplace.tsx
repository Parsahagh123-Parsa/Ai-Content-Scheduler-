'use client';

// Import React hooks for state management and side effects
import React, { useState, useEffect } from 'react';
// Import Framer Motion for smooth animations and transitions
import { motion, AnimatePresence } from 'framer-motion';
// Import Heroicons for consistent iconography throughout the UI
import { 
  ShoppingCartIcon, 
  StarIcon, 
  HeartIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
// Import solid versions of icons for filled states (likes, ratings)
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

/**
 * Interface defining the structure of a marketplace template
 * This represents a content template that creators can buy/sell
 */
interface MarketplaceTemplate {
  id: string;                    // Unique identifier for the template
  creatorId: string;             // ID of the creator who made this template
  creatorName: string;           // Display name of the creator
  creatorAvatar: string;         // URL to creator's avatar image
  title: string;                 // Template title/name
  description: string;           // Detailed description of the template
  category: string;              // Template category (social-media, video, etc.)
  platform: string;             // Target platform (Instagram, TikTok, etc.)
  price: number;                 // Price in the specified currency
  currency: string;              // Currency code (USD, EUR, etc.)
  thumbnailUrl: string;          // Main preview image URL
  previewUrls: string[];         // Additional preview images
  tags: string[];                // Searchable tags for the template
  rating: number;                // Average rating (0-5 stars)
  reviewCount: number;           // Total number of reviews
  salesCount: number;            // Number of times this template was sold
  downloads: number;             // Number of downloads (for free templates)
  isFeatured: boolean;           // Whether this is a featured template
  isTrending: boolean;           // Whether this template is currently trending
  createdAt: Date;               // When the template was created
  updatedAt: Date;               // When the template was last updated
  performance: {                 // Performance metrics for the template
    views: number;               // Total views
    likes: number;               // Total likes
    shares: number;              // Total shares
    conversionRate: number;      // Conversion rate (views to sales)
  };
  revenue: {                     // Revenue data for the template
    total: number;               // Total revenue generated
    monthly: number;             // Monthly revenue
    weekly: number;              // Weekly revenue
  };
}

/**
 * Interface for creator statistics displayed in the marketplace
 * Shows the creator's overall performance and ranking
 */
interface CreatorStats {
  totalTemplates: number;        // Total number of templates created
  totalSales: number;            // Total number of sales across all templates
  totalRevenue: number;          // Total revenue earned
  averageRating: number;         // Average rating across all templates
  followers: number;             // Number of followers
  rank: number;                  // Creator's rank in the marketplace
}

/**
 * CreatorMarketplace Component
 * 
 * This component provides a marketplace interface where creators can:
 * - Browse and search for content templates
 * - Purchase templates from other creators
 * - Sell their own templates
 * - View creator statistics and rankings
 * 
 * Features:
 * - Advanced filtering and search
 * - Template preview and purchase flow
 * - Creator statistics dashboard
 * - Template creation form
 * - Responsive grid layout
 */
const CreatorMarketplace: React.FC = () => {
  // State for storing the list of available templates
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  
  // Loading state for API calls
  const [loading, setLoading] = useState(false);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  
  // UI state for modal forms
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Creator statistics for the current user
  const [creatorStats, setCreatorStats] = useState<CreatorStats | null>(null);

  // Available categories for filtering templates
  const categories = [
    'all', 'social-media', 'video', 'audio', 'graphics', 'templates', 'presets', 'tutorials'
  ];

  // Available sorting options for the template list
  const sortOptions = [
    { value: 'trending', label: 'Trending' },           // Most popular right now
    { value: 'newest', label: 'Newest' },               // Recently created
    { value: 'price-low', label: 'Price: Low to High' }, // Cheapest first
    { value: 'price-high', label: 'Price: High to Low' }, // Most expensive first
    { value: 'rating', label: 'Highest Rated' },        // Best reviews first
    { value: 'sales', label: 'Best Selling' }           // Most sold first
  ];

  // Effect hook that runs when filters change
  // This ensures the template list updates whenever user changes search, category, sort, or price
  useEffect(() => {
    loadTemplates();      // Reload templates with new filters
    loadCreatorStats();   // Reload creator statistics
  }, [selectedCategory, sortBy, priceRange, searchQuery]);

  /**
   * Loads templates from the API based on current filters
   * This function is called whenever filters change or component mounts
   */
  const loadTemplates = async () => {
    try {
      setLoading(true);  // Show loading spinner
      
      // Build query string with current filters
      const response = await fetch('/api/marketplace?action=get_templates&category=' + selectedCategory + '&sort=' + sortBy);
      const data = await response.json();
      
      // Update templates state with API response
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      // In a real app, you'd show a user-friendly error message
    } finally {
      setLoading(false);  // Hide loading spinner
    }
  };

  /**
   * Loads creator statistics for the current user
   * Shows revenue, ranking, and other performance metrics
   */
  const loadCreatorStats = async () => {
    try {
      // In a real app, you'd get the actual user ID from authentication
      const response = await fetch('/api/marketplace?action=get_creator_stats&userId=user-123');
      const data = await response.json();
      setCreatorStats(data.stats);
    } catch (error) {
      console.error('Error loading creator stats:', error);
    }
  };

  /**
   * Handles template purchase when user clicks "Buy Now"
   * In a real app, this would integrate with payment processing
   * 
   * @param templateId - The ID of the template to purchase
   */
  const handlePurchase = async (templateId: string) => {
    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'purchase_template',
          templateId,
          userId: 'user-123'  // In real app, get from auth context
        })
      });

      if (response.ok) {
        // Show success message to user
        alert('Template purchased successfully!');
        
        // Refresh data to show updated sales counts
        loadTemplates();
        loadCreatorStats();
      }
    } catch (error) {
      console.error('Error purchasing template:', error);
      alert('Failed to purchase template. Please try again.');
    }
  };

  /**
   * Handles template liking when user clicks the heart icon
   * This is a social feature that helps with template discovery
   * 
   * @param templateId - The ID of the template to like
   */
  const handleLike = async (templateId: string) => {
    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like_template',
          templateId,
          userId: 'user-123'  // In real app, get from auth context
        })
      });

      if (response.ok) {
        // Refresh templates to show updated like counts
        loadTemplates();
      }
    } catch (error) {
      console.error('Error liking template:', error);
    }
  };

  /**
   * Formats a number as currency using the browser's Intl API
   * This ensures proper currency formatting based on locale
   * 
   * @param amount - The amount to format
   * @param currency - The currency code (defaults to USD)
   * @returns Formatted currency string (e.g., "$25.99")
   */
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  /**
   * Formats large numbers with K/M suffixes for better readability
   * Used for displaying view counts, sales numbers, etc.
   * 
   * @param num - The number to format
   * @returns Formatted number string (e.g., "1.2K", "3.5M")
   */
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  /**
   * Client-side filtering of templates based on search query and price range
   * This provides instant filtering without additional API calls
   * 
   * The filtering logic checks:
   * - Search query matches title, description, or tags
   * - Price is within the selected range
   */
  const filteredTemplates = templates.filter(template => {
    // Check if search query matches title, description, or any tag
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Check if price is within the selected range
    const matchesPrice = template.price >= priceRange[0] && template.price <= priceRange[1];
    
    // Template must match both search and price criteria
    return matchesSearch && matchesPrice;
  });

  return (
    // Main container with glassmorphic styling and entrance animation
    <motion.div
      initial={{ opacity: 0, y: 20 }}  // Starts invisible and below
      animate={{ opacity: 1, y: 0 }}   // Animates to visible and normal position
      className="glass p-8 rounded-2xl shadow-xl text-white max-w-7xl mx-auto"  // Glassmorphic container
    >
      {/* Header section with title and creator stats */}
      <div className="flex items-center justify-between mb-8">
        {/* Left side - App title and description */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">🛒 Creator Marketplace</h2>
          <p className="text-gray-200">Buy and sell AI-powered content templates</p>
        </div>
        
        {/* Right side - Creator stats and action button */}
        <div className="flex items-center space-x-4">
          {/* Creator revenue and ranking display */}
          {creatorStats && (
            <div className="text-right">
              <p className="text-sm text-gray-400">Your Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(creatorStats.totalRevenue)}</p>
              <p className="text-xs text-green-400">#{creatorStats.rank} Creator</p>
            </div>
          )}
          
          {/* Button to create new template */}
          <motion.button
            onClick={() => setShowCreateForm(true)}  // Open create template modal
            whileHover={{ scale: 1.05 }}            // Scale up on hover
            whileTap={{ scale: 0.95 }}              // Scale down on tap
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Sell Template</span>
          </motion.button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
            />
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sort and Price Range */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Price Range:</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-20 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm"
                placeholder="Min"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                className="w-20 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
            >
              {/* Template Image */}
              <div className="relative mb-4">
                <img
                  src={template.thumbnailUrl}
                  alt={template.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2 flex space-x-1">
                  {template.isFeatured && (
                    <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                      Featured
                    </span>
                  )}
                  {template.isTrending && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      Trending
                    </span>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <motion.button
                    onClick={() => handleLike(template.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-black/50 rounded-full text-white hover:text-red-400 transition-colors"
                  >
                    <HeartIcon className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Template Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-white text-lg line-clamp-2">{template.title}</h3>
                  <span className="text-2xl font-bold text-white ml-2">
                    {formatCurrency(template.price, template.currency)}
                  </span>
                </div>

                <p className="text-gray-300 text-sm line-clamp-2">{template.description}</p>

                {/* Creator Info */}
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {template.creatorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">{template.creatorName}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                      <span>{template.rating.toFixed(1)}</span>
                      <span>({template.reviewCount})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="h-4 w-4" />
                      <span>{formatNumber(template.performance.views)}</span>
                    </div>
                  </div>
                  <span className="text-green-400">{template.salesCount} sales</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2">
                  <motion.button
                    onClick={() => handlePurchase(template.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span>Buy Now</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredTemplates.length === 0 && !loading && (
        <div className="text-center py-12">
          <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Templates Found</h3>
          <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Create Template Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Create New Template</h3>
                <motion.button
                  onClick={() => setShowCreateForm(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Template Title</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
                    placeholder="Enter template title"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 h-24 resize-none"
                    placeholder="Describe your template"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Category</label>
                    <select className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white">
                      <option value="social-media">Social Media</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                      <option value="graphics">Graphics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Price ($)</label>
                    <input
                      type="number"
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <motion.button
                    onClick={() => setShowCreateForm(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium"
                  >
                    Create Template
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CreatorMarketplace;
