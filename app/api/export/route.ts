import { NextRequest, NextResponse } from 'next/server';
import { exportUserData, exportContentPlanToCSV, exportAnalyticsToCSV } from '@/lib/export-import';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user';
    const type = searchParams.get('type') || 'all'; // 'all', 'content-plan', 'analytics'
    const format = searchParams.get('format') || 'json'; // 'json', 'csv'

    if (type === 'all') {
      // Export all user data
      const jsonData = await exportUserData(userId);
      return new NextResponse(jsonData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="viralflow-export-${Date.now()}.json"`,
        },
      });
    } else if (type === 'content-plan') {
      // Export specific content plan
      const planId = searchParams.get('planId');
      if (!planId) {
        return NextResponse.json({ error: 'planId required' }, { status: 400 });
      }

      // Fetch content plan
      const { supabase } = await import('@/lib/supabase');
      const { data: plan } = await supabase
        .from('content_plans')
        .select('*')
        .eq('id', planId)
        .eq('user_id', userId)
        .single();

      if (!plan) {
        return NextResponse.json({ error: 'Content plan not found' }, { status: 404 });
      }

      if (format === 'csv') {
        const csv = exportContentPlanToCSV(plan);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="content-plan-${planId}.csv"`,
          },
        });
      } else {
        return NextResponse.json(plan, {
          headers: {
            'Content-Disposition': `attachment; filename="content-plan-${planId}.json"`,
          },
        });
      }
    } else if (type === 'analytics') {
      // Export analytics
      const response = await fetch(`${request.nextUrl.origin}/api/analytics?userId=${userId}&range=90d`);
      const analytics = await response.json();

      if (format === 'csv') {
        const csv = exportAnalyticsToCSV(analytics);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="analytics-${Date.now()}.csv"`,
          },
        });
      } else {
        return NextResponse.json(analytics, {
          headers: {
            'Content-Disposition': `attachment; filename="analytics-${Date.now()}.json"`,
          },
        });
      }
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

