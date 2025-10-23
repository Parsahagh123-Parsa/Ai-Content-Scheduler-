import { openai } from './openai';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AutoScheduleRequest {
  userId: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'twitter';
  contentType: 'educational' | 'entertainment' | 'lifestyle' | 'comedy' | 'motivational' | 'tutorial';
  niche: string;
  targetAudience: string;
  postingFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  optimalTimes: string[];
  timezone: string;
  includeWeekends: boolean;
  maxPostsPerDay: number;
  contentMix: {
    educational: number;
    entertainment: number;
    promotional: number;
    personal: number;
  };
  tier: 'pro' | 'elite' | 'agency';
}

export interface ScheduledPost {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  platform: string;
  scheduledTime: Date;
  contentType: string;
  viralPotential: number;
  engagementPrediction: number;
  optimalTime: boolean;
  contentMix: string;
  status: 'scheduled' | 'published' | 'failed' | 'draft';
  metadata: {
    generatedAt: Date;
    aiConfidence: number;
    trendingTopics: string[];
    seasonalRelevance: number;
  };
}

export interface AutoScheduleResponse {
  posts: ScheduledPost[];
  schedule: {
    totalPosts: number;
    duration: number; // in days
    frequency: string;
    optimalTimes: string[];
    contentDistribution: Record<string, number>;
  };
  analytics: {
    estimatedReach: number;
    engagementPrediction: number;
    viralPotential: number;
    bestPerformingTimes: string[];
    recommendedAdjustments: string[];
  };
  metadata: {
    generatedAt: Date;
    userId: string;
    tier: string;
    platform: string;
    nextOptimization: Date;
  };
}

export class AutoSchedulePro {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async generateAutoSchedule(request: AutoScheduleRequest): Promise<AutoScheduleResponse> {
    try {
      // Generate content posts using AI
      const posts = await this.generateScheduledPosts(request);
      
      // Calculate optimal posting times
      const optimalTimes = await this.calculateOptimalTimes(request);
      
      // Generate schedule analytics
      const analytics = await this.generateScheduleAnalytics(posts, request);
      
      // Create schedule response
      const response: AutoScheduleResponse = {
        posts,
        schedule: {
          totalPosts: posts.length,
          duration: this.calculateDuration(request.postingFrequency),
          frequency: request.postingFrequency,
          optimalTimes: optimalTimes,
          contentDistribution: this.calculateContentDistribution(posts)
        },
        analytics,
        metadata: {
          generatedAt: new Date(),
          userId: request.userId,
          tier: request.tier,
          platform: request.platform,
          nextOptimization: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      };

      // Save to database
      await this.saveScheduleToDatabase(response);

      return response;
    } catch (error) {
      console.error('Error generating auto schedule:', error);
      throw new Error('Failed to generate auto schedule');
    }
  }

