import { NextRequest, NextResponse } from 'next/server';
import { getUserContentPlans } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const plans = await getUserContentPlans(userId);

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Error fetching user plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content plans' },
      { status: 500 }
    );
  }
}
