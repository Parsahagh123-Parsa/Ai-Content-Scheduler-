import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user';
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    // Fetch posts
    const { data: posts, error: postsError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'posted')
      .gte('posted_at', startDate.toISOString())
      .order('posted_at', { ascending: false });

    if (postsError) throw postsError;

    // Fetch content plans for additional data
    const { data: plans } = await supabase
      .from('content_plans')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    // Calculate overview statistics
    const totalPosts = posts?.length || 0;
    const totalViews = posts?.reduce((sum, p) => sum + ((p.engagement_data?.views as number) || 0), 0) || 0;
    const totalLikes = posts?.reduce((sum, p) => sum + ((p.engagement_data?.likes as number) || 0), 0) || 0;
    const totalComments = posts?.reduce((sum, p) => sum + ((p.engagement_data?.comments as number) || 0), 0) || 0;
    const totalShares = posts?.reduce((sum, p) => sum + ((p.engagement_data?.shares as number) || 0), 0) || 0;
    const averageEngagement = totalPosts > 0
      ? (totalLikes + totalComments + totalShares) / totalPosts / (totalViews / totalPosts) * 100
      : 0;

    // Platform statistics
    const platformStats = ['instagram', 'tiktok', 'youtube', 'twitter'].map(platform => {
      const platformPosts = posts?.filter(p => p.platform === platform) || [];
      const platformViews = platformPosts.reduce((sum, p) => sum + ((p.engagement_data?.views as number) || 0), 0);
      const platformEngagement = platformPosts.length > 0
        ? platformPosts.reduce((sum, p) => {
            const views = (p.engagement_data?.views as number) || 0;
            const likes = (p.engagement_data?.likes as number) || 0;
            const comments = (p.engagement_data?.comments as number) || 0;
            const shares = (p.engagement_data?.shares as number) || 0;
            return sum + (views > 0 ? (likes + comments + shares) / views * 100 : 0);
          }, 0) / platformPosts.length
        : 0;

      return {
        platform,
        posts: platformPosts.length,
        views: platformViews,
        engagement: platformEngagement,
        growth: Math.random() * 20 - 5, // Mock growth data
      };
    });

    // Top posts
    const topPosts = (posts || [])
      .map(post => ({
        id: post.id,
        platform: post.platform,
        content: post.content.substring(0, 100) + '...',
        views: (post.engagement_data?.views as number) || 0,
        engagement: post.viral_score || 0,
        viralScore: post.viral_score || 0,
        postedAt: post.posted_at || post.created_at,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Engagement trend (last 7 days)
    const engagementTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayPosts = posts?.filter(p => {
        const postDate = new Date(p.posted_at || p.created_at);
        return postDate.toDateString() === date.toDateString();
      }) || [];

      engagementTrend.push({
        date: date.toISOString(),
        views: dayPosts.reduce((sum, p) => sum + ((p.engagement_data?.views as number) || 0), 0),
        likes: dayPosts.reduce((sum, p) => sum + ((p.engagement_data?.likes as number) || 0), 0),
        comments: dayPosts.reduce((sum, p) => sum + ((p.engagement_data?.comments as number) || 0), 0),
        shares: dayPosts.reduce((sum, p) => sum + ((p.engagement_data?.shares as number) || 0), 0),
      });
    }

    // Audience insights
    const allHashtags = (posts || []).flatMap(p => p.hashtags || []);
    const hashtagCounts: Record<string, number> = {};
    allHashtags.forEach(tag => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
    const topHashtags = Object.entries(hashtagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);

    // Goals (mock data for now)
    const goals = [
      {
        current: totalViews,
        target: 100000,
        metric: 'Total Views',
        progress: Math.min((totalViews / 100000) * 100, 100),
      },
      {
        current: totalPosts,
        target: 100,
        metric: 'Posts This Month',
        progress: Math.min((totalPosts / 100) * 100, 100),
      },
      {
        current: Math.round(averageEngagement),
        target: 10,
        metric: 'Avg Engagement Rate',
        progress: Math.min((averageEngagement / 10) * 100, 100),
      },
    ];

    return NextResponse.json({
      overview: {
        totalPosts,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        averageEngagement,
        growthRate: 15.3, // Mock growth rate
      },
      platformStats,
      topPosts,
      engagementTrend,
      audienceInsights: {
        peakHours: [9, 11, 14, 17, 20],
        bestDays: ['Monday', 'Wednesday', 'Friday'],
        topHashtags,
        contentTypes: [
          { type: 'Video', count: 45, avgEngagement: 8.5 },
          { type: 'Image', count: 30, avgEngagement: 6.2 },
          { type: 'Carousel', count: 15, avgEngagement: 7.8 },
        ],
      },
      goals,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

