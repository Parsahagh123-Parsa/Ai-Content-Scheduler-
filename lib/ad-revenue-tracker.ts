import { SupabaseClient } from '@supabase/supabase-js';

export interface AdRevenueData {
  platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter';
  videoId: string;
  title: string;
  views: number;
  revenue: number;
  cpm: number; // Cost per mille (revenue per 1000 views)
  date: Date;
  duration: number; // in seconds
  category: string;
  monetizationStatus: 'monetized' | 'demonetized' | 'pending';
  adTypes: string[];
  demographics: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    countries: Record<string, number>;
  };
  performance: {
    clickThroughRate: number;
    watchTime: number;
    retentionRate: number;
    engagementRate: number;
  };
}

export interface RevenueAnalytics {
  totalRevenue: number;
  averageRevenue: number;
  topPerformingVideos: AdRevenueData[];
  revenueByPlatform: Record<string, number>;
  revenueByCategory: Record<string, number>;
  revenueByMonth: Record<string, number>;
  growthRate: number;
  projections: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
  insights: string[];
  recommendations: string[];
}

export interface PlatformAPI {
  name: string;
  baseUrl: string;
  authMethod: 'oauth' | 'api_key' | 'bearer';
  endpoints: {
    revenue: string;
    analytics: string;
    videos: string;
  };
  rateLimits: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
}

