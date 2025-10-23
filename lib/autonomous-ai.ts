import { supabase } from './supabase';
import { generateEnhancedContentPlan } from './content-generator';
import { getTrendingTopics } from './trends';
import { addBackgroundJob } from './background-jobs';

export interface AutonomousAgent {
  id: string;
  userId: string;
  name: string;
  schedule: 'weekly' | 'daily' | 'custom';
  scheduleTime: string; // Cron expression or time
  isActive: boolean;
  preferences: {
    creatorType: string;
    platform: string;
    tone: string;
    autoApprove: boolean;
    learningEnabled: boolean;
  };
  performance: {
    totalGenerated: number;
    approvedRate: number;
    lastGenerated: string;
    successRate: number;
  };
}

export interface AILearningData {
  userId: string;
  feedback: 'approved' | 'rejected' | 'modified';
  contentId: string;
  modifications?: string;
  performance?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  timestamp: string;
}

// Autonomous agent management
export async function createAutonomousAgent(
  userId: string,
  agentData: Omit<AutonomousAgent, 'id' | 'performance'>
): Promise<AutonomousAgent> {
  const agent: AutonomousAgent = {
    id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    ...agentData,
    performance: {
      totalGenerated: 0,
      approvedRate: 0,
      lastGenerated: new Date().toISOString(),
      successRate: 0,
    },
  };

  // Store in database
  await supabase
    .from('autonomous_agents')
    .insert([agent]);

  // Schedule the agent
  await scheduleAgent(agent);

  return agent;
}

export async function scheduleAgent(agent: AutonomousAgent) {
  if (!agent.isActive) return;

  // Convert schedule to cron expression
  const cronExpression = convertScheduleToCron(agent.schedule, agent.scheduleTime);
  
  // Add to background job queue
  await addBackgroundJob('autonomous_generation', {
    agentId: agent.id,
    userId: agent.userId,
    cronExpression,
  });
}

function convertScheduleToCron(schedule: string, time: string): string {
  switch (schedule) {
    case 'weekly':
      // Every Monday at specified time
      const [hour, minute] = time.split(':');
      return `${minute} ${hour} * * 1`;
    case 'daily':
      const [dailyHour, dailyMinute] = time.split(':');
      return `${dailyMinute} ${dailyHour} * * *`;
    default:
      return '0 9 * * 1'; // Default: Every Monday at 9 AM
  }
}

// Main autonomous generation function
export async function runAutonomousGeneration(agentId: string) {
  try {
    // Get agent details
    const { data: agent } = await supabase
      .from('autonomous_agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (!agent || !agent.isActive) return;

    // Get user preferences and recent performance
    const userPrefs = await getUserPreferences(agent.userId);
    const learningData = await getLearningData(agent.userId);

    // Generate content with learning insights
    const contentPlan = await generateIntelligentContent(agent, userPrefs, learningData);

    // Store generated content
    const { data: savedPlan } = await supabase
      .from('content_plans')
      .insert([{
        user_id: agent.userId,
        creator_type: agent.preferences.creatorType,
        platform: agent.preferences.platform,
        content_plan: contentPlan.contentPlan,
        trending_topics: contentPlan.trendingTopics,
        tone: agent.preferences.tone,
        is_autonomous: true,
        agent_id: agentId,
      }])
      .select()
      .single();

    // Update agent performance
    await updateAgentPerformance(agentId, true);

    // Send notification to user
    await sendAutonomousNotification(agent.userId, savedPlan.id, agent.preferences.autoApprove);

    // If auto-approve is enabled, schedule posts
    if (agent.preferences.autoApprove) {
      await scheduleAutonomousPosts(savedPlan.id, agent.preferences.platform);
    }

    return savedPlan;
  } catch (error) {
    console.error('Autonomous generation failed:', error);
    await updateAgentPerformance(agentId, false);
    throw error;
  }
}

async function generateIntelligentContent(
  agent: AutonomousAgent,
  userPrefs: any,
  learningData: AILearningData[]
) {
  // Analyze learning data to improve generation
  const insights = analyzeLearningData(learningData);
  
  // Get latest trends
  const trendingTopics = await getTrendingTopics(agent.preferences.platform);
  
  // Generate content with learning insights
  const result = await generateEnhancedContentPlan({
    creatorType: agent.preferences.creatorType,
    platform: agent.preferences.platform,
    tone: agent.preferences.tone,
    // Include learning insights in the prompt
    learningInsights: insights,
    trendingTopics: trendingTopics.map(t => t.topic),
  });

  return result;
}

function analyzeLearningData(learningData: AILearningData[]) {
  const insights = {
    preferredContentTypes: [] as string[],
    highPerformingElements: [] as string[],
    avoidPatterns: [] as string[],
    optimalTiming: 'morning',
    toneAdjustments: {} as Record<string, number>,
  };

  // Analyze approved vs rejected content
  const approved = learningData.filter(d => d.feedback === 'approved');
  const rejected = learningData.filter(d => d.feedback === 'rejected');

  // Find patterns in approved content
  approved.forEach(data => {
    if (data.performance) {
      // Analyze high-performing content
      if (data.performance.views && data.performance.views > 1000) {
        insights.highPerformingElements.push('high_engagement');
      }
    }
  });

  // Find patterns in rejected content
  rejected.forEach(data => {
    if (data.modifications) {
      insights.avoidPatterns.push(data.modifications);
    }
  });

  return insights;
}

async function getUserPreferences(userId: string) {
  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data;
}

async function getLearningData(userId: string): Promise<AILearningData[]> {
  const { data } = await supabase
    .from('ai_learning_data')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(100);

  return data || [];
}

async function updateAgentPerformance(agentId: string, success: boolean) {
  const { data: agent } = await supabase
    .from('autonomous_agents')
    .select('performance')
    .eq('id', agentId)
    .single();

  if (!agent) return;

  const performance = agent.performance;
  performance.totalGenerated += 1;
  performance.lastGenerated = new Date().toISOString();
  
  if (success) {
    performance.successRate = (performance.successRate * (performance.totalGenerated - 1) + 1) / performance.totalGenerated;
  } else {
    performance.successRate = (performance.successRate * (performance.totalGenerated - 1)) / performance.totalGenerated;
  }

  await supabase
    .from('autonomous_agents')
    .update({ performance })
    .eq('id', agentId);
}

async function sendAutonomousNotification(
  userId: string,
  planId: string,
  autoApprove: boolean
) {
  // This would integrate with your notification service
  console.log(`Sending notification to user ${userId} about new autonomous plan ${planId}`);
  
  // Store notification in database
  await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      type: 'autonomous_generation',
      title: 'New AI-Generated Content Plan Ready!',
      message: autoApprove 
        ? 'Your AI agent has generated a new content plan and scheduled it for posting.'
        : 'Your AI agent has generated a new content plan. Please review and approve.',
      data: { planId },
      is_read: false,
    }]);
}

