import { SupabaseClient } from '@supabase/supabase-js';
import { openai } from './openai';

export interface CreatorPost {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorTier: 'free' | 'pro' | 'elite';
  content: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'audio' | 'text';
  platform: string;
  hashtags: string[];
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  engagement: number;
  viralityScore: number;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
}

export interface CreatorComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
  parentCommentId?: string;
  replies: CreatorComment[];
}

export interface CreatorProfile {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  bio: string;
  tier: 'free' | 'pro' | 'elite';
  followers: number;
  following: number;
  posts: number;
  totalLikes: number;
  totalViews: number;
  engagementRate: number;
  verified: boolean;
  badges: string[];
  categories: string[];
  isFollowing: boolean;
  lastActive: Date;
}

export interface TrendingCreator {
  id: string;
  profile: CreatorProfile;
  trendingScore: number;
  growthRate: number;
  viralPosts: number;
  reason: string;
  category: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: Date;
  endDate: Date;
  rules: string[];
  rewards: string[];
  participants: number;
  submissions: number;
  isActive: boolean;
  isParticipating: boolean;
  progress: number;
  leaderboard: Array<{
    rank: number;
    creatorId: string;
    creatorName: string;
    score: number;
  }>;
}

export class CreatorFeed {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getFeed(userId: string, page: number = 0, limit: number = 20): Promise<CreatorPost[]> {
    try {
      // Get following list
      const { data: following } = await this.supabase
        .from('creator_follows')
        .select('following_id')
        .eq('follower_id', userId);

      const followingIds = following?.map(f => f.following_id) || [];
      followingIds.push(userId); // Include own posts

      // Get posts from followed creators
      const { data: posts, error } = await this.supabase
        .from('creator_posts')
        .select(`
          *,
          creator:creator_profiles!creator_id(*),
          likes:post_likes(*),
          comments:post_comments(*),
          reposts:post_reposts(*)
        `)
        .in('creator_id', followingIds)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) {
        console.error('Error fetching feed:', error);
        return [];
      }