  private async generateScheduledPosts(request: AutoScheduleRequest): Promise<ScheduledPost[]> {
    const posts: ScheduledPost[] = [];
    const totalPosts = this.calculateTotalPosts(request);
    
    // Generate posts in batches
    const batchSize = 5;
    for (let i = 0; i < totalPosts; i += batchSize) {
      const batch = await this.generatePostBatch(request, i, Math.min(i + batchSize, totalPosts));
      posts.push(...batch);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return posts;
  }

  private async generatePostBatch(
    request: AutoScheduleRequest, 
    startIndex: number, 
    endIndex: number
  ): Promise<ScheduledPost[]> {
    const systemPrompt = `You are an expert content strategist for ${request.platform}. Generate engaging, viral-worthy content posts.

Consider:
- Platform-specific best practices and algorithms
- Target audience preferences and behaviors
- Content mix requirements
- Trending topics and hashtags
- Optimal posting times
- Viral potential and engagement factors

For each post, provide:
- Compelling title and caption
- Relevant hashtags (platform-appropriate)
- Content type and mix
- Viral potential score (0-100)
- Engagement prediction (0-100)
- Trending topics to include`;

    const userPrompt = `Generate ${endIndex - startIndex} content posts for:

Platform: ${request.platform}
Niche: ${request.niche}
Target Audience: ${request.targetAudience}
Content Mix: ${JSON.stringify(request.contentMix)}
Posting Frequency: ${request.postingFrequency}
Tier: ${request.tier}

Create diverse, engaging content that will perform well on ${request.platform}.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated');
      }

      const data = JSON.parse(content);
      const generatedPosts = data.posts || [];

      return generatedPosts.map((post: any, index: number) => ({
        id: `post_${Date.now()}_${startIndex + index}`,
        title: post.title || `Post ${startIndex + index + 1}`,
        caption: post.caption || '',
        hashtags: post.hashtags || [],
        platform: request.platform,
        scheduledTime: this.calculateScheduledTime(request, startIndex + index),
        contentType: post.contentType || 'entertainment',
        viralPotential: post.viralPotential || Math.floor(Math.random() * 40) + 60,
        engagementPrediction: post.engagementPrediction || Math.floor(Math.random() * 30) + 70,
        optimalTime: this.isOptimalTime(request, startIndex + index),
        contentMix: post.contentMix || 'entertainment',
        status: 'scheduled' as const,
        metadata: {
          generatedAt: new Date(),
          aiConfidence: post.aiConfidence || 80,
          trendingTopics: post.trendingTopics || [],
          seasonalRelevance: post.seasonalRelevance || 70
        }
      }));
    } catch (error) {
      console.error('Error generating post batch:', error);
      return this.generateFallbackPosts(request, startIndex, endIndex);
    }
  }

  private generateFallbackPosts(request: AutoScheduleRequest, startIndex: number, endIndex: number): ScheduledPost[] {
    const posts: ScheduledPost[] = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      posts.push({
        id: `post_${Date.now()}_${i}`,
        title: `${request.niche} Content ${i + 1}`,
        caption: `Engaging ${request.niche} content for ${request.targetAudience}`,
        hashtags: [`#${request.niche}`, '#content', '#viral'],
        platform: request.platform,
        scheduledTime: this.calculateScheduledTime(request, i),
        contentType: this.getContentTypeFromMix(request.contentMix, i),
        viralPotential: Math.floor(Math.random() * 40) + 60,
        engagementPrediction: Math.floor(Math.random() * 30) + 70,
        optimalTime: this.isOptimalTime(request, i),
        contentMix: this.getContentTypeFromMix(request.contentMix, i),
        status: 'scheduled',
        metadata: {
          generatedAt: new Date(),
          aiConfidence: 70,
          trendingTopics: [],
          seasonalRelevance: 70
        }
      });
    }
    
