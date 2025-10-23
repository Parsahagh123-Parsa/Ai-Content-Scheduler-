import { NextRequest, NextResponse } from 'next/server';
import { governanceService } from '@/lib/governance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const roadmapItems = await governanceService.getRoadmapItems(status || undefined, category || undefined, limit, offset);

    return NextResponse.json({
      success: true,
      data: roadmapItems,
    });
  } catch (error) {
    console.error('Error fetching roadmap items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmap items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, priority, estimatedEffort, targetRelease, createdBy } = body;

    if (!title || !createdBy) {
      return NextResponse.json(
        { error: 'Title and createdBy are required' },
        { status: 400 }
      );
    }

    // Create roadmap item
    const roadmapItem = {
      id: `roadmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: description || '',
      status: 'planned',
      priority: priority || 'medium',
      category: category || 'feature',
      votes: 0,
      comments: 0,
      estimatedEffort: estimatedEffort || 'medium',
      targetRelease,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
      tags: [],
    };

    // Store in database
    const { data, error } = await supabase
      .from('roadmap_items')
      .insert([roadmapItem])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error creating roadmap item:', error);
    return NextResponse.json(
      { error: 'Failed to create roadmap item' },
      { status: 500 }
    );
  }
}
