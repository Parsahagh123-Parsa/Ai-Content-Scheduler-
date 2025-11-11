import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const dateRange = searchParams.get('dateRange') || 'all';
    const userId = 'demo-user'; // In production, get from auth

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const results: any[] = [];

    // Calculate date range
    let startDate: Date | null = null;
    if (dateRange !== 'all') {
      const now = new Date();
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Search content plans
    if (type === 'all' || type === 'content-plan') {
      let contentPlansQuery = supabase
        .from('content_plans')
        .select('*')
        .eq('user_id', userId)
        .or(`creator_type.ilike.%${query}%,platform.ilike.%${query}%,content_goal.ilike.%${query}%`);

      if (startDate) {
        contentPlansQuery = contentPlansQuery.gte('created_at', startDate.toISOString());
      }

      const { data: plans } = await contentPlansQuery;

      plans?.forEach((plan: any) => {
        const title = `${plan.creator_type} - ${plan.platform}`;
        const description = plan.content_goal || 'Content plan';
        const relevance = calculateRelevance(query, title + ' ' + description);

        results.push({
          id: plan.id,
          type: 'content-plan',
          title,
          description,
          tags: plan.trending_topics || [],
          createdAt: plan.created_at,
          relevance,
        });
      });
    }

    // Search scheduled posts
    if (type === 'all' || type === 'post') {
      let postsQuery = supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .ilike('content', `%${query}%`);

      if (startDate) {
        postsQuery = postsQuery.gte('created_at', startDate.toISOString());
      }

      const { data: posts } = await postsQuery;

      posts?.forEach((post: any) => {
        const relevance = calculateRelevance(query, post.content);
        results.push({
          id: post.id,
          type: 'post',
          title: post.content.substring(0, 50) + '...',
          description: post.content,
          tags: post.hashtags || [],
          createdAt: post.created_at,
          relevance,
        });
      });
    }

    // Search content assets
    if (type === 'all' || type === 'asset') {
      let assetsQuery = supabase
        .from('content_assets')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', `%${query}%`);

      if (startDate) {
        assetsQuery = assetsQuery.gte('created_at', startDate.toISOString());
      }

      const { data: assets } = await assetsQuery;

      assets?.forEach((asset: any) => {
        const relevance = calculateRelevance(query, asset.name);
        results.push({
          id: asset.id,
          type: 'asset',
          title: asset.name,
          description: `${asset.type} asset`,
          tags: asset.tags || [],
          createdAt: asset.created_at,
          relevance,
        });
      });
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}

function calculateRelevance(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match
  if (textLower === queryLower) return 100;

  // Starts with query
  if (textLower.startsWith(queryLower)) return 90;

  // Contains query
  if (textLower.includes(queryLower)) {
    const position = textLower.indexOf(queryLower);
    // Earlier in text = higher relevance
    return Math.max(70 - position / 10, 50);
  }

  // Word match
  const queryWords = queryLower.split(' ');
  const textWords = textLower.split(' ');
  const matches = queryWords.filter(qw => textWords.some(tw => tw.includes(qw))).length;
  return (matches / queryWords.length) * 40;
}

