import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreatorFeed } from '../../../lib/creator-feed';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const creatorFeed = new CreatorFeed(supabase);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId') || 'user-123';
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    switch (action) {
      case 'feed':
        const feed = await creatorFeed.getFeed(userId, page, limit);
        return NextResponse.json({ feed });

      case 'trending':
        const trending = await creatorFeed.getTrendingCreators(limit);
        return NextResponse.json({ trending });

      case 'challenges':
        const challenges = await creatorFeed.getCommunityChallenges(limit);
        return NextResponse.json({ challenges });

      case 'comments':
        const postId = searchParams.get('postId');
        if (!postId) {
          return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
        }
        const comments = await creatorFeed.getComments(postId, page, limit);
        return NextResponse.json({ comments });

      case 'suggestions':
        const suggestions = await creatorFeed.getCreatorSuggestions(userId, limit);
        return NextResponse.json({ suggestions });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in creator feed API:', error);
    return NextResponse.json(
      { error: 'Failed to process creator feed request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'like':
        const liked = await creatorFeed.likePost(params.postId, params.userId);
        return NextResponse.json({ success: liked });

      case 'repost':
        const reposted = await creatorFeed.repostPost(params.postId, params.userId);
        return NextResponse.json({ success: reposted });

      case 'comment':
        const commented = await creatorFeed.addComment(
          params.postId,
          params.userId,
          params.content,
          params.parentCommentId
        );
        return NextResponse.json({ success: commented });

      case 'follow':
        const followed = await creatorFeed.followCreator(params.creatorId, params.userId);
        return NextResponse.json({ success: followed });

      case 'join_challenge':
        const joined = await creatorFeed.joinChallenge(params.challengeId, params.userId);
        return NextResponse.json({ success: joined });

      case 'submit_challenge':
        const submitted = await creatorFeed.submitToChallenge(
          params.challengeId,
          params.userId,
          params.content,
          params.mediaUrls
        );
        return NextResponse.json({ success: submitted });

      case 'generate_content':
        const content = await creatorFeed.generateAIContent(params.prompt, params.style);
        return NextResponse.json({ content });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in creator feed API:', error);
    return NextResponse.json(
      { error: 'Failed to process creator feed request' },
      { status: 500 }
    );
  }
}
