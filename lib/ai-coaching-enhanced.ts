import { openai } from './openai';
import { supabase } from './supabase';

export interface CoachingContext {
  userId: string;
  userLevel: number;
  userStats: {
    contentCreated: number;
    contentOptimized: number;
    viralContent: number;
    totalEngagement: number;
    averageViralityScore: number;
    topPlatforms: string[];
    contentCategories: string[];
  };
  recentContent: Array<{
    title: string;
    platform: string;
    viralityScore: number;
    engagement: number;
    date: Date;
  }>;
  goals: string[];
  painPoints: string[];
  preferences: {
    tone: 'professional' | 'casual' | 'motivational' | 'analytical';
    detailLevel: 'brief' | 'detailed' | 'comprehensive';
    focusAreas: string[];
  };
}

export interface CoachingMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    actionType?: 'advice' | 'analysis' | 'suggestion' | 'encouragement' | 'warning';
    confidence?: number;
    relatedContent?: string[];
    followUpQuestions?: string[];
  };
}

export interface CoachingSession {
  id: string;
  userId: string;
  messages: CoachingMessage[];
  context: CoachingContext;
  sessionType: 'general' | 'content_review' | 'strategy_planning' | 'performance_analysis' | 'troubleshooting';
  startedAt: Date;
  lastActivity: Date;
  status: 'active' | 'paused' | 'completed';
}

export interface CoachingInsight {
  id: string;
  type: 'performance' | 'trend' | 'opportunity' | 'warning' | 'achievement';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedMetrics: string[];
  suggestions: string[];
  createdAt: Date;
}

export interface CoachingPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  goals: string[];
  timeline: {
    start: Date;
    end: Date;
    milestones: Array<{
      title: string;
      description: string;
      targetDate: Date;
      completed: boolean;
      metrics: string[];
    }>;
  };
  strategies: Array<{
    category: string;
    title: string;
    description: string;
    priority: number;
    estimatedImpact: 'low' | 'medium' | 'high';
    resources: string[];
  }>;
  progress: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// Main AI Coaching Manager
export class AICoachingManager {
  private userId: string;
  private context: CoachingContext | null = null;
  private currentSession: CoachingSession | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Initialize coaching context
  async initializeContext(): Promise<CoachingContext> {
    try {
      // Get user stats from XP system
      const { data: xpData } = await supabase
        .from('user_xp')
        .select('stats, current_level')
        .eq('user_id', this.userId)
        .single();

      // Get recent content
      const { data: contentData } = await supabase
        .from('content_plans')
        .select('title, platform, virality_score, engagement, created_at')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get user preferences
      const { data: userData } = await supabase
        .from('users')
        .select('goals, pain_points, preferences')
        .eq('id', this.userId)
        .single();

      this.context = {
        userId: this.userId,
        userLevel: xpData?.current_level || 1,
        userStats: {
          contentCreated: xpData?.stats?.contentCreated || 0,
          contentOptimized: xpData?.stats?.contentOptimized || 0,
          viralContent: xpData?.stats?.viralContent || 0,
          totalEngagement: xpData?.stats?.totalEngagement || 0,
          averageViralityScore: this.calculateAverageViralityScore(contentData || []),
          topPlatforms: this.getTopPlatforms(contentData || []),
          contentCategories: this.getContentCategories(contentData || [])
        },
        recentContent: (contentData || []).map(content => ({
          title: content.title,
          platform: content.platform,
          viralityScore: content.virality_score || 0,
          engagement: content.engagement || 0,
          date: new Date(content.created_at)
        })),
        goals: userData?.goals || [],
        painPoints: userData?.pain_points || [],
        preferences: userData?.preferences || {
          tone: 'casual',
          detailLevel: 'detailed',
          focusAreas: ['engagement', 'growth']
        }
      };

      return this.context;
    } catch (error) {
      console.error('Error initializing coaching context:', error);
      throw new Error('Failed to initialize coaching context');
    }
  }

