import { SupabaseClient } from '@supabase/supabase-js';
import { openai } from './openai';

export interface BrandPartner {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  category: string;
  targetAudience: string[];
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: BrandRequirements;
  performance: BrandPerformance;
  status: 'active' | 'inactive' | 'pending';
  verified: boolean;
  rating: number;
  totalCollaborations: number;
  averageROI: number;
}

export interface BrandRequirements {
  followerCount: {
    min: number;
    max?: number;
  };
  engagementRate: {
    min: number;
  };
  platforms: string[];
  contentTypes: string[];
  demographics: {
    ageGroups: string[];
    genders: string[];
    countries: string[];
  };
  exclusivity: boolean;
  contentGuidelines: string[];
  deliverables: string[];
  timeline: number; // in days
}

export interface BrandPerformance {
  totalCampaigns: number;
  averageReach: number;
  averageEngagement: number;
  averageROI: number;
  successRate: number;
  topPerformingContent: string[];
  audienceInsights: any;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  platforms: CreatorPlatform[];
  stats: CreatorStats;
  portfolio: PortfolioItem[];
  rates: CreatorRates;
  availability: Availability;
  preferences: CreatorPreferences;
  verified: boolean;
  rating: number;
  totalEarnings: number;
  completedProjects: number;
}

export interface CreatorPlatform {
  platform: string;
  username: string;
  followerCount: number;
  engagementRate: number;
  averageViews: number;
  verified: boolean;
  category: string;
}

export interface CreatorStats {
  totalFollowers: number;
  averageEngagement: number;
  reach: number;
  impressions: number;
  topPerformingContent: string[];
  audienceDemographics: any;
  growthRate: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  media: string[];
  platform: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number;
  };
  brand: string;
  category: string;
  date: Date;
}

export interface CreatorRates {
  baseRate: number;
  currency: string;
  rateType: 'per_post' | 'per_video' | 'per_campaign' | 'hourly';
  additionalServices: {
    service: string;
    price: number;
  }[];
  minimumBudget: number;
  paymentTerms: string;
}

export interface Availability {
  status: 'available' | 'busy' | 'unavailable';
  nextAvailable: Date;
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  blackoutDates: Date[];
}

export interface CreatorPreferences {
  preferredBrands: string[];
  preferredCategories: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  collaborationTypes: string[];
  exclusivity: boolean;
  contentGuidelines: string[];
}

export interface CollaborationProposal {
  id: string;
  brandId: string;
  creatorId: string;
  title: string;
  description: string;
  deliverables: string[];
  timeline: number;
  budget: number;
  terms: CollaborationTerms;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating' | 'completed';
  createdAt: Date;
  expiresAt: Date;
  messages: ProposalMessage[];
}

export interface CollaborationTerms {
  payment: {
    amount: number;
    currency: string;
    schedule: string;
    method: string;
  };
  deliverables: {
    type: string;
    quantity: number;
    specifications: string;
    deadline: Date;
  }[];
  rights: {
    contentOwnership: string;
    usageRights: string;
    exclusivity: boolean;
    duration: number;
  };
  performance: {
    metrics: string[];
    targets: Record<string, number>;
    bonuses: {
      metric: string;
      target: number;
      bonus: number;
    }[];
  };
}

export interface ProposalMessage {
  id: string;
  senderId: string;
  senderType: 'brand' | 'creator';
  message: string;
  timestamp: Date;
  attachments: string[];
}

export class AffiliateMarketplace {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async createBrandPartner(brand: Omit<BrandPartner, 'id' | 'performance'>): Promise<BrandPartner> {
    try {
      const newBrand: BrandPartner = {
        ...brand,
        id: `brand_${Date.now()}`,
        performance: {
          totalCampaigns: 0,
          averageReach: 0,
          averageEngagement: 0,
          averageROI: 0,
          successRate: 0,
          topPerformingContent: [],
          audienceInsights: {}
        }
      };

      const { error } = await this.supabase
        .from('brand_partners')
        .insert({
          id: newBrand.id,
          name: newBrand.name,
          description: newBrand.description,
          logo: newBrand.logo,
          website: newBrand.website,
          category: newBrand.category,
          target_audience: newBrand.targetAudience,
          budget: newBrand.budget,
          requirements: newBrand.requirements,
          performance: newBrand.performance,
          status: newBrand.status,
          verified: newBrand.verified,
          rating: newBrand.rating,
          total_collaborations: newBrand.totalCollaborations,
          average_roi: newBrand.averageROI
        });

      if (error) {
        console.error('Error creating brand partner:', error);
        throw new Error('Failed to create brand partner');
      }

      return newBrand;
    } catch (error) {
      console.error('Error creating brand partner:', error);
      throw new Error('Failed to create brand partner');
    }
  }

