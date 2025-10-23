import { supabase } from './supabase';
import { openai } from './openai';

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'feature' | 'bug' | 'improvement' | 'infrastructure';
  githubIssueId?: number;
  githubUrl?: string;
  votes: number;
  comments: number;
  estimatedEffort: 'small' | 'medium' | 'large' | 'epic';
  targetRelease?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
}

export interface Vote {
  id: string;
  userId: string;
  roadmapItemId: string;
  voteCredits: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  roadmapItemId: string;
  content: string;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'policy' | 'budget' | 'technical';
  status: 'draft' | 'active' | 'passed' | 'rejected' | 'expired';
  proposerId: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorum: number;
  startDate: string;
  endDate: string;
  smartContractAddress?: string;
  transactionHash?: string;
  createdAt: string;
}

export interface PolicyChange {
  id: string;
  documentType: 'terms' | 'privacy' | 'cookies' | 'data-processing';
  version: string;
  changes: string[];
  summary: string;
  effectiveDate: string;
  publishedAt: string;
  aiSummary: string;
}

export interface PublicMetrics {
  uptime: number;
  apiLatency: number;
  totalUsers: number;
  activeUsers: number;
  totalGenerations: number;
  averageResponseTime: number;
  errorRate: number;
  lastUpdated: string;
}