  // Start a new coaching session
  async startSession(sessionType: CoachingSession['sessionType']): Promise<CoachingSession> {
    if (!this.context) {
      await this.initializeContext();
    }

    const session: CoachingSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.userId,
      messages: [],
      context: this.context!,
      sessionType,
      startedAt: new Date(),
      lastActivity: new Date(),
      status: 'active'
    };

    // Add welcome message
    const welcomeMessage = await this.generateWelcomeMessage(sessionType);
    session.messages.push(welcomeMessage);

    this.currentSession = session;
    await this.saveSession(session);

    return session;
  }

  // Send a message and get AI response
  async sendMessage(content: string): Promise<CoachingMessage> {
    if (!this.currentSession) {
      throw new Error('No active coaching session');
    }

    // Add user message
    const userMessage: CoachingMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content,
      timestamp: new Date()
    };

    this.currentSession.messages.push(userMessage);
    this.currentSession.lastActivity = new Date();

    // Generate AI response
    const aiResponse = await this.generateAIResponse(content, this.currentSession);
    this.currentSession.messages.push(aiResponse);

    // Save session
    await this.saveSession(this.currentSession);

    return aiResponse;
  }

  // Generate AI response
  private async generateAIResponse(userMessage: string, session: CoachingSession): Promise<CoachingMessage> {
    const systemPrompt = this.buildSystemPrompt(session);
    const conversationHistory = this.buildConversationHistory(session.messages);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response generated');
    }

    // Analyze response for metadata
    const metadata = await this.analyzeResponse(content, userMessage, session);

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'assistant',
      content,
      timestamp: new Date(),
      metadata
    };
  }

  // Build system prompt based on context and session type
  private buildSystemPrompt(session: CoachingSession): string {
    const { context } = session;
    const { userStats, preferences, goals, painPoints } = context;

    return `You are an expert AI content creation coach specializing in social media growth and viral content strategies.

USER CONTEXT:
- Level: ${context.userLevel} (${this.getLevelName(context.userLevel)})
- Content Created: ${userStats.contentCreated}
- Viral Content: ${userStats.viralContent}
- Average Virality Score: ${userStats.averageViralityScore}%
- Top Platforms: ${userStats.topPlatforms.join(', ')}
- Goals: ${goals.join(', ')}
- Pain Points: ${painPoints.join(', ')}
- Preferred Tone: ${preferences.tone}
- Detail Level: ${preferences.detailLevel}

COACHING STYLE:
- Be ${preferences.tone} and ${preferences.detailLevel}
- Focus on: ${preferences.focusAreas.join(', ')}
- Provide actionable, specific advice
- Use data-driven insights when possible
- Be encouraging but honest about challenges
- Ask follow-up questions to understand needs better

SESSION TYPE: ${session.sessionType.toUpperCase()}

SPECIALIZED KNOWLEDGE:
- Platform algorithms (TikTok, Instagram, YouTube, Twitter)
- Viral content patterns and trends
- Engagement optimization strategies
- Content planning and scheduling
- Audience growth techniques
- Monetization strategies
- Brand collaboration opportunities

RESPONSE FORMAT:
- Start with a brief acknowledgment
- Provide specific, actionable advice
- Include relevant examples or case studies
- End with 1-2 follow-up questions
- Use emojis sparingly but effectively
- Keep responses concise but comprehensive

Remember: You're not just giving generic advice - you're providing personalized coaching based on this user's specific situation, goals, and performance data.`;
  }

  // Build conversation history for context
  private buildConversationHistory(messages: CoachingMessage[]): Array<{ role: 'user' | 'assistant'; content: string }> {
    return messages
      .filter(msg => msg.type !== 'system')
      .slice(-10) // Last 10 messages for context
      .map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));
  }

  // Analyze AI response for metadata
  private async analyzeResponse(content: string, userMessage: string, session: CoachingSession): Promise<CoachingMessage['metadata']> {
    const actionType = this.classifyActionType(content, userMessage);
    const confidence = this.calculateConfidence(content, session);
    const relatedContent = this.extractRelatedContent(content);
    const followUpQuestions = this.generateFollowUpQuestions(content, session);

    return {
      actionType,
      confidence,
      relatedContent,
      followUpQuestions
    };
  }

  // Classify the type of action in the response
  private classifyActionType(content: string, userMessage: string): CoachingMessage['metadata']['actionType'] {
    const lowerContent = content.toLowerCase();
    const lowerUserMessage = userMessage.toLowerCase();

    if (lowerContent.includes('analyze') || lowerContent.includes('data shows') || lowerContent.includes('metrics')) {
      return 'analysis';
    } else if (lowerContent.includes('suggest') || lowerContent.includes('try') || lowerContent.includes('consider')) {
      return 'suggestion';
    } else if (lowerContent.includes('warning') || lowerContent.includes('avoid') || lowerContent.includes('risk')) {
      return 'warning';
    } else if (lowerContent.includes('great job') || lowerContent.includes('excellent') || lowerContent.includes('congratulations')) {
      return 'encouragement';
    } else {
      return 'advice';
    }
  }

  // Calculate confidence score
  private calculateConfidence(content: string, session: CoachingSession): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence for data-driven responses
    if (content.includes('%') || content.includes('data') || content.includes('metrics')) {
      confidence += 0.1;
    }

    // Increase confidence for specific platform advice
    if (content.includes('tiktok') || content.includes('instagram') || content.includes('youtube')) {
      confidence += 0.1;
    }

    // Decrease confidence for uncertain language
    if (content.includes('might') || content.includes('could') || content.includes('possibly')) {
      confidence -= 0.1;
    }

    return Math.min(1, Math.max(0, confidence));
  }

  // Extract related content topics
  private extractRelatedContent(content: string): string[] {
    const topics = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('hashtag')) topics.push('hashtags');
    if (lowerContent.includes('trend')) topics.push('trends');
    if (lowerContent.includes('engagement')) topics.push('engagement');
    if (lowerContent.includes('viral')) topics.push('virality');
    if (lowerContent.includes('audience')) topics.push('audience growth');
    if (lowerContent.includes('schedule')) topics.push('scheduling');
    if (lowerContent.includes('collaboration')) topics.push('collaborations');

    return topics;
  }

  // Generate follow-up questions
  private generateFollowUpQuestions(content: string, session: CoachingSession): string[] {
    const questions = [];
    const { sessionType, context } = session;

    switch (sessionType) {
      case 'content_review':
        questions.push('Would you like me to analyze your best-performing content to identify patterns?');
        questions.push('Should we create a content strategy based on your top-performing posts?');
        break;
      case 'strategy_planning':
        questions.push('What specific goals would you like to focus on first?');
        questions.push('Would you like me to create a detailed action plan for your strategy?');
        break;
      case 'performance_analysis':
        questions.push('Would you like me to compare your performance across different platforms?');
        questions.push('Should we identify opportunities for improvement in your content?');
        break;
      default:
        questions.push('Is there a specific area you\'d like to dive deeper into?');
        questions.push('Would you like me to create a personalized action plan for you?');
    }

    return questions.slice(0, 2);
  }

  // Generate welcome message based on session type
  private async generateWelcomeMessage(sessionType: CoachingSession['sessionType']): Promise<CoachingMessage> {
    const welcomeMessages = {
      general: `👋 Hey there! I'm your AI content coach. I've analyzed your content performance and I'm here to help you grow your audience and create more engaging content. What would you like to work on today?`,
      
      content_review: `📊 Let's dive into your content performance! I can see you've created ${this.context?.userStats.contentCreated || 0} pieces of content with an average virality score of ${this.context?.userStats.averageViralityScore || 0}%. What specific content would you like me to analyze?`,
      
      strategy_planning: `🎯 Ready to level up your content strategy? Based on your goals and current performance, I can help you create a roadmap for growth. What's your biggest challenge right now?`,
      
      performance_analysis: `📈 Time for a deep dive into your analytics! I'll help you understand what's working, what isn't, and how to optimize for better results. Which metrics are you most curious about?`,
      
      troubleshooting: `🔧 Let's solve some problems! I'm here to help you overcome any content creation challenges you're facing. What's been frustrating you lately?`
    };

    return {
      id: `msg_welcome_${Date.now()}`,
      type: 'assistant',
      content: welcomeMessages[sessionType],
      timestamp: new Date(),
      metadata: {
        actionType: 'encouragement',
        confidence: 0.9
      }
    };
  }

  // Generate coaching insights
  async generateInsights(): Promise<CoachingInsight[]> {
    if (!this.context) {
      await this.initializeContext();
    }

    const insights: CoachingInsight[] = [];

    // Performance insights
    if (this.context!.userStats.averageViralityScore < 60) {
      insights.push({
        id: 'low_virality',
        type: 'warning',
        title: 'Low Virality Scores',
        description: `Your average virality score is ${this.context!.userStats.averageViralityScore}%, which is below the optimal range.`,
        confidence: 0.8,
        actionable: true,
        priority: 'high',
        relatedMetrics: ['virality_score'],
        suggestions: [
          'Focus on trending topics and hashtags',
          'Improve your content hooks and captions',
          'Experiment with different content formats'
        ],
        createdAt: new Date()
      });
    }

    // Growth opportunities
    if (this.context!.userStats.viralContent > 0) {
      insights.push({
        id: 'viral_potential',
        type: 'opportunity',
        title: 'Viral Content Potential',
        description: `You've created ${this.context!.userStats.viralContent} viral pieces! Let's replicate that success.`,
        confidence: 0.9,
        actionable: true,
        priority: 'medium',
        relatedMetrics: ['viral_content'],
        suggestions: [
          'Analyze your viral content patterns',
          'Create similar content with trending elements',
          'Scale your successful content strategies'
        ],
        createdAt: new Date()
      });
    }

    // Platform optimization
    const topPlatform = this.context!.userStats.topPlatforms[0];
    if (topPlatform) {
      insights.push({
        id: 'platform_optimization',
        type: 'performance',
        title: `${topPlatform} Optimization`,
        description: `${topPlatform} is your top-performing platform. Let's maximize your success there.`,
        confidence: 0.7,
        actionable: true,
        priority: 'medium',
        relatedMetrics: ['platform_performance'],
        suggestions: [
          `Focus more content on ${topPlatform}`,
          'Study platform-specific best practices',
          'Engage with trending content on this platform'
        ],
        createdAt: new Date()
      });
    }

    return insights;
  }

  // Create a coaching plan
  async createCoachingPlan(title: string, goals: string[], duration: number = 30): Promise<CoachingPlan> {
    const plan: CoachingPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.userId,
      title,
      description: `Personalized coaching plan to achieve: ${goals.join(', ')}`,
      goals,
      timeline: {
        start: new Date(),
        end: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        milestones: this.generateMilestones(goals, duration)
      },
      strategies: this.generateStrategies(goals),
      progress: 0,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save plan to database
    await this.saveCoachingPlan(plan);

    return plan;
  }

  // Generate milestones for coaching plan
  private generateMilestones(goals: string[], duration: number): CoachingPlan['timeline']['milestones'] {
    const milestones = [];
    const milestoneCount = Math.min(goals.length, 4);
    const interval = duration / milestoneCount;

    for (let i = 0; i < milestoneCount; i++) {
      milestones.push({
        title: `Milestone ${i + 1}: ${goals[i]}`,
        description: `Work towards achieving: ${goals[i]}`,
        targetDate: new Date(Date.now() + (i + 1) * interval * 24 * 60 * 60 * 1000),
        completed: false,
        metrics: this.getMetricsForGoal(goals[i])
      });
    }

    return milestones;
  }

  // Generate strategies for goals
  private generateStrategies(goals: string[]): CoachingPlan['strategies'] {
    const strategies = [];

    for (const goal of goals) {
      if (goal.toLowerCase().includes('engagement')) {
        strategies.push({
          category: 'Engagement',
          title: 'Optimize Content for Higher Engagement',
          description: 'Focus on creating content that encourages likes, comments, and shares',
          priority: 1,
          estimatedImpact: 'high',
          resources: ['Engagement optimization guide', 'Trending hashtag research', 'Caption writing templates']
        });
      }

      if (goal.toLowerCase().includes('growth')) {
        strategies.push({
          category: 'Growth',
          title: 'Expand Audience Reach',
          description: 'Implement strategies to reach new audiences and grow your following',
          priority: 2,
          estimatedImpact: 'high',
          resources: ['Audience research tools', 'Cross-platform promotion', 'Collaboration opportunities']
        });
      }

      if (goal.toLowerCase().includes('viral')) {
        strategies.push({
          category: 'Virality',
          title: 'Create More Viral Content',
          description: 'Develop content that has higher potential to go viral',
          priority: 3,
          estimatedImpact: 'medium',
          resources: ['Viral content analysis', 'Trend prediction tools', 'Hook optimization techniques']
        });
      }
    }

    return strategies;
  }

  // Helper methods
  private calculateAverageViralityScore(content: any[]): number {
    if (content.length === 0) return 0;
    const total = content.reduce((sum, item) => sum + (item.virality_score || 0), 0);
    return Math.round(total / content.length);
  }

  private getTopPlatforms(content: any[]): string[] {
    const platformCounts: Record<string, number> = {};
    content.forEach(item => {
      platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1;
    });
    return Object.entries(platformCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([platform]) => platform);
  }

  private getContentCategories(content: any[]): string[] {
    // This would be more sophisticated in a real implementation
    return ['lifestyle', 'tech', 'fitness']; // Mock data
  }

  private getLevelName(level: number): string {
    const levelNames = ['Newcomer', 'Creator', 'Rising Star', 'Influencer', 'Viral Creator', 'Content Master', 'Trend Setter', 'Industry Leader', 'Content Legend', 'Creator God'];
    return levelNames[Math.min(level - 1, levelNames.length - 1)] || 'Unknown';
  }

  private getMetricsForGoal(goal: string): string[] {
    if (goal.toLowerCase().includes('engagement')) {
      return ['likes', 'comments', 'shares', 'engagement_rate'];
    } else if (goal.toLowerCase().includes('growth')) {
      return ['followers', 'reach', 'impressions', 'profile_views'];
    } else if (goal.toLowerCase().includes('viral')) {
      return ['virality_score', 'views', 'shares', 'trending_status'];
    }
    return ['engagement', 'reach', 'growth'];
  }

  // Save session to database
  private async saveSession(session: CoachingSession): Promise<void> {
    const { error } = await supabase
      .from('coaching_sessions')
      .upsert([{
        id: session.id,
        user_id: session.userId,
        messages: session.messages,
        context: session.context,
        session_type: session.sessionType,
        started_at: session.startedAt.toISOString(),
        last_activity: session.lastActivity.toISOString(),
        status: session.status
      }]);

    if (error) throw error;
  }

  // Save coaching plan to database
  private async saveCoachingPlan(plan: CoachingPlan): Promise<void> {
    const { error } = await supabase
      .from('coaching_plans')
      .insert([{
        id: plan.id,
        user_id: plan.userId,
        title: plan.title,
        description: plan.description,
        goals: plan.goals,
        timeline: plan.timeline,
        strategies: plan.strategies,
        progress: plan.progress,
        status: plan.status,
        created_at: plan.createdAt.toISOString(),
        updated_at: plan.updatedAt.toISOString()
      }]);

    if (error) throw error;
  }
}
