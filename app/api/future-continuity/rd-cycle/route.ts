import { NextRequest, NextResponse } from 'next/server';
import { futureContinuityService } from '@/lib/future-continuity';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quarter } = body;

    if (!quarter) {
      return NextResponse.json(
        { error: 'Quarter is required' },
        { status: 400 }
      );
    }

    const rdCycle = await futureContinuityService.initiateRDCycle(quarter);

    return NextResponse.json({
      success: true,
      data: rdCycle,
    });
  } catch (error) {
    console.error('Error initiating R&D cycle:', error);
    return NextResponse.json(
      { error: 'Failed to initiate R&D cycle' },
      { status: 500 }
    );
  }
}
