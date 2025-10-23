import { NextRequest, NextResponse } from 'next/server';
import { saveContentPlan } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      creatorType, 
      platform, 
      contentGoal, 
      targetAudience, 
      contentPlan, 
      trendingTopics 
    } = body;

    if (!userId || !creatorType || !platform || !contentPlan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const savedPlan = await saveContentPlan({
      user_id: userId,
      creator_type: creatorType,
      platform,
      content_goal: contentGoal,
      target_audience: targetAudience,
      content_plan: contentPlan,
      trending_topics: trendingTopics,
    });

    return NextResponse.json({
      success: true,
      data: savedPlan,
    });
  } catch (error) {
    console.error('Error saving content plan:', error);
    return NextResponse.json(
      { error: 'Failed to save content plan' },
      { status: 500 }
    );
  }
}
