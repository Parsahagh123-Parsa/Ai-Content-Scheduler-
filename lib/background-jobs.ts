import { supabase } from './supabase';
import { getTrendingTopics, updateTrendsBackground } from './trends';
import { generateEnhancedContentPlan } from './content-generator';

export interface BackgroundJob {
  id: string;
  type: 'trend_update' | 'content_refresh' | 'analytics_update';
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  error?: string;
  data?: any;
}

export interface UserPreference {
  user_id: string;
  always_stay_viral: boolean;
  auto_refresh_interval: number; // hours
  preferred_platforms: string[];
  last_refresh?: string;
}

// Background job queue
const jobQueue: BackgroundJob[] = [];
let isProcessing = false;

export async function addBackgroundJob(
  type: BackgroundJob['type'],
  data?: any
): Promise<string> {
  const job: BackgroundJob = {
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    status: 'pending',
    created_at: new Date().toISOString(),
    data,
  };

  jobQueue.push(job);
  
  // Start processing if not already running
  if (!isProcessing) {
    processJobQueue();
  }

  return job.id;
}

async function processJobQueue() {
  if (isProcessing || jobQueue.length === 0) return;
  
  isProcessing = true;
  
  while (jobQueue.length > 0) {
    const job = jobQueue.shift();
    if (!job) continue;
    
    try {
      job.status = 'running';
      await executeJob(job);
      job.status = 'completed';
      job.completed_at = new Date().toISOString();
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Background job ${job.id} failed:`, error);
    }
  }
  
  isProcessing = false;
}

async function executeJob(job: BackgroundJob) {
  switch (job.type) {
    case 'trend_update':
      await updateTrendsBackground();
      break;
      
    case 'content_refresh':
      await refreshUserContentPlans(job.data);
      break;
      
    case 'analytics_update':
      await updateAnalytics(job.data);
      break;
      
    default:
      throw new Error(`Unknown job type: ${job.type}`);
  }
}

async function refreshUserContentPlans(data: { userId: string }) {
  // Get user's preferences
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', data.userId)
    .single();

  if (!preferences?.always_stay_viral) return;

  // Get user's recent content plans
  const { data: plans } = await supabase
    .from('content_plans')
    .select('*')
    .eq('user_id', data.userId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  if (!plans || plans.length === 0) return;

  // Refresh each plan with latest trends
  for (const plan of plans) {
    try {
      const result = await generateEnhancedContentPlan({
        creatorType: plan.creator_type,
        platform: plan.platform,
        contentGoal: plan.content_goal,
        targetAudience: plan.target_audience,
        tone: plan.tone || 'engaging',
      });

      // Update the plan with fresh trends
      await supabase
        .from('content_plans')
        .update({
          content_plan: result.contentPlan,
          trending_topics: result.trendingTopics,
          updated_at: new Date().toISOString(),
        })
        .eq('id', plan.id);

      // Log the refresh
      await supabase
        .from('analytics')
        .insert({
          user_id: data.userId,
          event_type: 'content_refreshed',
          event_data: {
            plan_id: plan.id,
            refreshed_at: new Date().toISOString(),
          },
        });

    } catch (error) {
      console.error(`Failed to refresh plan ${plan.id}:`, error);
    }
  }
}

async function updateAnalytics(data: { userId: string }) {
  // Update user analytics with latest data
  const { data: recentPlans } = await supabase
    .from('content_plans')
    .select('*')
    .eq('user_id', data.userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (!recentPlans) return;

  // Calculate analytics
  const analytics = {
    total_plans: recentPlans.length,
    platforms: [...new Set(recentPlans.map(p => p.platform))],
    creator_types: [...new Set(recentPlans.map(p => p.creator_type))],
    avg_plan_days: recentPlans.reduce((acc, p) => acc + Object.keys(p.content_plan || {}).length, 0) / recentPlans.length,
    last_activity: recentPlans[0]?.created_at,
  };

  // Store analytics
  await supabase
    .from('user_analytics')
    .upsert({
      user_id: data.userId,
      analytics_data: analytics,
      updated_at: new Date().toISOString(),
    });
}

// Scheduled job runner (call this from a cron job or edge function)
export async function runScheduledJobs() {
  console.log('Running scheduled background jobs...');
  
  // Update trends every 6 hours
  await addBackgroundJob('trend_update');
  
  // Get users with auto-refresh enabled
  const { data: users } = await supabase
    .from('user_preferences')
    .select('user_id')
    .eq('always_stay_viral', true);

  if (users) {
    for (const user of users) {
      await addBackgroundJob('content_refresh', { userId: user.user_id });
    }
  }
  
  console.log('Scheduled jobs completed');
}

// Edge function for Supabase
export async function handleTrendUpdate() {
  try {
    await updateTrendsBackground();
    
    // Notify users about new trends
    const { data: users } = await supabase
      .from('user_preferences')
      .select('user_id, preferred_platforms')
      .eq('always_stay_viral', true);

    if (users) {
      for (const user of users) {
        // Send notification (implement with your preferred notification service)
        await sendTrendNotification(user.user_id, user.preferred_platforms);
      }
    }

    return { success: true, message: 'Trends updated successfully' };
  } catch (error) {
    console.error('Trend update failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function sendTrendNotification(userId: string, platforms: string[]) {
  // This would integrate with your notification service
  // For now, we'll just log it
  console.log(`Sending trend notification to user ${userId} for platforms: ${platforms.join(', ')}`);
  
  // In a real implementation, you might:
  // - Send push notifications
  // - Send email notifications
  // - Update in-app notifications
  // - Send SMS alerts
}

// User preference management
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreference>
) {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserPreferences(userId: string): Promise<UserPreference | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No preferences found, return default
      return {
        user_id: userId,
        always_stay_viral: false,
        auto_refresh_interval: 6,
        preferred_platforms: ['tiktok', 'instagram'],
      };
    }
    throw error;
  }

  return data;
}
