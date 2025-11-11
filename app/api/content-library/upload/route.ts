import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const userId = 'demo-user'; // In production, get from auth

    const uploadedAssets = [];

    for (const file of files) {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const fileBuffer = await file.arrayBuffer();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content-assets')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content-assets')
        .getPublicUrl(fileName);

      // Save to database
      const assetType = file.type.startsWith('image/') ? 'image' :
        file.type.startsWith('video/') ? 'video' : 'document';

      const { data: asset, error: dbError } = await supabase
        .from('content_assets')
        .insert([{
          user_id: userId,
          name: file.name,
          type: assetType,
          url: publicUrl,
          size: file.size,
          tags: [],
          folder: 'all',
          favorite: false,
        }])
        .select()
        .single();

      if (!dbError && asset) {
        uploadedAssets.push(asset);
      }
    }

    return NextResponse.json({
      success: true,
      assets: uploadedAssets,
      message: `${uploadedAssets.length} file(s) uploaded successfully`,
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}