      return (posts || []).map((post: any) => ({
        id: post.id,
        creatorId: post.creator_id,
        creatorName: post.creator?.display_name || 'Unknown',
        creatorAvatar: post.creator?.avatar_url || '',
        creatorTier: post.creator?.tier || 'free',
        content: post.content,
        mediaUrls: post.media_urls || [],
        mediaType: post.media_type,
        platform: post.platform,
        hashtags: post.hashtags || [],
        likes: post.likes?.length || 0,
        comments: post.comments?.length || 0,
        reposts: post.reposts?.length || 0,
        views: post.views || 0,
        engagement: post.engagement_rate || 0,
        viralityScore: post.virality_score || 0,
        aiGenerated: post.ai_generated || false,
        createdAt: new Date(post.created_at),
        updatedAt: new Date(post.updated_at),
        isLiked: post.likes?.some((l: any) => l.user_id === userId) || false,
        isReposted: post.reposts?.some((r: any) => r.user_id === userId) || false,
        isBookmarked: false // TODO: Implement bookmarks
      }));
    } catch (error) {
      console.error('Error getting creator feed:', error);
      return [];
    }
  }

  async getTrendingCreators(limit: number = 10): Promise<TrendingCreator[]> {
    try {
      const { data: creators, error } = await this.supabase
        .from('creator_profiles')
        .select(`
          *,
          posts:creator_posts(*),
          follows:creator_follows!following_id(*)
        `)
        .eq('is_active', true)
        .order('trending_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching trending creators:', error);
        return [];
      }

      return (creators || []).map((creator: any) => ({
        id: creator.id,
        profile: {
          id: creator.id,
          displayName: creator.display_name,
          username: creator.username,
          avatar: creator.avatar_url,
          bio: creator.bio,
          tier: creator.tier,
          followers: creator.followers_count || 0,
          following: creator.following_count || 0,
          posts: creator.posts?.length || 0,
          totalLikes: creator.total_likes || 0,
          totalViews: creator.total_views || 0,
          engagementRate: creator.engagement_rate || 0,
          verified: creator.verified || false,
          badges: creator.badges || [],
          categories: creator.categories || [],
          isFollowing: false, // TODO: Check if current user is following
          lastActive: new Date(creator.last_active)
        },
        trendingScore: creator.trending_score || 0,
        growthRate: creator.growth_rate || 0,
        viralPosts: creator.viral_posts || 0,
        reason: creator.trending_reason || 'High engagement',
        category: creator.primary_category || 'General'
      }));
    } catch (error) {
      console.error('Error getting trending creators:', error);
      return [];
    }
  }

  async getCommunityChallenges(limit: number = 5): Promise<CommunityChallenge[]> {
    try {
      const { data: challenges, error } = await this.supabase
        .from('community_challenges')
        .select(`
          *,
          participants:challenge_participants(*),
          submissions:challenge_submissions(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching community challenges:', error);
        return [];
      }

      return (challenges || []).map((challenge: any) => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        startDate: new Date(challenge.start_date),
        endDate: new Date(challenge.end_date),
        rules: challenge.rules || [],
        rewards: challenge.rewards || [],
        participants: challenge.participants?.length || 0,
        submissions: challenge.submissions?.length || 0,
        isActive: challenge.is_active,
        isParticipating: challenge.participants?.some((p: any) => p.user_id === 'current-user') || false,
        progress: challenge.progress || 0,
        leaderboard: challenge.leaderboard || []
      }));
    } catch (error) {
      console.error('Error getting community challenges:', error);
      return [];
    }
  }

  async likePost(postId: string, userId: string): Promise<boolean> {
    try {
      // Check if already liked
      const { data: existingLike } = await this.supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await this.supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
        
        return !error;
      } else {
        // Like
        const { error } = await this.supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: userId
          });
        
        return !error;
      }
    } catch (error) {
      console.error('Error liking post:', error);
      return false;
    }
  }

  async repostPost(postId: string, userId: string): Promise<boolean> {
    try {
      // Check if already reposted
      const { data: existingRepost } = await this.supabase
        .from('post_reposts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingRepost) {
        // Unrepost
        const { error } = await this.supabase
          .from('post_reposts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
        
        return !error;
      } else {
        // Repost
        const { error } = await this.supabase
          .from('post_reposts')
          .insert({
            post_id: postId,
            user_id: userId
          });
        
        return !error;
      }
    } catch (error) {
      console.error('Error reposting:', error);
      return false;
    }
  }

  async addComment(postId: string, userId: string, content: string, parentCommentId?: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content,
          parent_comment_id: parentCommentId
        });

      return !error;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  }

  async getComments(postId: string, page: number = 0, limit: number = 20): Promise<CreatorComment[]> {
    try {
      const { data: comments, error } = await this.supabase
        .from('post_comments')
        .select(`
          *,
          user:creator_profiles!user_id(*),
          likes:comment_likes(*)
        `)
        .eq('post_id', postId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }

      return (comments || []).map((comment: any) => ({
        id: comment.id,
        postId: comment.post_id,
        userId: comment.user_id,
        userName: comment.user?.display_name || 'Unknown',
        userAvatar: comment.user?.avatar_url || '',
        content: comment.content,
        likes: comment.likes?.length || 0,
        isLiked: comment.likes?.some((l: any) => l.user_id === 'current-user') || false,
        createdAt: new Date(comment.created_at),
        parentCommentId: comment.parent_comment_id,
        replies: [] // TODO: Load replies
      }));
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  async followCreator(creatorId: string, userId: string): Promise<boolean> {
    try {
      // Check if already following
      const { data: existingFollow } = await this.supabase
        .from('creator_follows')
        .select('id')
        .eq('follower_id', userId)
        .eq('following_id', creatorId)
        .single();

      if (existingFollow) {
        // Unfollow
        const { error } = await this.supabase
          .from('creator_follows')
          .delete()
          .eq('follower_id', userId)
          .eq('following_id', creatorId);
        
        return !error;
      } else {
        // Follow
        const { error } = await this.supabase
          .from('creator_follows')
          .insert({
            follower_id: userId,
            following_id: creatorId
          });
        
        return !error;
      }
    } catch (error) {
      console.error('Error following creator:', error);
      return false;
    }
  }

  async joinChallenge(challengeId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: userId,
          joined_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('Error joining challenge:', error);
      return false;
    }
  }

  async submitToChallenge(challengeId: string, userId: string, content: string, mediaUrls: string[]): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('challenge_submissions')
        .insert({
          challenge_id: challengeId,
          user_id: userId,
          content,
          media_urls: mediaUrls,
          submitted_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('Error submitting to challenge:', error);
      return false;
    }
  }

  async generateAIContent(prompt: string, style: string = 'engaging'): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert social media content creator. Generate engaging, viral-worthy content that resonates with creators and their audiences. Style: ${style}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      });

      return response.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating AI content:', error);
      return 'Failed to generate content. Please try again.';
    }
  }

  async getCreatorSuggestions(userId: string, limit: number = 5): Promise<CreatorProfile[]> {
    try {
      // Get user's interests and following patterns
      const { data: userProfile } = await this.supabase
        .from('creator_profiles')
        .select('categories, following_count')
        .eq('id', userId)
        .single();

      if (!userProfile) return [];

      // Find creators with similar interests
      const { data: suggestions, error } = await this.supabase
        .from('creator_profiles')
        .select('*')
        .neq('id', userId)
        .overlaps('categories', userProfile.categories || [])
        .order('followers_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting creator suggestions:', error);
        return [];
      }

      return (suggestions || []).map((creator: any) => ({
        id: creator.id,
        displayName: creator.display_name,
        username: creator.username,
        avatar: creator.avatar_url,
        bio: creator.bio,
        tier: creator.tier,
        followers: creator.followers_count || 0,
        following: creator.following_count || 0,
        posts: creator.posts_count || 0,
        totalLikes: creator.total_likes || 0,
        totalViews: creator.total_views || 0,
        engagementRate: creator.engagement_rate || 0,
        verified: creator.verified || false,
        badges: creator.badges || [],
        categories: creator.categories || [],
        isFollowing: false,
        lastActive: new Date(creator.last_active)
      }));
    } catch (error) {
      console.error('Error getting creator suggestions:', error);
      return [];
    }
  }
}