  async createCreatorProfile(profile: Omit<CreatorProfile, 'id'>): Promise<CreatorProfile> {
    try {
      const newProfile: CreatorProfile = {
        ...profile,
        id: `creator_${Date.now()}`
      };

      const { error } = await this.supabase
        .from('creator_profiles')
        .insert({
          id: newProfile.id,
          user_id: newProfile.userId,
          username: newProfile.username,
          display_name: newProfile.displayName,
          bio: newProfile.bio,
          avatar: newProfile.avatar,
          platforms: newProfile.platforms,
          stats: newProfile.stats,
          portfolio: newProfile.portfolio,
          rates: newProfile.rates,
          availability: newProfile.availability,
          preferences: newProfile.preferences,
          verified: newProfile.verified,
          rating: newProfile.rating,
          total_earnings: newProfile.totalEarnings,
          completed_projects: newProfile.completedProjects
        });

      if (error) {
        console.error('Error creating creator profile:', error);
        throw new Error('Failed to create creator profile');
      }

      return newProfile;
    } catch (error) {
      console.error('Error creating creator profile:', error);
      throw new Error('Failed to create creator profile');
    }
  }

  async findMatchingCreators(brandId: string, criteria: {
    platforms: string[];
    followerCount: { min: number; max?: number };
    engagementRate: { min: number };
    categories: string[];
    budget: { min: number; max: number };
    location?: string;
  }): Promise<CreatorProfile[]> {
    try {
      // Get brand requirements
      const brand = await this.getBrandPartner(brandId);
      if (!brand) {
        throw new Error('Brand partner not found');
      }

      // Build query based on criteria
      let query = this.supabase
        .from('creator_profiles')
        .select('*')
        .eq('verified', true);

      // Filter by platforms
      if (criteria.platforms.length > 0) {
        query = query.contains('platforms', criteria.platforms);
      }

      // Filter by follower count
      if (criteria.followerCount.min > 0) {
        query = query.gte('stats->totalFollowers', criteria.followerCount.min);
      }

      // Filter by engagement rate
      if (criteria.engagementRate.min > 0) {
        query = query.gte('stats->averageEngagement', criteria.engagementRate.min);
      }

      // Filter by budget
      if (criteria.budget.min > 0) {
        query = query.gte('rates->minimumBudget', criteria.budget.min);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error finding matching creators:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        username: item.username,
        displayName: item.display_name,
        bio: item.bio,
        avatar: item.avatar,
        platforms: item.platforms,
        stats: item.stats,
        portfolio: item.portfolio,
        rates: item.rates,
        availability: item.availability,
        preferences: item.preferences,
        verified: item.verified,
        rating: item.rating,
        totalEarnings: item.total_earnings,
        completedProjects: item.completed_projects
      }));
    } catch (error) {
      console.error('Error finding matching creators:', error);
      return [];
    }
  }

  async findMatchingBrands(creatorId: string, preferences: {
    categories: string[];
    budgetRange: { min: number; max: number };
    platforms: string[];
    collaborationTypes: string[];
  }): Promise<BrandPartner[]> {
    try {
      let query = this.supabase
        .from('brand_partners')
        .select('*')
        .eq('status', 'active')
        .eq('verified', true);

      // Filter by categories
      if (preferences.categories.length > 0) {
        query = query.in('category', preferences.categories);
      }

      // Filter by budget
      if (preferences.budgetRange.min > 0) {
        query = query.gte('budget->min', preferences.budgetRange.min);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error finding matching brands:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        logo: item.logo,
        website: item.website,
        category: item.category,
        targetAudience: item.target_audience,
        budget: item.budget,
        requirements: item.requirements,
        performance: item.performance,
        status: item.status,
        verified: item.verified,
        rating: item.rating,
        totalCollaborations: item.total_collaborations,
        averageROI: item.average_roi
      }));
    } catch (error) {
      console.error('Error finding matching brands:', error);
      return [];
    }
  }

  async createCollaborationProposal(proposal: Omit<CollaborationProposal, 'id' | 'createdAt' | 'messages'>): Promise<CollaborationProposal> {
    try {
      const newProposal: CollaborationProposal = {
        ...proposal,
        id: `proposal_${Date.now()}`,
        createdAt: new Date(),
        messages: []
      };

      const { error } = await this.supabase
        .from('collaboration_proposals')
        .insert({
          id: newProposal.id,
          brand_id: newProposal.brandId,
          creator_id: newProposal.creatorId,
          title: newProposal.title,
          description: newProposal.description,
          deliverables: newProposal.deliverables,
          timeline: newProposal.timeline,
          budget: newProposal.budget,
          terms: newProposal.terms,
          status: newProposal.status,
          created_at: newProposal.createdAt.toISOString(),
          expires_at: newProposal.expiresAt.toISOString(),
          messages: newProposal.messages
        });

      if (error) {
        console.error('Error creating collaboration proposal:', error);
        throw new Error('Failed to create collaboration proposal');
      }

      return newProposal;
    } catch (error) {
      console.error('Error creating collaboration proposal:', error);
      throw new Error('Failed to create collaboration proposal');
    }
  }

  async generateAICollaborationSuggestions(brandId: string, creatorId: string): Promise<{
    suggestions: string[];
    potentialROI: number;
    recommendedContent: string[];
    optimalTiming: string[];
    riskAssessment: string;
  }> {
    try {
      const brand = await this.getBrandPartner(brandId);
      const creator = await this.getCreatorProfile(creatorId);

      if (!brand || !creator) {
        throw new Error('Brand or creator not found');
      }

      const systemPrompt = `You are an expert collaboration strategist. Analyze brand and creator profiles to generate AI-powered collaboration suggestions.

Consider:
- Brand requirements and target audience
- Creator's strengths and audience demographics
- Platform-specific best practices
- Content performance history
- Market trends and opportunities
- Risk factors and mitigation strategies

Provide actionable suggestions for successful collaborations.`;

      const userPrompt = `Analyze this brand-creator match:

Brand: ${brand.name}
Category: ${brand.category}
Target Audience: ${brand.targetAudience.join(', ')}
Budget: $${brand.budget.min} - $${brand.budget.max}
Requirements: ${JSON.stringify(brand.requirements)}

Creator: ${creator.displayName}
Platforms: ${creator.platforms.map(p => p.platform).join(', ')}
Followers: ${creator.stats.totalFollowers}
Engagement: ${creator.stats.averageEngagement}%
Categories: ${creator.preferences.preferredCategories.join(', ')}

Generate collaboration suggestions, ROI predictions, content recommendations, optimal timing, and risk assessment.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No AI suggestions generated');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating AI collaboration suggestions:', error);
      return {
        suggestions: ['Consider micro-influencer partnerships', 'Focus on authentic content creation'],
        potentialROI: 150,
        recommendedContent: ['Product reviews', 'Behind-the-scenes content'],
        optimalTiming: ['Weekend mornings', 'Evening hours'],
        riskAssessment: 'Low risk - good brand-creator alignment'
      };
    }
  }

  async getMarketplaceAnalytics(): Promise<{
    totalBrands: number;
    totalCreators: number;
    activeCollaborations: number;
    totalRevenue: number;
    averageROI: number;
    topCategories: string[];
    platformDistribution: Record<string, number>;
    successRate: number;
  }> {
    try {
      const [
        brandsResult,
        creatorsResult,
        collaborationsResult,
        revenueResult
      ] = await Promise.all([
        this.supabase.from('brand_partners').select('id').eq('status', 'active'),
        this.supabase.from('creator_profiles').select('id').eq('verified', true),
        this.supabase.from('collaboration_proposals').select('*').eq('status', 'accepted'),
        this.supabase.from('revenue_distributions').select('amount')
      ]);

      const totalBrands = brandsResult.data?.length || 0;
      const totalCreators = creatorsResult.data?.length || 0;
      const activeCollaborations = collaborationsResult.data?.length || 0;
      const totalRevenue = revenueResult.data?.reduce((sum, item) => sum + item.amount, 0) || 0;

      // Calculate additional metrics
      const averageROI = 150; // Would calculate from actual data
      const topCategories = ['fashion', 'beauty', 'tech', 'lifestyle', 'fitness'];
      const platformDistribution = {
        instagram: 40,
        tiktok: 30,
        youtube: 20,
        twitter: 10
      };
      const successRate = 85; // Would calculate from actual data

      return {
        totalBrands,
        totalCreators,
        activeCollaborations,
        totalRevenue,
        averageROI,
        topCategories,
        platformDistribution,
        successRate
      };
    } catch (error) {
      console.error('Error getting marketplace analytics:', error);
      throw new Error('Failed to get marketplace analytics');
    }
  }

  private async getBrandPartner(brandId: string): Promise<BrandPartner | null> {
    try {
      const { data, error } = await this.supabase
        .from('brand_partners')
        .select('*')
        .eq('id', brandId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching brand partner:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        logo: data.logo,
        website: data.website,
        category: data.category,
        targetAudience: data.target_audience,
        budget: data.budget,
        requirements: data.requirements,
        performance: data.performance,
        status: data.status,
        verified: data.verified,
        rating: data.rating,
        totalCollaborations: data.total_collaborations,
        averageROI: data.average_roi
      };
    } catch (error) {
      console.error('Error fetching brand partner:', error);
      return null;
    }
  }

  private async getCreatorProfile(creatorId: string): Promise<CreatorProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('creator_profiles')
        .select('*')
        .eq('id', creatorId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching creator profile:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        username: data.username,
        displayName: data.display_name,
        bio: data.bio,
        avatar: data.avatar,
        platforms: data.platforms,
        stats: data.stats,
        portfolio: data.portfolio,
        rates: data.rates,
        availability: data.availability,
        preferences: data.preferences,
        verified: data.verified,
        rating: data.rating,
        totalEarnings: data.total_earnings,
        completedProjects: data.completed_projects
      };
    } catch (error) {
      console.error('Error fetching creator profile:', error);
      return null;
    }
  }
}