export class AdRevenueTracker {
  private supabase: SupabaseClient;
  private platformAPIs: Record<string, PlatformAPI>;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.platformAPIs = {
      youtube: {
        name: 'YouTube Analytics API',
        baseUrl: 'https://www.googleapis.com/youtube/analytics/v2',
        authMethod: 'oauth',
        endpoints: {
          revenue: '/reports',
          analytics: '/reports',
          videos: '/videos'
        },
        rateLimits: {
          requestsPerMinute: 100,
          requestsPerDay: 10000
        }
      },
      tiktok: {
        name: 'TikTok Creator Fund API',
        baseUrl: 'https://open-api.tiktok.com',
        authMethod: 'oauth',
        endpoints: {
          revenue: '/creator/fund/analytics',
          analytics: '/creator/analytics',
          videos: '/creator/videos'
        },
        rateLimits: {
          requestsPerMinute: 60,
          requestsPerDay: 5000
        }
      },
      instagram: {
        name: 'Instagram Basic Display API',
        baseUrl: 'https://graph.instagram.com',
        authMethod: 'oauth',
        endpoints: {
          revenue: '/insights',
          analytics: '/insights',
          videos: '/media'
        },
        rateLimits: {
          requestsPerMinute: 200,
          requestsPerDay: 10000
        }
      },
      twitter: {
        name: 'Twitter API v2',
        baseUrl: 'https://api.twitter.com/2',
        authMethod: 'bearer',
        endpoints: {
          revenue: '/tweets/analytics',
          analytics: '/tweets/analytics',
          videos: '/tweets'
        },
        rateLimits: {
          requestsPerMinute: 300,
          requestsPerDay: 15000
        }
      }
    };
  }

  async fetchRevenueData(userId: string, platform: string, dateRange: { start: Date; end: Date }): Promise<AdRevenueData[]> {
    try {
      // Get user's API credentials
      const credentials = await this.getUserAPICredentials(userId, platform);
      if (!credentials) {
        throw new Error(`No API credentials found for ${platform}`);
      }

      // Fetch data from platform API
      const apiData = await this.callPlatformAPI(platform, credentials, dateRange);
      
      // Process and normalize data
      const revenueData = this.processRevenueData(apiData, platform);
      
      // Save to database
      await this.saveRevenueData(userId, revenueData);
      
      return revenueData;
    } catch (error) {
      console.error(`Error fetching revenue data for ${platform}:`, error);
      throw new Error(`Failed to fetch revenue data for ${platform}`);
    }
  }

  private async getUserAPICredentials(userId: string, platform: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('user_api_credentials')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', platform)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching API credentials:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching API credentials:', error);
      return null;
    }
  }

  private async callPlatformAPI(platform: string, credentials: any, dateRange: { start: Date; end: Date }): Promise<any> {
    const api = this.platformAPIs[platform];
    if (!api) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    // Mock API call - in real implementation, this would make actual API calls
    const mockData = this.generateMockRevenueData(platform, dateRange);
    return mockData;
  }

  private generateMockRevenueData(platform: string, dateRange: { start: Date; end: Date }): any {
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const data = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);

      data.push({
        videoId: `video_${platform}_${Date.now()}_${i}`,
        title: `${platform} Content ${i + 1}`,
        views: Math.floor(Math.random() * 100000) + 10000,
        revenue: Math.floor(Math.random() * 100) + 10,
        cpm: Math.floor(Math.random() * 5) + 1,
        date: date.toISOString(),
        duration: Math.floor(Math.random() * 300) + 60,
        category: ['entertainment', 'educational', 'lifestyle', 'comedy'][Math.floor(Math.random() * 4)],
        monetizationStatus: 'monetized',
        adTypes: ['pre-roll', 'mid-roll', 'post-roll'].slice(0, Math.floor(Math.random() * 3) + 1),
        demographics: {
          ageGroups: {
            '18-24': Math.floor(Math.random() * 30) + 20,
            '25-34': Math.floor(Math.random() * 40) + 30,
            '35-44': Math.floor(Math.random() * 20) + 10,
            '45+': Math.floor(Math.random() * 10) + 5
          },
          genders: {
            'male': Math.floor(Math.random() * 60) + 30,
            'female': Math.floor(Math.random() * 60) + 30,
            'other': Math.floor(Math.random() * 5) + 1
          },
          countries: {
            'US': Math.floor(Math.random() * 40) + 20,
            'UK': Math.floor(Math.random() * 15) + 5,
            'Canada': Math.floor(Math.random() * 10) + 3,
            'Australia': Math.floor(Math.random() * 8) + 2,
            'Other': Math.floor(Math.random() * 30) + 10
          }
        },
        performance: {
          clickThroughRate: Math.floor(Math.random() * 10) + 2,
          watchTime: Math.floor(Math.random() * 100) + 50,
          retentionRate: Math.floor(Math.random() * 30) + 40,
          engagementRate: Math.floor(Math.random() * 20) + 5
        }
      });
    }

    return data;
  }

  private processRevenueData(apiData: any[], platform: string): AdRevenueData[] {
    return apiData.map(item => ({
      platform: platform as any,
      videoId: item.videoId,
      title: item.title,
      views: item.views,
      revenue: item.revenue,
      cpm: item.cpm,
      date: new Date(item.date),
      duration: item.duration,
      category: item.category,
      monetizationStatus: item.monetizationStatus as any,
      adTypes: item.adTypes,
      demographics: item.demographics,
      performance: item.performance
    }));
  }

  private async saveRevenueData(userId: string, revenueData: AdRevenueData[]): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('ad_revenue_data')
        .insert(revenueData.map(data => ({
          user_id: userId,
          platform: data.platform,
          video_id: data.videoId,
          title: data.title,
          views: data.views,
          revenue: data.revenue,
          cpm: data.cpm,
          date: data.date.toISOString(),
          duration: data.duration,
          category: data.category,
          monetization_status: data.monetizationStatus,
          ad_types: data.adTypes,
          demographics: data.demographics,
          performance: data.performance
        })));

      if (error) {
        console.error('Error saving revenue data:', error);
      }
    } catch (error) {
      console.error('Error saving revenue data:', error);
    }
  }

  async getRevenueAnalytics(userId: string, dateRange: { start: Date; end: Date }): Promise<RevenueAnalytics> {
    try {
      const { data, error } = await this.supabase
        .from('ad_revenue_data')
        .select('*')
        .eq('user_id', userId)
        .gte('date', dateRange.start.toISOString())
        .lte('date', dateRange.end.toISOString());

      if (error) {
        console.error('Error fetching revenue analytics:', error);
        throw new Error('Failed to fetch revenue analytics');
      }

      const revenueData = (data || []).map((item: any) => ({
        platform: item.platform,
        videoId: item.video_id,
        title: item.title,
        views: item.views,
        revenue: item.revenue,
        cpm: item.cpm,
        date: new Date(item.date),
        duration: item.duration,
        category: item.category,
        monetizationStatus: item.monetization_status,
        adTypes: item.ad_types,
        demographics: item.demographics,
        performance: item.performance
      }));

      return this.calculateRevenueAnalytics(revenueData);
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      throw new Error('Failed to get revenue analytics');
    }
  }

  private calculateRevenueAnalytics(revenueData: AdRevenueData[]): RevenueAnalytics {
    const totalRevenue = revenueData.reduce((sum, data) => sum + data.revenue, 0);
    const averageRevenue = totalRevenue / revenueData.length || 0;

    // Top performing videos
    const topPerformingVideos = revenueData
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Revenue by platform
    const revenueByPlatform = revenueData.reduce((acc, data) => {
      acc[data.platform] = (acc[data.platform] || 0) + data.revenue;
      return acc;
    }, {} as Record<string, number>);

    // Revenue by category
    const revenueByCategory = revenueData.reduce((acc, data) => {
      acc[data.category] = (acc[data.category] || 0) + data.revenue;
      return acc;
    }, {} as Record<string, number>);

    // Revenue by month
    const revenueByMonth = revenueData.reduce((acc, data) => {
      const month = data.date.toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + data.revenue;
      return acc;
    }, {} as Record<string, number>);

    // Calculate growth rate
    const months = Object.keys(revenueByMonth).sort();
    const growthRate = months.length > 1 
      ? ((revenueByMonth[months[months.length - 1]] - revenueByMonth[months[0]]) / revenueByMonth[months[0]]) * 100
      : 0;

    // Generate projections
    const projections = {
      nextMonth: totalRevenue * 1.1,
      nextQuarter: totalRevenue * 1.3,
      nextYear: totalRevenue * 1.5
    };

    // Generate insights and recommendations
    const insights = this.generateInsights(revenueData, totalRevenue, averageRevenue);
    const recommendations = this.generateRecommendations(revenueData, revenueByPlatform, revenueByCategory);

    return {
      totalRevenue,
      averageRevenue,
      topPerformingVideos,
      revenueByPlatform,
      revenueByCategory,
      revenueByMonth,
      growthRate,
      projections,
      insights,
      recommendations
    };
  }

  private generateInsights(revenueData: AdRevenueData[], totalRevenue: number, averageRevenue: number): string[] {
    const insights = [];

    if (totalRevenue > 1000) {
      insights.push('Your content is generating significant revenue!');
    }

    const avgViews = revenueData.reduce((sum, data) => sum + data.views, 0) / revenueData.length;
    if (avgViews > 50000) {
      insights.push('High view counts indicate strong content performance');
    }

    const avgCPM = revenueData.reduce((sum, data) => sum + data.cpm, 0) / revenueData.length;
    if (avgCPM > 3) {
      insights.push('Above-average CPM suggests good advertiser demand');
    }

    const monetizedVideos = revenueData.filter(data => data.monetizationStatus === 'monetized').length;
    const monetizationRate = (monetizedVideos / revenueData.length) * 100;
    if (monetizationRate > 80) {
      insights.push('High monetization rate indicates good content compliance');
    }

    return insights;
  }

  private generateRecommendations(revenueData: AdRevenueData[], revenueByPlatform: Record<string, number>, revenueByCategory: Record<string, number>): string[] {
    const recommendations = [];

    // Platform recommendations
    const topPlatform = Object.keys(revenueByPlatform).reduce((a, b) => revenueByPlatform[a] > revenueByPlatform[b] ? a : b);
    recommendations.push(`Focus more content on ${topPlatform} for higher revenue`);

    // Category recommendations
    const topCategory = Object.keys(revenueByCategory).reduce((a, b) => revenueByCategory[a] > revenueByCategory[b] ? a : b);
    recommendations.push(`Increase ${topCategory} content for better monetization`);

    // Performance recommendations
    const avgRetention = revenueData.reduce((sum, data) => sum + data.performance.retentionRate, 0) / revenueData.length;
    if (avgRetention < 50) {
      recommendations.push('Improve video retention by creating more engaging content');
    }

    const avgEngagement = revenueData.reduce((sum, data) => sum + data.performance.engagementRate, 0) / revenueData.length;
    if (avgEngagement < 10) {
      recommendations.push('Increase engagement with better calls-to-action and community interaction');
    }

    return recommendations;
  }

  async syncAllPlatforms(userId: string, dateRange: { start: Date; end: Date }): Promise<Record<string, AdRevenueData[]>> {
    const results: Record<string, AdRevenueData[]> = {};
    
    for (const platform of Object.keys(this.platformAPIs)) {
      try {
        const data = await this.fetchRevenueData(userId, platform, dateRange);
        results[platform] = data;
      } catch (error) {
        console.error(`Error syncing ${platform}:`, error);
        results[platform] = [];
      }
    }
    
    return results;
  }

  async getRevenueSummary(userId: string): Promise<{
    totalRevenue: number;
    totalViews: number;
    averageCPM: number;
    topPlatform: string;
    topCategory: string;
    growthRate: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('ad_revenue_data')
        .select('*')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (error) {
        console.error('Error fetching revenue summary:', error);
        throw new Error('Failed to fetch revenue summary');
      }

      const revenueData = data || [];
      const totalRevenue = revenueData.reduce((sum: number, item: any) => sum + item.revenue, 0);
      const totalViews = revenueData.reduce((sum: number, item: any) => sum + item.views, 0);
      const averageCPM = revenueData.reduce((sum: number, item: any) => sum + item.cpm, 0) / revenueData.length || 0;

      const platformRevenue = revenueData.reduce((acc: Record<string, number>, item: any) => {
        acc[item.platform] = (acc[item.platform] || 0) + item.revenue;
        return acc;
      }, {});

      const categoryRevenue = revenueData.reduce((acc: Record<string, number>, item: any) => {
        acc[item.category] = (acc[item.category] || 0) + item.revenue;
        return acc;
      }, {});

      const topPlatform = Object.keys(platformRevenue).reduce((a, b) => platformRevenue[a] > platformRevenue[b] ? a : b, '');
      const topCategory = Object.keys(categoryRevenue).reduce((a, b) => categoryRevenue[a] > categoryRevenue[b] ? a : b, '');

      return {
        totalRevenue,
        totalViews,
        averageCPM,
        topPlatform,
        topCategory,
        growthRate: 0 // Would calculate based on historical data
      };
    } catch (error) {
      console.error('Error getting revenue summary:', error);
      throw new Error('Failed to get revenue summary');
    }
  }
}
