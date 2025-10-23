import { NextRequest, NextResponse } from 'next/server';
import { analyzeViralPotential } from '../../../lib/enhanced-content-generator';

export async function POST(request: NextRequest) {
  try {
    const { caption, hashtags } = await request.json();

    if (!caption) {
      return NextResponse.json(
        { error: 'Caption is required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeViralPotential(caption, hashtags || []);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing viral potential:', error);
    return NextResponse.json(
      { error: 'Failed to analyze viral potential' },
      { status: 500 }
    );
  }
}
