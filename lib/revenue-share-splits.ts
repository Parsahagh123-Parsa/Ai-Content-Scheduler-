import { SupabaseClient } from '@supabase/supabase-js';

export interface Collaboration {
  id: string;
  title: string;
  description: string;
  participants: CollaborationParticipant[];
  revenueShare: RevenueShareSplit[];
  totalRevenue: number;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  startDate: Date;
  endDate: Date;
  platform: string;
  contentType: string;
  terms: CollaborationTerms;
  performance: CollaborationPerformance;
}

export interface CollaborationParticipant {
  userId: string;
  username: string;
  role: 'creator' | 'collaborator' | 'brand' | 'agency';
  contribution: number; // percentage
  followerCount: number;
  engagementRate: number;
  platform: string;
  isPrimary: boolean;
}

export interface RevenueShareSplit {
  participantId: string;
  percentage: number;
  fixedAmount?: number;
  minimumGuarantee?: number;
  performanceBonus?: number;
  terms: string;
}

export interface CollaborationTerms {
  revenueSharing: boolean;
  intellectualProperty: string;
  contentRights: string;
  exclusivity: boolean;
  duration: number; // in days
  terminationClause: string;
  disputeResolution: string;
}

export interface CollaborationPerformance {
  totalViews: number;
  totalEngagement: number;
  revenueGenerated: number;
  costPerAcquisition: number;
  returnOnInvestment: number;
  participantPerformance: ParticipantPerformance[];
}

export interface ParticipantPerformance {
  participantId: string;
  views: number;
  engagement: number;
  revenue: number;
  contribution: number;
  performanceScore: number;
}

export interface RevenueShareCalculation {
  totalRevenue: number;
  splits: {
    participantId: string;
    percentage: number;
    amount: number;
    bonus: number;
    total: number;
  }[];
  fees: {
    platformFee: number;
    processingFee: number;
    tax: number;
  };
  netDistribution: number;
}

export class RevenueShareSplits {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async createCollaboration(collaboration: Omit<Collaboration, 'id' | 'performance'>): Promise<Collaboration> {
    try {
      const newCollaboration: Collaboration = {
        ...collaboration,
        id: `collab_${Date.now()}`,
        performance: {
          totalViews: 0,
          totalEngagement: 0,
          revenueGenerated: 0,
          costPerAcquisition: 0,
          returnOnInvestment: 0,
          participantPerformance: []
        }
      };

      // Save to database
      const { error } = await this.supabase
        .from('collaborations')
        .insert({
          id: newCollaboration.id,
          title: newCollaboration.title,
          description: newCollaboration.description,
          participants: newCollaboration.participants,
          revenue_share: newCollaboration.revenueShare,
          total_revenue: newCollaboration.totalRevenue,
          status: newCollaboration.status,
          start_date: newCollaboration.startDate.toISOString(),
          end_date: newCollaboration.endDate.toISOString(),
          platform: newCollaboration.platform,
          content_type: newCollaboration.contentType,
          terms: newCollaboration.terms,
          performance: newCollaboration.performance
        });

      if (error) {
        console.error('Error creating collaboration:', error);
        throw new Error('Failed to create collaboration');
      }

      return newCollaboration;
    } catch (error) {
      console.error('Error creating collaboration:', error);
      throw new Error('Failed to create collaboration');
    }
  }

  async calculateRevenueShare(collaborationId: string, totalRevenue: number): Promise<RevenueShareCalculation> {
    try {
      // Get collaboration data
      const collaboration = await this.getCollaboration(collaborationId);
      if (!collaboration) {
        throw new Error('Collaboration not found');
      }

      // Calculate splits based on revenue share percentages
      const splits = collaboration.revenueShare.map(split => {
        const amount = (totalRevenue * split.percentage) / 100;
        const bonus = split.performanceBonus || 0;
        const total = amount + bonus;

        return {
          participantId: split.participantId,
          percentage: split.percentage,
          amount,
          bonus,
          total
        };
      });

      // Calculate fees
      const platformFee = totalRevenue * 0.05; // 5% platform fee
      const processingFee = totalRevenue * 0.029; // 2.9% processing fee
      const tax = totalRevenue * 0.1; // 10% tax (varies by jurisdiction)

      const totalFees = platformFee + processingFee + tax;
      const netDistribution = totalRevenue - totalFees;

      return {
        totalRevenue,
        splits,
        fees: {
          platformFee,
          processingFee,
          tax
        },
        netDistribution
      };
    } catch (error) {
      console.error('Error calculating revenue share:', error);
      throw new Error('Failed to calculate revenue share');
    }
  }

