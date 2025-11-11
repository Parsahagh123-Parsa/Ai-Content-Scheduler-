/**
 * Export/Import Utilities
 * 
 * Functions for exporting and importing content plans, posts, and settings
 */

export interface ExportData {
  version: string;
  exportDate: string;
  contentPlans: any[];
  scheduledPosts: any[];
  settings: any;
  assets?: any[];
}

/**
 * Export all user data to JSON
 */
export async function exportUserData(userId: string): Promise<string> {
  const { supabase } = await import('./supabase');
  
  // Fetch all user data
  const [contentPlans, scheduledPosts, userPrefs] = await Promise.all([
    supabase.from('content_plans').select('*').eq('user_id', userId),
    supabase.from('scheduled_posts').select('*').eq('user_id', userId),
    supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
  ]);

  const exportData: ExportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    contentPlans: contentPlans.data || [],
    scheduledPosts: scheduledPosts.data || [],
    settings: userPrefs.data || {},
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import user data from JSON
 */
export async function importUserData(userId: string, jsonData: string): Promise<{ success: boolean; imported: number; errors: string[] }> {
  const { supabase } = await import('./supabase');
  
  try {
    const data: ExportData = JSON.parse(jsonData);
    const errors: string[] = [];
    let imported = 0;

    // Import content plans
    if (data.contentPlans && data.contentPlans.length > 0) {
      const plansToImport = data.contentPlans.map(plan => ({
        ...plan,
        user_id: userId,
        id: undefined, // Let database generate new IDs
      }));

      const { error } = await supabase
        .from('content_plans')
        .insert(plansToImport);

      if (error) {
        errors.push(`Content plans: ${error.message}`);
      } else {
        imported += plansToImport.length;
      }
    }

    // Import scheduled posts
    if (data.scheduledPosts && data.scheduledPosts.length > 0) {
      const postsToImport = data.scheduledPosts.map(post => ({
        ...post,
        user_id: userId,
        id: undefined,
      }));

      const { error } = await supabase
        .from('scheduled_posts')
        .insert(postsToImport);

      if (error) {
        errors.push(`Scheduled posts: ${error.message}`);
      } else {
        imported += postsToImport.length;
      }
    }

    // Import settings
    if (data.settings) {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...data.settings,
        });

      if (error) {
        errors.push(`Settings: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      imported,
      errors,
    };
  } catch (error: any) {
    return {
      success: false,
      imported: 0,
      errors: [error.message || 'Invalid JSON data'],
    };
  }
}

/**
 * Export content plan to CSV
 */
export function exportContentPlanToCSV(contentPlan: any): string {
  const headers = ['Day', 'Title', 'Caption', 'Hashtags', 'Time', 'Platform'];
  const rows: string[][] = [headers];

  Object.entries(contentPlan.content_plan || {}).forEach(([day, data]: [string, any]) => {
    rows.push([
      day,
      data.title || '',
      data.caption || '',
      data.hashtags || '',
      data.time || '',
      contentPlan.platform || '',
    ]);
  });

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

/**
 * Export analytics to CSV
 */
export function exportAnalyticsToCSV(analytics: any): string {
  const headers = ['Date', 'Views', 'Likes', 'Comments', 'Shares', 'Engagement Rate'];
  const rows: string[][] = [headers];

  analytics.engagementTrend?.forEach((data: any) => {
    const engagementRate = data.views > 0
      ? ((data.likes + data.comments + data.shares) / data.views * 100).toFixed(2)
      : '0';
    
    rows.push([
      new Date(data.date).toLocaleDateString(),
      data.views.toString(),
      data.likes.toString(),
      data.comments.toString(),
      data.shares.toString(),
      engagementRate,
    ]);
  });

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

