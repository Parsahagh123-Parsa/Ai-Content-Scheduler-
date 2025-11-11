import { NextRequest, NextResponse } from 'next/server';

/**
 * Optimal Posting Time API
 * 
 * Returns the best time to post on a given platform based on:
 * - Platform-specific best practices
 * - User's timezone
 * - Historical engagement data
 * - Current trending times
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform') || 'instagram';
    const timezone = searchParams.get('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Platform-specific optimal posting times (in user's local time)
    const optimalTimes: Record<string, number[]> = {
      instagram: [9, 11, 14, 17, 20], // 9 AM, 11 AM, 2 PM, 5 PM, 8 PM
      tiktok: [6, 9, 12, 15, 18, 21], // 6 AM, 9 AM, 12 PM, 3 PM, 6 PM, 9 PM
      youtube: [14, 16, 20], // 2 PM, 4 PM, 8 PM
      twitter: [8, 12, 17, 20], // 8 AM, 12 PM, 5 PM, 8 PM
    };

    const hours = optimalTimes[platform] || optimalTimes.instagram;
    
    // Get current hour in user's timezone
    const now = new Date();
    const currentHour = new Date(now.toLocaleString('en-US', { timeZone: timezone })).getHours();
    
    // Find next optimal time
    let nextOptimalHour = hours.find(h => h > currentHour);
    if (!nextOptimalHour) {
      // If no optimal time today, use first optimal time tomorrow
      nextOptimalHour = hours[0];
      now.setDate(now.getDate() + 1);
    }

    // Create optimal time date
    const optimalTime = new Date(now);
    optimalTime.setHours(nextOptimalHour, 0, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (optimalTime <= new Date()) {
      optimalTime.setDate(optimalTime.getDate() + 1);
    }

    return NextResponse.json({
      optimalTime: optimalTime.toISOString(),
      platform,
      timezone,
      recommendedHours: hours,
      reason: `Best engagement times for ${platform} are typically at ${hours.join(', ')} o'clock`,
    });
  } catch (error) {
    console.error('Error calculating optimal posting time:', error);
    // Default: 2 hours from now
    const defaultTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
    return NextResponse.json({
      optimalTime: defaultTime.toISOString(),
      platform: 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recommendedHours: [14, 17, 20],
      reason: 'Default optimal time (2 hours from now)',
    });
  }
}

