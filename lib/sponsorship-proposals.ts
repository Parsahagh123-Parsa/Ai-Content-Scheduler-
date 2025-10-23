import { SupabaseClient } from '@supabase/supabase-js';
import { openai } from './openai';

export interface SponsorshipProposal {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  brandId: string;
  campaign: CampaignDetails;
  deliverables: Deliverable[];
  timeline: Timeline;
  budget: Budget;
  metrics: PerformanceMetrics;
  terms: ProposalTerms;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'negotiating';
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  aiGenerated: boolean;
  confidence: number;
}

export interface CampaignDetails {
  objective: string;
  targetAudience: string[];
  platforms: string[];
  contentTypes: string[];
  messaging: string;
  brandGuidelines: string[];
  exclusivity: boolean;
  duration: number; // in days
  launchDate: Date;
  endDate: Date;
}

export interface Deliverable {
  id: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'live' | 'blog';
  platform: string;
  description: string;
  quantity: number;
  specifications: string[];
  deadline: Date;
  price: number;
  requirements: string[];
}

export interface Timeline {
  proposal: Date;
  review: Date;
  approval: Date;
  contentCreation: Date;
  review: Date;
  publish: Date;
  reporting: Date;
}

export interface Budget {
  total: number;
  currency: string;
  breakdown: {
    content: number;
    performance: number;
    exclusivity: number;
    rush: number;
  };
  paymentSchedule: PaymentSchedule[];
  bonuses: PerformanceBonus[];
}

export interface PaymentSchedule {
  milestone: string;
  amount: number;
  percentage: number;
  dueDate: Date;
  conditions: string[];
}

export interface PerformanceBonus {
  metric: string;
  target: number;
  bonus: number;
  description: string;
}

export interface PerformanceMetrics {
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  cpm: number;
  cpc: number;
  cpa: number;
  roi: number;
}

export interface ProposalTerms {
  contentOwnership: string;
  usageRights: string;
  exclusivity: boolean;
  termination: string;
  forceMajeure: string;
  confidentiality: string;
  liability: string;
  disputeResolution: string;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables: string[];
  isDefault: boolean;
  createdBy: string;
}

export class SponsorshipProposals {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async generateAIProposal(creatorId: string, brandId: string, requirements: {
    campaignObjective: string;
    targetAudience: string[];
    platforms: string[];
    budget: number;
    timeline: number;
    contentTypes: string[];
    exclusivity: boolean;
  }): Promise<SponsorshipProposal> {
    try {
      // Get creator and brand data
      const [creator, brand] = await Promise.all([
        this.getCreatorProfile(creatorId),
        this.getBrandProfile(brandId)
      ]);

      if (!creator || !brand) {
        throw new Error('Creator or brand not found');
      }

      // Generate AI proposal content
      const aiContent = await this.generateAIProposalContent(creator, brand, requirements);
      
      // Create proposal
      const proposal: SponsorshipProposal = {
        id: `proposal_${Date.now()}`,
        title: aiContent.title,
        description: aiContent.description,
        creatorId,
        brandId,
        campaign: aiContent.campaign,
        deliverables: aiContent.deliverables,
        timeline: aiContent.timeline,
        budget: aiContent.budget,
        metrics: aiContent.metrics,
        terms: aiContent.terms,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        aiGenerated: true,
        confidence: aiContent.confidence
      };

      // Save to database
      await this.saveProposal(proposal);

      return proposal;
    } catch (error) {
      console.error('Error generating AI proposal:', error);
      throw new Error('Failed to generate AI proposal');
    }
  }

