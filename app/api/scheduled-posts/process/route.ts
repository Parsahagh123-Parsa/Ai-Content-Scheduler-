import { NextRequest, NextResponse } from 'next/server';
import { processScheduledPosts } from '@/lib/posting-scheduler';

/**
 * Process Scheduled Posts API
 * 
 * This endpoint should be called by a cron job or background worker
 * to process posts that are due to be posted.
 * 
 * In production, set up a cron job to call this endpoint every minute:
 * - Vercel Cron Jobs
 * - GitHub Actions
 * - External cron service
 */
export async function POST(request: NextRequest) {
  try {
    // In production, add authentication/authorization here
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const result = await processScheduledPosts();

    return NextResponse.json({
      success: true,
      ...result,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled posts' },
      { status: 500 }
    );
  }
}

// Also allow GET for testing
export async function GET(request: NextRequest) {
  try {
    const result = await processScheduledPosts();

    return NextResponse.json({
      success: true,
      ...result,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled posts' },
      { status: 500 }
    );
  }
}

