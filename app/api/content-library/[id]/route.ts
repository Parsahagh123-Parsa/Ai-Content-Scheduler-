import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id;
    const userId = 'demo-user'; // In production, get from auth

    // Get asset to delete file from storage
    const { data: asset } = await supabase
      .from('content_assets')
      .select('url')
      .eq('id', assetId)
      .eq('user_id', userId)
      .single();

    if (asset) {
      // Extract file path from URL
      const urlParts = asset.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${userId}/${fileName}`;

      // Delete from storage
      await supabase.storage
        .from('content-assets')
        .remove([filePath]);
    }

    // Delete from database
    const { error } = await supabase
      .from('content_assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}

