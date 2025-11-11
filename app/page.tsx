'use client';

// Import React hooks for state management
import React, { useState } from 'react';
// Import Framer Motion for smooth animations
import { motion } from 'framer-motion';

// Import all the main components for different features
import EnhancedContentForm from '../components/EnhancedContentForm';
import AICoachingChat from '../components/AICoachingChat';
import SmartPostOptimizer from '../components/SmartPostOptimizer';
import Dashboard3D from '../components/3DDashboard';
import PricingPage from '../components/PricingPage';
import ComprehensiveContentCreator from '../components/ComprehensiveContentCreator';
import SponsorshipProposals from '../components/SponsorshipProposals';
import CreatorFeed from '../components/CreatorFeed';
import AISupportChatbot from '../components/AISupportChatbot';
import CreatorMarketplace from '../components/CreatorMarketplace';
import NotificationSystem from '../components/NotificationSystem';
import SimplePostingWorkflow from '../components/SimplePostingWorkflow';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import TeamWorkspace from '../components/TeamWorkspace';

// Define the type for tab navigation - this ensures type safety
// Each tab represents a different feature/section of the app
type TabType = 'post' | 'generator' | 'optimizer' | 'coach' | 'dashboard' | 'analytics' | 'team' | 'pricing' | 'comprehensive' | 'sponsorship' | 'community' | 'support' | 'marketplace';

/**
 * Main Home Component - The central hub of the AI Content Scheduler application
 * 
 * This component serves as the main interface that allows users to navigate between
 * different features like content generation, AI coaching, marketplace, etc.
 * 
 * Key Features:
 * - Tab-based navigation system
 * - State management for active tab and content plans
 * - Responsive design with glassmorphic UI
 * - Smooth animations using Framer Motion
 */
