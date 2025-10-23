import { NextRequest, NextResponse } from 'next/server';
import { deleteContentPlan } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('id');

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    await deleteContentPlan(planId);

    return NextResponse.json({
      success: true,
      message: 'Content plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting content plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete content plan' },
      { status: 500 }
    );
  }
}