    return posts;
  }

  private calculateTotalPosts(request: AutoScheduleRequest): number {
    const frequencyMap = {
      daily: 30,
      weekly: 4,
      'bi-weekly': 2,
      monthly: 1
    };
    
    return frequencyMap[request.postingFrequency] * request.maxPostsPerDay;
  }

  private calculateScheduledTime(request: AutoScheduleRequest, index: number): Date {
    const now = new Date();
    const daysOffset = Math.floor(index / request.maxPostsPerDay);
    const timeIndex = index % request.maxPostsPerDay;
    
    const scheduledDate = new Date(now);
    scheduledDate.setDate(scheduledDate.getDate() + daysOffset);
    
    // Use optimal times or default to business hours
    const optimalTimes = request.optimalTimes.length > 0 ? request.optimalTimes : ['09:00', '12:00', '15:00', '18:00'];
    const timeString = optimalTimes[timeIndex % optimalTimes.length];
    const [hours, minutes] = timeString.split(':').map(Number);
    
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    return scheduledDate;
  }

  private isOptimalTime(request: AutoScheduleRequest, index: number): boolean {
    const scheduledTime = this.calculateScheduledTime(request, index);
    const hour = scheduledTime.getHours();
    
    // Optimal times vary by platform
    const optimalHours = {
      tiktok: [18, 19, 20, 21],
      youtube: [14, 15, 16, 17],
      instagram: [11, 12, 13, 14, 17, 18],
      twitter: [9, 10, 11, 12, 13, 14, 15, 16]
    };
    
    return optimalHours[request.platform]?.includes(hour) || false;
  }

  private getContentTypeFromMix(contentMix: any, index: number): string {
    const types = Object.keys(contentMix);
    const weights = Object.values(contentMix) as number[];
    
    let cumulative = 0;
    const random = Math.random() * 100;
    
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return types[i];
      }
    }
    
    return types[0];
  }

  private async calculateOptimalTimes(request: AutoScheduleRequest): Promise<string[]> {
    // This would typically use historical data and AI analysis
    // For now, return platform-specific optimal times
    const optimalTimes = {
      tiktok: ['18:00', '19:00', '20:00', '21:00'],
      youtube: ['14:00', '15:00', '16:00', '17:00'],
      instagram: ['11:00', '12:00', '13:00', '17:00', '18:00'],
      twitter: ['09:00', '12:00', '15:00', '16:00']
    };
    
    return optimalTimes[request.platform] || ['12:00', '18:00'];
  }

  private async generateScheduleAnalytics(posts: ScheduledPost[], request: AutoScheduleRequest) {
    const totalPosts = posts.length;
    const avgViralPotential = posts.reduce((sum, post) => sum + post.viralPotential, 0) / totalPosts;
    const avgEngagement = posts.reduce((sum, post) => sum + post.engagementPrediction, 0) / totalPosts;
    
    // Calculate estimated reach based on tier and platform
    const reachMultiplier = {
      pro: 1.0,
      elite: 1.5,
      agency: 2.0
    };
    
    const baseReach = {
      tiktok: 10000,
      youtube: 5000,
      instagram: 8000,
      twitter: 3000
    };
    
    const estimatedReach = Math.round(baseReach[request.platform] * reachMultiplier[request.tier] * (avgViralPotential / 100));
    
    return {
      estimatedReach,
      engagementPrediction: Math.round(avgEngagement),
      viralPotential: Math.round(avgViralPotential),
      bestPerformingTimes: await this.calculateOptimalTimes(request),
      recommendedAdjustments: [
        'Consider posting more during peak hours',
        'Increase educational content mix',
        'Add more trending hashtags',
        'Optimize for mobile viewing'
      ]
    };
  }

  private calculateDuration(frequency: string): number {
    const durationMap = {
      daily: 30,
      weekly: 4,
      'bi-weekly': 2,
      monthly: 1
    };
    
    return durationMap[frequency as keyof typeof durationMap] || 30;
  }

  private calculateContentDistribution(posts: ScheduledPost[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    posts.forEach(post => {
      distribution[post.contentMix] = (distribution[post.contentMix] || 0) + 1;
    });
    
    // Convert to percentages
    const total = posts.length;
    Object.keys(distribution).forEach(key => {
      distribution[key] = Math.round((distribution[key] / total) * 100);
    });
    
    return distribution;
  }

  private async saveScheduleToDatabase(response: AutoScheduleResponse): Promise<void> {
    try {
      // Save posts to database
      const { error } = await this.supabase
        .from('scheduled_posts')
        .insert(response.posts.map(post => ({
          id: post.id,
          user_id: response.metadata.userId,
          title: post.title,
          caption: post.caption,
          hashtags: post.hashtags,
          platform: post.platform,
          scheduled_time: post.scheduledTime.toISOString(),
          content_type: post.contentType,
          viral_potential: post.viralPotential,
          engagement_prediction: post.engagementPrediction,
          optimal_time: post.optimalTime,
          content_mix: post.contentMix,
          status: post.status,
          metadata: post.metadata
        })));

      if (error) {
        console.error('Error saving schedule to database:', error);
      }
    } catch (error) {
      console.error('Error saving schedule to database:', error);
    }
  }

  // Get user's auto-schedule settings
  async getUserAutoScheduleSettings(userId: string): Promise<AutoScheduleRequest | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_auto_schedule_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching auto-schedule settings:', error);
        return null;
      }

      return data as AutoScheduleRequest;
    } catch (error) {
      console.error('Error fetching auto-schedule settings:', error);
      return null;
    }
  }

  // Update user's auto-schedule settings
  async updateUserAutoScheduleSettings(userId: string, settings: Partial<AutoScheduleRequest>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_auto_schedule_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error updating auto-schedule settings:', error);
        throw new Error('Failed to update auto-schedule settings');
      }
    } catch (error) {
      console.error('Error updating auto-schedule settings:', error);
      throw new Error('Failed to update auto-schedule settings');
    }
  }

  // Get scheduled posts for user
  async getUserScheduledPosts(userId: string, limit: number = 50): Promise<ScheduledPost[]> {
    try {
      const { data, error } = await this.supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_time', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching scheduled posts:', error);
        return [];
      }

      return (data || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        caption: post.caption,
        hashtags: post.hashtags,
        platform: post.platform,
        scheduledTime: new Date(post.scheduled_time),
        contentType: post.content_type,
        viralPotential: post.viral_potential,
        engagementPrediction: post.engagement_prediction,
        optimalTime: post.optimal_time,
        contentMix: post.content_mix,
        status: post.status,
        metadata: post.metadata
      }));
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      return [];
    }
  }
}
