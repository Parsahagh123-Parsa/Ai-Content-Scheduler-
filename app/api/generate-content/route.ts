import { NextRequest, NextResponse } from 'next/server';
import { generateEnhancedContentPlan } from '@/lib/content-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      creatorType, 
      platform, 
      contentGoal, 
      targetAudience, 
      tone, 
      keyword 
    } = body;

    if (!creatorType || !platform) {
      return NextResponse.json(
        { error: 'Creator type and platform are required' },
        { status: 400 }
      );
    }

    // Generate enhanced content plan
    const result = await generateEnhancedContentPlan({
      creatorType,
      platform,
      contentGoal,
      targetAudience,
      tone: tone || 'engaging',
      keyword,
    });

    return NextResponse.json({
      success: true,
      data: {
        contentPlan: result.contentPlan,
        trendingTopics: result.trendingTopics,
        analytics: result.analytics,
        metadata: {
          creatorType,
          platform,
          tone: tone || 'engaging',
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Error in generate-content API:', error);
    return NextResponse.json(
      { error: 'Failed to generate content plan' },
      { status: 500 }
    );
  }
}
