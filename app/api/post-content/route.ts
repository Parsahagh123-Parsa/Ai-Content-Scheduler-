import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Post {
  id: string;
  platform: string;
  content: string;
  hashtags: string[];
  media?: string[];
  scheduledTime: Date;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  viralScore?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { posts, userId } = body;

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        { error: 'Posts array is required' },
        { status: 400 }
      );
    }

    // Save posts to database
    const postsToSave = posts.map((post: Post) => ({
      user_id: userId || 'demo-user',
      platform: post.platform,
      content: post.content,
      hashtags: post.hashtags,
      media: post.media || [],
      scheduled_time: post.scheduledTime,
      status: post.status,
      viral_score: post.viralScore || null,
      created_at: new Date().toISOString(),
    }));

    const { data: savedPosts, error } = await supabase
      .from('scheduled_posts')
      .insert(postsToSave)
      .select();

    if (error) throw error;

    // Create notifications for scheduled posts
    const notifications = posts.map((post: Post) => ({
      user_id: userId || 'demo-user',
      type: 'post_reminder',
      title: `Post scheduled for ${post.platform}`,
      message: `Your post is scheduled for ${new Date(post.scheduledTime).toLocaleString()}`,
      priority: 'medium',
      data: { postId: post.id, platform: post.platform },
      is_read: false,
    }));

    await supabase.from('notifications').insert(notifications);

    // If posts are scheduled for now or past, trigger posting (in production, use background jobs)
    const nowPosts = posts.filter(
      (post: Post) => new Date(post.scheduledTime) <= new Date()
    );

    if (nowPosts.length > 0) {
      // In production, this would integrate with platform APIs
      // For now, we'll just mark them as posted
      await supabase
        .from('scheduled_posts')
        .update({ status: 'posted' })
        .in('id', nowPosts.map((p: Post) => p.id));
    }

    return NextResponse.json({
      success: true,
      posts: savedPosts,
      message: `${posts.length} post(s) scheduled successfully`,
    });
  } catch (error) {
    console.error('Error posting content:', error);
    return NextResponse.json(
      { error: 'Failed to post content' },
      { status: 500 }
    );
  }
}