  async distributeRevenue(collaborationId: string, revenue: number): Promise<void> {
    try {
      const calculation = await this.calculateRevenueShare(collaborationId, revenue);
      
      // Update collaboration with new revenue
      await this.updateCollaborationRevenue(collaborationId, revenue);
      
      // Create revenue distribution records
      for (const split of calculation.splits) {
        await this.createRevenueDistribution({
          collaborationId,
          participantId: split.participantId,
          amount: split.total,
          percentage: split.percentage,
          bonus: split.bonus,
          status: 'pending',
          distributionDate: new Date()
        });
      }

      // Update collaboration performance
      await this.updateCollaborationPerformance(collaborationId, revenue);
    } catch (error) {
      console.error('Error distributing revenue:', error);
      throw new Error('Failed to distribute revenue');
    }
  }

  private async getCollaboration(collaborationId: string): Promise<Collaboration | null> {
    try {
      const { data, error } = await this.supabase
        .from('collaborations')
        .select('*')
        .eq('id', collaborationId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching collaboration:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        participants: data.participants,
        revenueShare: data.revenue_share,
        totalRevenue: data.total_revenue,
        status: data.status,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        platform: data.platform,
        contentType: data.content_type,
        terms: data.terms,
        performance: data.performance
      };
    } catch (error) {
      console.error('Error fetching collaboration:', error);
      return null;
    }
  }

