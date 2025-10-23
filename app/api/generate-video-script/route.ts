import { NextRequest, NextResponse } from 'next/server';
import { generateVideoScript } from '../../../lib/enhanced-content-generator';

export async function POST(request: NextRequest) {
  try {
    const { caption, platform } = await request.json();

    if (!caption) {
      return NextResponse.json(
        { error: 'Caption is required' },
        { status: 400 }
      );
    }

    const script = await generateVideoScript(caption, platform || 'TikTok');

    return NextResponse.json({ script });
  } catch (error) {
    console.error('Error generating video script:', error);
    return NextResponse.json(
      { error: 'Failed to generate video script' },
      { status: 500 }
    );
  }
}