  private async generateAIProposalContent(creator: any, brand: any, requirements: any): Promise<{
    title: string;
    description: string;
    campaign: CampaignDetails;
    deliverables: Deliverable[];
    timeline: Timeline;
    budget: Budget;
    metrics: PerformanceMetrics;
    terms: ProposalTerms;
    confidence: number;
  }> {
    const systemPrompt = `You are an expert sponsorship proposal generator for creator-brand collaborations. Generate compelling, professional proposals that maximize value for both parties.

Consider:
- Creator's strengths and audience demographics
- Brand's objectives and target market
- Platform-specific best practices
- Industry standards and benchmarks
- Performance metrics and ROI
- Legal and commercial terms

Generate detailed proposals with realistic deliverables, timelines, budgets, and performance expectations.`;

    const userPrompt = `Generate a sponsorship proposal for this collaboration:

Creator: ${creator.displayName}
Followers: ${creator.stats.totalFollowers}
Engagement: ${creator.stats.averageEngagement}%
Platforms: ${creator.platforms.map((p: any) => p.platform).join(', ')}
Categories: ${creator.preferences.preferredCategories.join(', ')}

Brand: ${brand.name}
Category: ${brand.category}
Target Audience: ${brand.targetAudience.join(', ')}
Budget: $${brand.budget.min} - $${brand.budget.max}

Campaign Requirements:
- Objective: ${requirements.campaignObjective}
- Target Audience: ${requirements.targetAudience.join(', ')}
- Platforms: ${requirements.platforms.join(', ')}
- Budget: $${requirements.budget}
- Timeline: ${requirements.timeline} days
- Content Types: ${requirements.contentTypes.join(', ')}
- Exclusivity: ${requirements.exclusivity}

Generate a comprehensive proposal with deliverables, timeline, budget breakdown, performance metrics, and terms.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No AI content generated');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating AI proposal content:', error);
      return this.generateFallbackProposal(creator, brand, requirements);
    }
  }

  private generateFallbackProposal(creator: any, brand: any, requirements: any): any {
    const totalBudget = requirements.budget;
    const contentCount = requirements.contentTypes.length * 2; // 2 posts per content type
    
    return {
      title: `${brand.name} x ${creator.displayName} Collaboration`,
      description: `Strategic partnership between ${brand.name} and ${creator.displayName} to reach ${requirements.targetAudience.join(', ')} audience.`,
      campaign: {
        objective: requirements.campaignObjective,
        targetAudience: requirements.targetAudience,
        platforms: requirements.platforms,
        contentTypes: requirements.contentTypes,
        messaging: 'Authentic brand integration',
        brandGuidelines: ['Maintain brand voice', 'Include brand hashtags'],
        exclusivity: requirements.exclusivity,
        duration: requirements.timeline,
        launchDate: new Date(),
        endDate: new Date(Date.now() + requirements.timeline * 24 * 60 * 60 * 1000)
      },
      deliverables: requirements.contentTypes.map((type: string, index: number) => ({
        id: `deliverable_${index}`,
        type: 'post',
        platform: requirements.platforms[index % requirements.platforms.length],
        description: `${type} content for ${brand.name}`,
        quantity: 2,
        specifications: ['High-quality content', 'Brand integration'],
        deadline: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000),
        price: totalBudget / contentCount,
        requirements: ['Brand mention', 'Hashtag inclusion']
      })),
      timeline: {
        proposal: new Date(),
        review: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        approval: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        contentCreation: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        review: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        publish: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        reporting: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
      },
      budget: {
        total: totalBudget,
        currency: 'USD',
        breakdown: {
          content: totalBudget * 0.7,
          performance: totalBudget * 0.2,
          exclusivity: totalBudget * 0.1,
          rush: 0
        },
        paymentSchedule: [
          {
            milestone: 'Contract Signed',
            amount: totalBudget * 0.3,
            percentage: 30,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            conditions: ['Contract execution']
          },
          {
            milestone: 'Content Delivery',
            amount: totalBudget * 0.5,
            percentage: 50,
            dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            conditions: ['Content approval']
          },
          {
            milestone: 'Campaign Completion',
            amount: totalBudget * 0.2,
            percentage: 20,
            dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
            conditions: ['Final reporting']
          }
        ],
        bonuses: [
          {
            metric: 'Engagement Rate',
            target: 5,
            bonus: totalBudget * 0.1,
            description: 'Bonus for exceeding 5% engagement rate'
          }
        ]
      },
      metrics: {
        reach: creator.stats.totalFollowers * 0.8,
        impressions: creator.stats.totalFollowers * 1.2,
        engagement: creator.stats.averageEngagement,
        clicks: creator.stats.totalFollowers * 0.05,
        conversions: creator.stats.totalFollowers * 0.01,
        cpm: totalBudget / (creator.stats.totalFollowers * 0.8 / 1000),
        cpc: totalBudget / (creator.stats.totalFollowers * 0.05),
        cpa: totalBudget / (creator.stats.totalFollowers * 0.01),
        roi: 150
      },
      terms: {
        contentOwnership: 'Creator retains ownership, grants usage rights',
        usageRights: 'Brand can use content for marketing purposes',
        exclusivity: requirements.exclusivity,
        termination: 'Either party can terminate with 30 days notice',
        forceMajeure: 'Force majeure events excuse performance',
        confidentiality: 'Both parties maintain confidentiality',
        liability: 'Limited liability for both parties',
        disputeResolution: 'Arbitration in case of disputes'
      },
      confidence: 75
    };
  }

  async submitProposal(proposalId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('sponsorship_proposals')
        .update({ 
          status: 'submitted',
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);

      if (error) {
        console.error('Error submitting proposal:', error);
        throw new Error('Failed to submit proposal');
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      throw new Error('Failed to submit proposal');
    }
  }

  async updateProposalStatus(proposalId: string, status: string, notes?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.notes = notes;
      }

      const { error } = await this.supabase
        .from('sponsorship_proposals')
        .update(updateData)
        .eq('id', proposalId);

      if (error) {
        console.error('Error updating proposal status:', error);
        throw new Error('Failed to update proposal status');
      }
    } catch (error) {
      console.error('Error updating proposal status:', error);
      throw new Error('Failed to update proposal status');
    }
  }

  async getProposal(proposalId: string): Promise<SponsorshipProposal | null> {
    try {
      const { data, error } = await this.supabase
        .from('sponsorship_proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching proposal:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        creatorId: data.creator_id,
        brandId: data.brand_id,
        campaign: data.campaign,
        deliverables: data.deliverables,
        timeline: data.timeline,
        budget: data.budget,
        metrics: data.metrics,
        terms: data.terms,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        expiresAt: new Date(data.expires_at),
        aiGenerated: data.ai_generated,
        confidence: data.confidence
      };
    } catch (error) {
      console.error('Error fetching proposal:', error);
      return null;
    }
  }

  async getUserProposals(userId: string, userType: 'creator' | 'brand'): Promise<SponsorshipProposal[]> {
    try {
      const field = userType === 'creator' ? 'creator_id' : 'brand_id';
      
      const { data, error } = await this.supabase
        .from('sponsorship_proposals')
        .select('*')
        .eq(field, userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user proposals:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        creatorId: item.creator_id,
        brandId: item.brand_id,
        campaign: item.campaign,
        deliverables: item.deliverables,
        timeline: item.timeline,
        budget: item.budget,
        metrics: item.metrics,
        terms: item.terms,
        status: item.status,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        expiresAt: new Date(item.expires_at),
        aiGenerated: item.ai_generated,
        confidence: item.confidence
      }));
    } catch (error) {
      console.error('Error fetching user proposals:', error);
      return [];
    }
  }

  async createProposalTemplate(template: Omit<ProposalTemplate, 'id' | 'createdBy'>): Promise<string> {
    try {
      const templateId = `template_${Date.now()}`;
      
      const { error } = await this.supabase
        .from('proposal_templates')
        .insert({
          id: templateId,
          name: template.name,
          description: template.description,
          category: template.category,
          template: template.template,
          variables: template.variables,
          is_default: template.isDefault,
          created_by: 'system'
        });

      if (error) {
        console.error('Error creating proposal template:', error);
        throw new Error('Failed to create proposal template');
      }

      return templateId;
    } catch (error) {
      console.error('Error creating proposal template:', error);
      throw new Error('Failed to create proposal template');
    }
  }

  async getProposalTemplates(category?: string): Promise<ProposalTemplate[]> {
    try {
      let query = this.supabase
        .from('proposal_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching proposal templates:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        template: item.template,
        variables: item.variables,
        isDefault: item.is_default,
        createdBy: item.created_by
      }));
    } catch (error) {
      console.error('Error fetching proposal templates:', error);
      return [];
    }
  }

  async getProposalAnalytics(proposalId: string): Promise<{
    views: number;
    responseTime: number;
    acceptanceRate: number;
    negotiationRounds: number;
    finalValue: number;
    performanceScore: number;
  }> {
    try {
      const proposal = await this.getProposal(proposalId);
      if (!proposal) {
        throw new Error('Proposal not found');
      }

      // Mock analytics - in real implementation, this would come from actual data
      return {
        views: Math.floor(Math.random() * 50) + 10,
        responseTime: Math.floor(Math.random() * 48) + 24, // hours
        acceptanceRate: Math.floor(Math.random() * 30) + 70, // percentage
        negotiationRounds: Math.floor(Math.random() * 5) + 1,
        finalValue: proposal.budget.total * (0.8 + Math.random() * 0.4), // 80-120% of original
        performanceScore: Math.floor(Math.random() * 40) + 60 // 60-100
      };
    } catch (error) {
      console.error('Error getting proposal analytics:', error);
      throw new Error('Failed to get proposal analytics');
    }
  }

  private async saveProposal(proposal: SponsorshipProposal): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('sponsorship_proposals')
        .insert({
          id: proposal.id,
          title: proposal.title,
          description: proposal.description,
          creator_id: proposal.creatorId,
          brand_id: proposal.brandId,
          campaign: proposal.campaign,
          deliverables: proposal.deliverables,
          timeline: proposal.timeline,
          budget: proposal.budget,
          metrics: proposal.metrics,
          terms: proposal.terms,
          status: proposal.status,
          created_at: proposal.createdAt.toISOString(),
          updated_at: proposal.updatedAt.toISOString(),
          expires_at: proposal.expiresAt.toISOString(),
          ai_generated: proposal.aiGenerated,
          confidence: proposal.confidence
        });

      if (error) {
        console.error('Error saving proposal:', error);
        throw new Error('Failed to save proposal');
      }
    } catch (error) {
      console.error('Error saving proposal:', error);
      throw new Error('Failed to save proposal');
    }
  }

  private async getCreatorProfile(creatorId: string): Promise<any> {
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

      return data;
    } catch (error) {
      console.error('Error fetching creator profile:', error);
      return null;
    }
  }

  private async getBrandProfile(brandId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('brand_partners')
        .select('*')
        .eq('id', brandId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching brand profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching brand profile:', error);
      return null;
    }
  }
}