// Governance Service
export class GovernanceService {
  // Fetch roadmap items from GitHub Issues
  async fetchRoadmapFromGitHub(): Promise<RoadmapItem[]> {
    try {
      const githubToken = process.env.GITHUB_TOKEN;
      const repoOwner = process.env.GITHUB_REPO_OWNER || 'your-org';
      const repoName = process.env.GITHUB_REPO_NAME || 'ai-content-scheduler';
      
      const response = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/issues?labels=roadmap&state=open`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const issues = await response.json();
      
      const roadmapItems: RoadmapItem[] = issues.map((issue: any) => ({
        id: `roadmap_${issue.id}`,
        title: issue.title,
        description: issue.body || '',
        status: this.mapGitHubStateToStatus(issue.state),
        priority: this.extractPriorityFromLabels(issue.labels),
        category: this.extractCategoryFromLabels(issue.labels),
        githubIssueId: issue.number,
        githubUrl: issue.html_url,
        votes: issue.reactions?.+1 || 0,
        comments: issue.comments || 0,
        estimatedEffort: this.extractEffortFromLabels(issue.labels),
        targetRelease: this.extractTargetReleaseFromLabels(issue.labels),
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        createdBy: issue.user.login,
        tags: issue.labels.map((label: any) => label.name),
      }));

      // Store in database
      await this.storeRoadmapItems(roadmapItems);
      
      return roadmapItems;
    } catch (error) {
      console.error('Error fetching roadmap from GitHub:', error);
      return [];
    }
  }

  private mapGitHubStateToStatus(state: string): 'planned' | 'in-progress' | 'completed' | 'cancelled' {
    switch (state) {
      case 'open':
        return 'planned';
      case 'closed':
        return 'completed';
      default:
        return 'planned';
    }
  }

  private extractPriorityFromLabels(labels: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const priorityLabels = labels.map(l => l.name.toLowerCase());
    
    if (priorityLabels.includes('critical') || priorityLabels.includes('p0')) return 'critical';
    if (priorityLabels.includes('high') || priorityLabels.includes('p1')) return 'high';
    if (priorityLabels.includes('low') || priorityLabels.includes('p3')) return 'low';
    
    return 'medium';
  }

  private extractCategoryFromLabels(labels: any[]): 'feature' | 'bug' | 'improvement' | 'infrastructure' {
    const categoryLabels = labels.map(l => l.name.toLowerCase());
    
    if (categoryLabels.includes('bug')) return 'bug';
    if (categoryLabels.includes('enhancement') || categoryLabels.includes('improvement')) return 'improvement';
    if (categoryLabels.includes('infrastructure') || categoryLabels.includes('devops')) return 'infrastructure';
    
    return 'feature';
  }

  private extractEffortFromLabels(labels: any[]): 'small' | 'medium' | 'large' | 'epic' {
    const effortLabels = labels.map(l => l.name.toLowerCase());
    
    if (effortLabels.includes('epic') || effortLabels.includes('x-large')) return 'epic';
    if (effortLabels.includes('large') || effortLabels.includes('l')) return 'large';
    if (effortLabels.includes('small') || effortLabels.includes('s')) return 'small';
    
    return 'medium';
  }

  private extractTargetReleaseFromLabels(labels: any[]): string | undefined {
    const releaseLabel = labels.find(l => l.name.startsWith('release/'));
    return releaseLabel?.name.replace('release/', '');
  }

  private async storeRoadmapItems(items: RoadmapItem[]): Promise<void> {
    try {
      for (const item of items) {
        await supabase
          .from('roadmap_items')
          .upsert([item], { onConflict: 'id' });
      }
    } catch (error) {
      console.error('Error storing roadmap items:', error);
    }
  }

  // Community Voting System
  async castVote(userId: string, roadmapItemId: string, voteCredits: number): Promise<boolean> {
    try {
      // Check if user has enough vote credits
      const userCredits = await this.getUserVoteCredits(userId);
      if (userCredits < voteCredits) {
        throw new Error('Insufficient vote credits');
      }

      // Check if user already voted on this item
      const existingVote = await supabase
        .from('roadmap_votes')
        .select('*')
        .eq('user_id', userId)
        .eq('roadmap_item_id', roadmapItemId)
        .single();

      if (existingVote.data) {
        // Update existing vote
        await supabase
          .from('roadmap_votes')
          .update({ vote_credits: voteCredits })
          .eq('id', existingVote.data.id);
      } else {
        // Create new vote
        await supabase
          .from('roadmap_votes')
          .insert([{
            user_id: userId,
            roadmap_item_id: roadmapItemId,
            vote_credits: voteCredits,
          }]);
      }

      // Update roadmap item vote count
      await this.updateRoadmapItemVotes(roadmapItemId);

      // Deduct vote credits from user
      await this.deductVoteCredits(userId, voteCredits);

      return true;
    } catch (error) {
      console.error('Error casting vote:', error);
      return false;
    }
  }

  private async getUserVoteCredits(userId: string): Promise<number> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('vote_credits')
        .eq('id', userId)
        .single();

      return user?.vote_credits || 0;
    } catch (error) {
      console.error('Error getting user vote credits:', error);
      return 0;
    }
  }

  private async deductVoteCredits(userId: string, amount: number): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ vote_credits: supabase.raw(`vote_credits - ${amount}`) })
        .eq('id', userId);
    } catch (error) {
      console.error('Error deducting vote credits:', error);
    }
  }

  private async updateRoadmapItemVotes(roadmapItemId: string): Promise<void> {
    try {
      const { data: votes } = await supabase
        .from('roadmap_votes')
        .select('vote_credits')
        .eq('roadmap_item_id', roadmapItemId);

      const totalVotes = votes?.reduce((sum, vote) => sum + vote.vote_credits, 0) || 0;

      await supabase
        .from('roadmap_items')
        .update({ votes: totalVotes })
        .eq('id', roadmapItemId);
    } catch (error) {
      console.error('Error updating roadmap item votes:', error);
    }
  }

  // Add comment to roadmap item
  async addComment(userId: string, roadmapItemId: string, content: string): Promise<Comment> {
    try {
      const comment: Comment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        roadmapItemId,
        content,
        isOfficial: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('roadmap_comments')
        .insert([comment])
        .select()
        .single();

      if (error) throw error;

      // Update comment count
      await supabase
        .from('roadmap_items')
        .update({ comments: supabase.raw('comments + 1') })
        .eq('id', roadmapItemId);

      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Policy Change Log
  async generatePolicyChangeSummary(documentType: string, changes: string[]): Promise<PolicyChange> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a legal document analyst. Summarize the changes to a ${documentType} document in plain language that users can understand. Focus on what changed and how it affects users.`
          },
          {
            role: "user",
            content: `Document type: ${documentType}\nChanges: ${changes.join('\n')}\n\nProvide a clear, concise summary of what changed and why it matters to users.`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const aiSummary = response.choices[0]?.message?.content || '';

      const policyChange: PolicyChange = {
        id: `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        documentType: documentType as any,
        version: this.generateVersion(),
        changes,
        summary: this.generateHumanSummary(changes),
        effectiveDate: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        aiSummary,
      };

      // Store policy change
      await supabase
        .from('policy_changes')
        .insert([policyChange]);

      return policyChange;
    } catch (error) {
      console.error('Error generating policy change summary:', error);
      throw error;
    }
  }

  private generateVersion(): string {
    const now = new Date();
    return `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`;
  }

  private generateHumanSummary(changes: string[]): string {
    return changes.join('; ');
  }

  // Public Metrics Dashboard
  async getPublicMetrics(): Promise<PublicMetrics> {
    try {
      // Get system metrics
      const uptime = await this.getSystemUptime();
      const apiLatency = await this.getAverageAPILatency();
      const totalUsers = await this.getTotalUsers();
      const activeUsers = await this.getActiveUsers();
      const totalGenerations = await this.getTotalGenerations();
      const averageResponseTime = await this.getAverageResponseTime();
      const errorRate = await this.getErrorRate();

      return {
        uptime,
        apiLatency,
        totalUsers,
        activeUsers,
        totalGenerations,
        averageResponseTime,
        errorRate,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting public metrics:', error);
      throw error;
    }
  }

  private async getSystemUptime(): Promise<number> {
    // Mock uptime calculation - in real app, use monitoring service
    return 99.9;
  }

  private async getAverageAPILatency(): Promise<number> {
    try {
      const { data } = await supabase
        .from('api_metrics')
        .select('latency')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (!data || data.length === 0) return 0;

      const totalLatency = data.reduce((sum, metric) => sum + metric.latency, 0);
      return totalLatency / data.length;
    } catch (error) {
      return 0;
    }
  }

  private async getTotalUsers(): Promise<number> {
    try {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      return count || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getActiveUsers(): Promise<number> {
    try {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      return count || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getTotalGenerations(): Promise<number> {
    try {
      const { count } = await supabase
        .from('content_plans')
        .select('*', { count: 'exact', head: true });

      return count || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getAverageResponseTime(): Promise<number> {
    try {
      const { data } = await supabase
        .from('api_metrics')
        .select('response_time')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (!data || data.length === 0) return 0;

      const totalTime = data.reduce((sum, metric) => sum + metric.response_time, 0);
      return totalTime / data.length;
    } catch (error) {
      return 0;
    }
  }

  private async getErrorRate(): Promise<number> {
    try {
      const { data: total } = await supabase
        .from('api_metrics')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: errors } = await supabase
        .from('api_metrics')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .gte('status_code', 400);

      if (!total || total.length === 0) return 0;

      return ((errors?.length || 0) / total.length) * 100;
    } catch (error) {
      return 0;
    }
  }

  // Get roadmap items with votes and comments
  async getRoadmapItems(
    status?: string,
    category?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<RoadmapItem[]> {
    try {
      let query = supabase
        .from('roadmap_items')
        .select('*')
        .order('votes', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching roadmap items:', error);
      return [];
    }
  }

  // Get comments for a roadmap item
  async getRoadmapComments(roadmapItemId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('roadmap_comments')
        .select('*')
        .eq('roadmap_item_id', roadmapItemId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching roadmap comments:', error);
      return [];
    }
  }

  // Get policy changes
  async getPolicyChanges(limit: number = 10): Promise<PolicyChange[]> {
    try {
      const { data, error } = await supabase
        .from('policy_changes')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching policy changes:', error);
      return [];
    }
  }

  // Award vote credits to users
  async awardVoteCredits(userId: string, amount: number, reason: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ vote_credits: supabase.raw(`vote_credits + ${amount}`) })
        .eq('id', userId);

      // Log the award
      await supabase
        .from('vote_credit_awards')
        .insert([{
          user_id: userId,
          amount,
          reason,
          awarded_at: new Date().toISOString(),
        }]);
    } catch (error) {
      console.error('Error awarding vote credits:', error);
    }
  }

  // Get user's voting history
  async getUserVotingHistory(userId: string): Promise<Vote[]> {
    try {
      const { data, error } = await supabase
        .from('roadmap_votes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user voting history:', error);
      return [];
    }
  }
}

// Export singleton instance
export const governanceService = new GovernanceService();