async function scheduleAutonomousPosts(planId: string, platform: string) {
  // This would integrate with your posting service (Zapier, etc.)
  console.log(`Scheduling autonomous posts for plan ${planId} on ${platform}`);
  
  // Store scheduled posts
  await supabase
    .from('scheduled_posts')
    .insert([{
      plan_id: planId,
      platform,
      status: 'scheduled',
      scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    }]);
}

// Learning system
export async function recordUserFeedback(
  userId: string,
  contentId: string,
  feedback: 'approved' | 'rejected' | 'modified',
  modifications?: string,
  performance?: AILearningData['performance']
) {
  const learningData: AILearningData = {
    userId,
    contentId,
    feedback,
    modifications,
    performance,
    timestamp: new Date().toISOString(),
  };

  await supabase
    .from('ai_learning_data')
    .insert([learningData]);

  // Update agent performance if this was from an autonomous agent
  const { data: plan } = await supabase
    .from('content_plans')
    .select('agent_id')
    .eq('id', contentId)
    .single();

  if (plan?.agent_id) {
    await updateAgentApprovalRate(plan.agent_id, feedback === 'approved');
  }
}

async function updateAgentApprovalRate(agentId: string, approved: boolean) {
  const { data: agent } = await supabase
    .from('autonomous_agents')
    .select('performance')
    .eq('id', agentId)
    .single();

  if (!agent) return;

  const performance = agent.performance;
  const totalApprovals = performance.approvedRate * performance.totalGenerated;
  
  if (approved) {
    performance.approvedRate = (totalApprovals + 1) / performance.totalGenerated;
  } else {
    performance.approvedRate = totalApprovals / performance.totalGenerated;
  }

  await supabase
    .from('autonomous_agents')
    .update({ performance })
    .eq('id', agentId);
}

// Get user's autonomous agents
export async function getUserAutonomousAgents(userId: string): Promise<AutonomousAgent[]> {
  const { data } = await supabase
    .from('autonomous_agents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data || [];
}

// Update agent settings
export async function updateAutonomousAgent(
  agentId: string,
  updates: Partial<AutonomousAgent>
) {
  const { data, error } = await supabase
    .from('autonomous_agents')
    .update(updates)
    .eq('id', agentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete agent
export async function deleteAutonomousAgent(agentId: string) {
  await supabase
    .from('autonomous_agents')
    .delete()
    .eq('id', agentId);
}
