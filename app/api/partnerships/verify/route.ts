import { NextRequest, NextResponse } from 'next/server';
import { aiPartnershipNetworkService } from '@/lib/ai-partnership-network';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, manifest } = body;

    if (!partnerId || !manifest) {
      return NextResponse.json(
        { error: 'Partner ID and manifest are required' },
        { status: 400 }
      );
    }

    const success = await aiPartnershipNetworkService.verifyPartner(partnerId, manifest);

    if (!success) {
      return NextResponse.json(
        { error: 'Partner verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Partner verified successfully',
    });
  } catch (error) {
    console.error('Error verifying partner:', error);
    return NextResponse.json(
      { error: 'Failed to verify partner' },
      { status: 500 }
    );
  }
}
