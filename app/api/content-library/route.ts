import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = 'demo-user'; // In production, get from auth
    const folder = searchParams.get('folder') || 'all';
    const type = searchParams.get('type') || 'all';

    let query = supabase
      .from('content_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (folder !== 'all') {
      query = query.eq('folder', folder);
    }

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    const { data: assets, error } = await query;

    if (error) throw error;

    return NextResponse.json({ assets: assets || [] });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