export default function Home() {
  // State for managing which tab is currently active
  // 'post' is the default tab when the app loads (simplified posting workflow)
  const [activeTab, setActiveTab] = useState<TabType>('post');
  
  // State for storing content plans data (used by the 3D dashboard)
  // This will be populated when users generate content plans
  const [contentPlans, setContentPlans] = useState<any[]>([]);

  // Configuration array for all available tabs/features
  // Each tab has an ID, display label, and emoji icon
  // The order here determines the order they appear in the navigation
  const tabs = [
    { id: 'post', label: 'Simple Post', icon: '📱' },                // Simplified posting workflow (Main feature)
    { id: 'generator', label: 'Content Generator', icon: '🚀' },      // AI-powered content creation
    { id: 'optimizer', label: 'Post Optimizer', icon: '🎯' },        // Post performance optimization
    { id: 'analytics', label: 'Analytics', icon: '📊' },             // Advanced analytics dashboard (NEW)
    { id: 'team', label: 'Team', icon: '👥' },                       // Team workspace & collaboration (NEW)
    { id: 'coach', label: 'AI Coach', icon: '🤖' },                  // AI coaching and guidance
    { id: 'dashboard', label: '3D Dashboard', icon: '🌌' },          // 3D visualization dashboard
    { id: 'comprehensive', label: 'AI Studio', icon: '🎬' },         // Comprehensive content creation suite
    { id: 'marketplace', label: 'Marketplace', icon: '🛒' },         // Template marketplace for buying/selling
    { id: 'sponsorship', label: 'Sponsorships', icon: '🤝' },        // AI-powered sponsorship proposals
    { id: 'community', label: 'Community', icon: '🌟' },             // Creator community and social features
    { id: 'support', label: 'Support', icon: '🆘' },                 // AI support chatbot and help
    { id: 'pricing', label: 'Pricing', icon: '💎' }                  // Subscription plans and billing
  ];

  /**
   * Function to render the appropriate component based on the active tab
   * 
   * This is a switch statement that returns the corresponding React component
   * for each tab. This pattern allows us to conditionally render different
   * features without cluttering the main component.
   * 
   * @returns {JSX.Element} The component for the currently active tab
   */
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'post':
        // Simplified posting workflow - main feature for easy posting
        return <SimplePostingWorkflow userId="demo-user" />;
      case 'generator':
        // AI-powered content generation form with advanced features
        return <EnhancedContentForm />;
      case 'optimizer':
        // Smart post optimization with virality scoring
        return <SmartPostOptimizer />;
      case 'analytics':
        // Advanced analytics dashboard with comprehensive metrics
        return <AnalyticsDashboard />;
      case 'team':
        // Team workspace with collaboration features
        return <TeamWorkspace />;
      case 'coach':
        // AI coaching chat interface for guidance
        return <AICoachingChat />;
      case 'dashboard':
        // 3D interactive dashboard with content plans visualization
        // Passes contentPlans data and click handler for interactivity
        return <Dashboard3D contentPlans={contentPlans} onCardClick={(plan) => console.log('Card clicked:', plan)} />;
      case 'comprehensive':
        // All-in-one content creation suite with multiple AI tools
        return <ComprehensiveContentCreator />;
      case 'marketplace':
        // Template marketplace for buying and selling content
        return <CreatorMarketplace />;
      case 'sponsorship':
        // AI-powered sponsorship proposal generation
        return <SponsorshipProposals />;
      case 'community':
        // Creator community feed with social features
        return <CreatorFeed />;
      case 'support':
        // AI support chatbot and help system
        return <AISupportChatbot />;
      case 'pricing':
        // Subscription plans and billing information
        return <PricingPage />;
      default:
        // Fallback to content generator if tab is not recognized
        return <EnhancedContentForm />;
    }
  };

  return (
    // Main container with gradient background - creates the futuristic glass effect
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 
        Header Section - Contains the app title and user info
        Uses Framer Motion for smooth entrance animation
      */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}  // Starts invisible and above
        animate={{ opacity: 1, y: 0 }}    // Animates to visible and normal position
        className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-6"  // Glassmorphic styling
      >
        <div className="max-w-6xl mx-auto">  {/* Centered container with max width */}
          <div className="flex items-center justify-between">  {/* Flexbox for header layout */}
            {/* Left side - App branding */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🚀 ViralFlow
              </h1>
              <p className="text-blue-200">
                Your AI-powered content creation & influencer platform
              </p>
            </div>
            
            {/* Right side - User profile info and notifications */}
            <div className="flex items-center space-x-4">
              {/* Notification System */}
              <NotificationSystem userId="demo-user" />
              
              <div className="text-right">
                <p className="text-white font-bold">Level 3 Creator</p>  {/* User level */}
                <p className="text-blue-200 text-sm">1,250 XP</p>        {/* Experience points */}
              </div>
              {/* User avatar with crown icon */}
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">👑</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 
        Navigation Tabs Section - Horizontal tab navigation
        This allows users to switch between different features of the app
      */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex space-x-2 bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
          {/* 
            Map through all tabs and create clickable buttons
            Each tab button has hover and tap animations
          */}
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}  // Unique key for React rendering
              onClick={() => setActiveTab(tab.id as TabType)}  // Switch active tab on click
              whileHover={{ scale: 1.05 }}  // Slight scale up on hover
              whileTap={{ scale: 0.95 }}    // Slight scale down on tap
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all ${
                // Conditional styling based on whether tab is active
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'  // Active tab styling
                  : 'text-blue-200 hover:bg-white/20'  // Inactive tab styling with hover effect
              }`}
            >
              <span className="text-xl">{tab.icon}</span>  {/* Emoji icon */}
              <span className="font-medium">{tab.label}</span>  {/* Tab label */}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 
        Main Content Area - Where the active tab's component is rendered
        Uses Framer Motion for smooth transitions between tabs
      */}
      <motion.div
        key={activeTab}  // Key forces re-render when tab changes
        initial={{ opacity: 0, y: 20 }}  // Starts invisible and below
        animate={{ opacity: 1, y: 0 }}   // Animates to visible and normal position
        transition={{ duration: 0.3 }}   // 300ms transition duration
        className="max-w-6xl mx-auto px-6 pb-8"  // Centered container with padding
      >
        {/* Render the component for the currently active tab */}
        {renderActiveTab()}
      </motion.div>

      {/* 
        Footer Section - App branding and feature highlights
        Uses subtle glassmorphic styling to match the overall design
      */}
      <motion.div
        initial={{ opacity: 0 }}  // Starts invisible
        animate={{ opacity: 1 }}  // Fades in
        className="bg-white/5 backdrop-blur-xl border-t border-white/20 p-6 mt-8"  // Glassmorphic footer
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Main footer text */}
          <p className="text-blue-200">
            Powered by AI • Built with Next.js • Enhanced with Framer Motion
          </p>
          
          {/* Feature highlights */}
          <div className="flex justify-center space-x-6 mt-4">
            <span className="text-white/60">✨ Liquid Glass UI</span>
            <span className="text-white/60">🎯 Smart Optimization</span>
            <span className="text-white/60">🤖 AI Coaching</span>
            <span className="text-white/60">🌌 3D Dashboard</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}