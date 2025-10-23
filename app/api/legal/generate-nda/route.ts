import { NextRequest, NextResponse } from 'next/server';
import { aiLegalAssistant } from '@/lib/ai-legal-assistant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parties, purpose, duration, customizations } = body;

    if (!parties || !Array.isArray(parties) || parties.length < 2) {
      return NextResponse.json(
        { error: 'At least two parties are required' },
        { status: 400 }
      );
    }

    if (!purpose) {
      return NextResponse.json(
        { error: 'Purpose is required' },
        { status: 400 }
      );
    }

    const nda = await aiLegalAssistant.generateNDA(
      parties,
      purpose,
      duration || 24,
      customizations || {}
    );

    return NextResponse.json({
      success: true,
      data: nda,
    });
  } catch (error) {
    console.error('Error generating NDA:', error);
    return NextResponse.json(
      { error: 'Failed to generate NDA' },
      { status: 500 }
    );
  }
}
