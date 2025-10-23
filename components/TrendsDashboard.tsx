"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Hash, Clock, RefreshCw, Search, Filter } from "lucide-react";
import { getTrendingTopics, getLiveHashtags, TrendingTopic } from "@/lib/trends";

export default function TrendsDashboard() {
  const [trends, setTrends] = useState<{ [platform: string]: TrendingTopic[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState("tiktok");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [liveHashtags, setLiveHashtags] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const platforms = [
    { id: "tiktok", name: "TikTok", icon: "🎵", color: "bg-pink-500" },
    { id: "youtube-shorts", name: "YouTube Shorts", icon: "📺", color: "bg-red-500" },
    { id: "instagram", name: "Instagram", icon: "📸", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { id: "linkedin", name: "LinkedIn", icon: "💼", color: "bg-blue-600" },
  ];

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const platformTrends: { [platform: string]: TrendingTopic[] } = {};
      
      for (const platform of platforms) {
        const platformData = await getTrendingTopics(platform.id);
        platformTrends[platform.id] = platformData;
      }
      
      setTrends(platformTrends);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordSearch = async () => {
    if (!searchKeyword.trim()) return;
    
    try {
      const hashtags = await getLiveHashtags(searchKeyword);
      setLiveHashtags(hashtags);
    } catch (error) {
      console.error('Error fetching live hashtags:', error);
    }
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.icon || "📱";
  };

  const getPlatformColor = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.color || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading trending topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              Live Trends Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time trending topics and hashtags across platforms
            </p>
          </div>
          <button
            onClick={loadTrends}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        
        {lastUpdated && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Platform Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setSelectedPlatform(platform.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              selectedPlatform === platform.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border hover:bg-accent'
            }`}
          >
            <span className="text-lg">{platform.icon}</span>
            <span>{platform.name}</span>
          </button>
        ))}
      </div>

      {/* Live Hashtag Search */}
      <div className="mb-8 p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Live Hashtag Search
        </h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Enter a keyword (e.g., 'fitness', 'cooking')"
            className="flex-1 px-4 py-2 border border-input rounded-lg bg-background"
            onKeyPress={(e) => e.key === 'Enter' && handleKeywordSearch()}
          />
          <button
            onClick={handleKeywordSearch}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Search
          </button>
        </div>
        
        {liveHashtags.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Live Hashtags for "{searchKeyword}":</h4>
            <div className="flex flex-wrap gap-2">
              {liveHashtags.map((hashtag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {hashtag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trending Topics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const platformTrends = trends[platform.id] || [];
          const isActive = selectedPlatform === platform.id;
          
          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg border transition-all ${
                isActive ? 'ring-2 ring-primary' : 'hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${getPlatformColor(platform.id)} flex items-center justify-center text-white`}>
                    <span className="text-lg">{platform.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{platform.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {platformTrends.length} trending topics
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live
                </div>
              </div>

              <div className="space-y-3">
                {platformTrends.slice(0, 5).map((trend, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{trend.topic}</div>
                      <div className="text-sm text-muted-foreground">{trend.hashtag}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(trend.popularity / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {platformTrends.length > 5 && (
                <button className="w-full mt-4 text-sm text-primary hover:text-primary/80">
                  View all {platformTrends.length} trends →
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Trends automatically update every 6 hours
        </p>
      </div>
    </div>
  );
}