  private async updateCollaborationRevenue(collaborationId: string, revenue: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('collaborations')
        .update({ 
          total_revenue: revenue,
          updated_at: new Date().toISOString()
        })
        .eq('id', collaborationId);

      if (error) {
        console.error('Error updating collaboration revenue:', error);
        throw new Error('Failed to update collaboration revenue');
      }
    } catch (error) {
      console.error('Error updating collaboration revenue:', error);
      throw new Error('Failed to update collaboration revenue');
    }
  }

  private async createRevenueDistribution(distribution: {
    collaborationId: string;
    participantId: string;
    amount: number;
    percentage: number;
    bonus: number;
    status: string;
    distributionDate: Date;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('revenue_distributions')
        .insert({
          collaboration_id: distribution.collaborationId,
          participant_id: distribution.participantId,
          amount: distribution.amount,
          percentage: distribution.percentage,
          bonus: distribution.bonus,
          status: distribution.status,
          distribution_date: distribution.distributionDate.toISOString()
        });

      if (error) {
        console.error('Error creating revenue distribution:', error);
        throw new Error('Failed to create revenue distribution');
      }
    } catch (error) {
      console.error('Error creating revenue distribution:', error);
      throw new Error('Failed to create revenue distribution');
    }
  }

  private async updateCollaborationPerformance(collaborationId: string, revenue: number): Promise<void> {
    try {
      // Get current performance data
      const { data: collaborationData, error: fetchError } = await this.supabase
        .from('collaborations')
        .select('performance')
        .eq('id', collaborationId)
        .single();

      if (fetchError) {
        console.error('Error fetching collaboration performance:', fetchError);
        return;
      }

      const currentPerformance = collaborationData.performance || {
        totalViews: 0,
        totalEngagement: 0,
        revenueGenerated: 0,
        costPerAcquisition: 0,
        returnOnInvestment: 0,
        participantPerformance: []
      };

      // Update performance metrics
      const updatedPerformance = {
        ...currentPerformance,
        revenueGenerated: currentPerformance.revenueGenerated + revenue,
        returnOnInvestment: this.calculateROI(currentPerformance.revenueGenerated + revenue, 1000) // Assuming $1000 investment
      };

      // Update in database
      const { error: updateError } = await this.supabase
        .from('collaborations')
        .update({ 
          performance: updatedPerformance,
          updated_at: new Date().toISOString()
        })
        .eq('id', collaborationId);

      if (updateError) {
        console.error('Error updating collaboration performance:', updateError);
      }
    } catch (error) {
      console.error('Error updating collaboration performance:', error);
    }
  }

  private calculateROI(revenue: number, investment: number): number {
    return ((revenue - investment) / investment) * 100;
  }

  async getUserCollaborations(userId: string): Promise<Collaboration[]> {
    try {
      const { data, error } = await this.supabase
        .from('collaborations')
        .select('*')
        .contains('participants', [{ userId }])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user collaborations:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        participants: item.participants,
        revenueShare: item.revenue_share,
        totalRevenue: item.total_revenue,
        status: item.status,
        startDate: new Date(item.start_date),
        endDate: new Date(item.end_date),
        platform: item.platform,
        contentType: item.content_type,
        terms: item.terms,
        performance: item.performance
      }));
    } catch (error) {
      console.error('Error fetching user collaborations:', error);
      return [];
    }
  }

  async getUserRevenueDistributions(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('revenue_distributions')
        .select(`
          *,
          collaborations (
            title,
            platform,
            content_type
          )
        `)
        .eq('participant_id', userId)
        .order('distribution_date', { ascending: false });

      if (error) {
        console.error('Error fetching user revenue distributions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user revenue distributions:', error);
      return [];
    }
  }

  async getCollaborationAnalytics(collaborationId: string): Promise<{
    totalRevenue: number;
    totalDistributions: number;
    participantCount: number;
    averageRevenuePerParticipant: number;
    topPerformer: string;
    performanceMetrics: any;
  }> {
    try {
      const collaboration = await this.getCollaboration(collaborationId);
      if (!collaboration) {
        throw new Error('Collaboration not found');
      }

      const { data: distributions, error } = await this.supabase
        .from('revenue_distributions')
        .select('*')
        .eq('collaboration_id', collaborationId);

      if (error) {
        console.error('Error fetching collaboration distributions:', error);
        throw new Error('Failed to fetch collaboration distributions');
      }

      const totalDistributions = distributions?.reduce((sum, dist) => sum + dist.amount, 0) || 0;
      const participantCount = collaboration.participants.length;
      const averageRevenuePerParticipant = totalDistributions / participantCount || 0;

      // Find top performer
      const participantPerformance = collaboration.performance.participantPerformance;
      const topPerformer = participantPerformance.length > 0 
        ? participantPerformance.reduce((a, b) => a.performanceScore > b.performanceScore ? a : b).participantId
        : '';

      return {
        totalRevenue: collaboration.totalRevenue,
        totalDistributions,
        participantCount,
        averageRevenuePerParticipant,
        topPerformer,
        performanceMetrics: collaboration.performance
      };
    } catch (error) {
      console.error('Error getting collaboration analytics:', error);
      throw new Error('Failed to get collaboration analytics');
    }
  }

  async createRevenueShareTemplate(template: {
    name: string;
    description: string;
    defaultSplits: RevenueShareSplit[];
    terms: CollaborationTerms;
    category: string;
  }): Promise<string> {
    try {
      const templateId = `template_${Date.now()}`;
      
      const { error } = await this.supabase
        .from('revenue_share_templates')
        .insert({
          id: templateId,
          name: template.name,
          description: template.description,
          default_splits: template.defaultSplits,
          terms: template.terms,
          category: template.category,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating revenue share template:', error);
        throw new Error('Failed to create revenue share template');
      }

      return templateId;
    } catch (error) {
      console.error('Error creating revenue share template:', error);
      throw new Error('Failed to create revenue share template');
    }
  }

  async getRevenueShareTemplates(category?: string): Promise<any[]> {
    try {
      let query = this.supabase
        .from('revenue_share_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching revenue share templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching revenue share templates:', error);
      return [];
    }
  }
}
