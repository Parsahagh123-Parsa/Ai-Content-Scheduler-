'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  VideoCameraIcon, 
  MusicalNoteIcon, 
  SpeakerWaveIcon,
  PhotoIcon,
  ScissorsIcon,
  ChatBubbleLeftRightIcon,
  RocketLaunchIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import MediaCarousel from './MediaCarousel';

interface ComprehensiveContentCreatorProps {
  onContentGenerated?: (content: any) => void;
  className?: string;
}

interface GeneratedContent {
  viralHooks?: any;
  brollSuggestions?: any;
  thumbnailSuggestions?: any;
  ttsResult?: any;
  musicResult?: any;
  autoEditResult?: any;
  subtitleResult?: any;
  contentPlan?: any;
  optimizationResult?: any;
  summary?: any;
}

const ComprehensiveContentCreator: React.FC<ComprehensiveContentCreatorProps> = ({
  onContentGenerated,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    content: '',
    platform: 'tiktok',
    contentType: 'entertainment',
    targetAudience: 'general',
    duration: 30,
    style: 'bold',
    mood: 'energetic'
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: RocketLaunchIcon },
    { id: 'hooks', name: 'Viral Hooks', icon: SparklesIcon },
    { id: 'broll', name: 'B-Roll', icon: VideoCameraIcon },
    { id: 'thumbnails', name: 'Thumbnails', icon: PhotoIcon },
    { id: 'audio', name: 'Audio', icon: MusicalNoteIcon },
    { id: 'video', name: 'Video', icon: ScissorsIcon },
    { id: 'text', name: 'Text', icon: ChatBubbleLeftRightIcon }
  ];

  const handleGenerate = async () => {
    if (!formData.content.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/comprehensive-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'comprehensive',
          ...formData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const result = await response.json();
      setGeneratedContent(result.result);
      
      if (onContentGenerated) {
        onContentGenerated(result.result);
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderOverview = () => {
    if (!generatedContent?.summary) return null;

    return (
      <div className="space-y-6">
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-2xl font-bold text-white mb-4">Content Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {generatedContent.summary.totalFeatures}
              </div>
              <div className="text-gray-300">AI Features</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {generatedContent.summary.estimatedEngagement}%
              </div>
              <div className="text-gray-300">Engagement Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {formData.platform.toUpperCase()}
              </div>
              <div className="text-gray-300">Platform</div>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">Recommended Actions</h3>
          <ul className="space-y-2">
            {generatedContent.summary.recommendedActions.map((action: string, index: number) => (
              <li key={index} className="flex items-center space-x-2 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderViralHooks = () => {
    if (!generatedContent?.viralHooks) return null;

    return (
      <div className="space-y-4">
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">Viral Hook Suggestions</h3>
          <div className="space-y-3">
            {generatedContent.viralHooks.hooks?.slice(0, 5).map((hook: any, index: number) => (
              <div key={index} className="p-4 bg-white bg-opacity-10 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white font-medium">{hook.text}</p>
                  <span className="text-blue-400 font-bold">{hook.viralityScore}%</span>
                </div>
                <p className="text-gray-300 text-sm">{hook.reasoning}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hook.variations?.slice(0, 2).map((variation: string, vIndex: number) => (
                    <span key={vIndex} className="text-xs bg-blue-500 bg-opacity-20 text-blue-300 px-2 py-1 rounded">
                      {variation}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderBroll = () => {
    if (!generatedContent?.brollSuggestions) return null;

    return (
      <div className="space-y-4">
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">B-Roll Recommendations</h3>
          <div className="space-y-3">
            {generatedContent.brollSuggestions.suggestions?.slice(0, 5).map((suggestion: any, index: number) => (
              <div key={index} className="p-4 bg-white bg-opacity-10 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white font-medium">{suggestion.description}</p>
                  <span className="text-green-400 font-bold">{suggestion.difficulty}</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{suggestion.purpose}</p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.visualElements?.slice(0, 3).map((element: string, eIndex: number) => (
                    <span key={eIndex} className="text-xs bg-green-500 bg-opacity-20 text-green-300 px-2 py-1 rounded">
                      {element}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderThumbnails = () => {
    if (!generatedContent?.thumbnailSuggestions) return null;

    return (
      <div className="space-y-4">
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">Thumbnail Suggestions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedContent.thumbnailSuggestions.suggestions?.slice(0, 4).map((suggestion: any, index: number) => (
              <div key={index} className="p-4 bg-white bg-opacity-10 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white font-medium">{suggestion.title}</p>
                  <span className="text-purple-400 font-bold">{suggestion.ctrOptimization.score}%</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{suggestion.description}</p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.elements?.slice(0, 3).map((element: string, eIndex: number) => (
                    <span key={eIndex} className="text-xs bg-purple-500 bg-opacity-20 text-purple-300 px-2 py-1 rounded">
                      {element}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAudio = () => {
    if (!generatedContent?.ttsResult || !generatedContent?.musicResult) return null;

    return (
      <div className="space-y-4">
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">Audio Generation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white bg-opacity-10 rounded-lg">
              <h4 className="text-white font-medium mb-2">Text-to-Speech</h4>
              <p className="text-gray-300 text-sm mb-2">Duration: {generatedContent.ttsResult.duration}s</p>
              <p className="text-gray-300 text-sm mb-2">Format: {generatedContent.ttsResult.format}</p>
              <div className="flex items-center space-x-2">
                <SpeakerWaveIcon className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 text-sm">Voice: {generatedContent.ttsResult.settings.voice}</span>
              </div>
            </div>
            <div className="p-4 bg-white bg-opacity-10 rounded-lg">
              <h4 className="text-white font-medium mb-2">Background Music</h4>
              <p className="text-gray-300 text-sm mb-2">Style: {generatedContent.musicResult.style}</p>
              <p className="text-gray-300 text-sm mb-2">Mood: {generatedContent.musicResult.mood}</p>
              <div className="flex items-center space-x-2">
                <MusicalNoteIcon className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm">Genre: {generatedContent.musicResult.genre}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVideo = () => {
    if (!generatedContent?.autoEditResult) return null;

    return (
      <div className="space-y-4">
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">Auto-Edit Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{generatedContent.autoEditResult.cuts}</div>
              <div className="text-gray-300">Cuts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{generatedContent.autoEditResult.highlights}</div>
              <div className="text-gray-300">Highlights</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{generatedContent.autoEditResult.transitions}</div>
              <div className="text-gray-300">Transitions</div>
            </div>
          </div>
          <div className="space-y-2">
            {generatedContent.autoEditResult.segments?.slice(0, 3).map((segment: any, index: number) => (
              <div key={index} className="p-3 bg-white bg-opacity-10 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{segment.type}</span>
                  <span className="text-gray-300 text-sm">
                    {segment.startTime}s - {segment.endTime}s
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{segment.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderText = () => {
    if (!generatedContent?.subtitleResult) return null;

    return (
      <div className="space-y-4">
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">Subtitle Generation</h3>
          <div className="space-y-3">
            {generatedContent.subtitleResult.segments?.slice(0, 5).map((segment: any, index: number) => (
              <div key={index} className="p-4 bg-white bg-opacity-10 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white font-medium">{segment.text}</p>
                  <span className="text-yellow-400 font-bold">{segment.confidence}%</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <span>Start: {segment.startTime}s</span>
                  <span>End: {segment.endTime}s</span>
                  <span>Style: {segment.style.fontSize}px</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'hooks':
        return renderViralHooks();
      case 'broll':
        return renderBroll();
      case 'thumbnails':
        return renderThumbnails();
      case 'audio':
        return renderAudio();
      case 'video':
        return renderVideo();
      case 'text':
        return renderText();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      <div className="glass p-8 rounded-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            🚀 Comprehensive Content Creator
          </h2>
          <p className="text-gray-300">
            Generate viral content with AI-powered hooks, B-roll, thumbnails, audio, and more
          </p>
        </div>

        {/* Input Form */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Content Topic</label>
              <input
                type="text"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter your content topic..."
                className="w-full p-3 rounded-lg bg-white bg-opacity-15 border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full p-3 rounded-lg bg-white bg-opacity-15 border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white"
              >
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Content Type</label>
              <select
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                className="w-full p-3 rounded-lg bg-white bg-opacity-15 border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white"
              >
                <option value="entertainment">Entertainment</option>
                <option value="educational">Educational</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="comedy">Comedy</option>
                <option value="motivational">Motivational</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Duration (seconds)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full p-3 rounded-lg bg-white bg-opacity-15 border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white"
                min="15"
                max="300"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Mood</label>
              <select
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                className="w-full p-3 rounded-lg bg-white bg-opacity-15 border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white"
              >
                <option value="energetic">Energetic</option>
                <option value="calm">Calm</option>
                <option value="dramatic">Dramatic</option>
                <option value="funny">Funny</option>
                <option value="inspiring">Inspiring</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.content.trim()}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              {isGenerating ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <RocketLaunchIcon className="w-5 h-5" />
                  <span>Generate Comprehensive Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {generatedContent && (
          <div className="mt-8">
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-600'
                      : 'bg-white bg-opacity-15 text-white hover:bg-opacity-25'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderActiveTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveContentCreator;
