import { NextRequest, NextResponse } from 'next/server';
import { importUserData } from '@/lib/export-import';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, data } = body;

    if (!userId || !data) {
      return NextResponse.json(
        { error: 'userId and data are required' },
        { status: 400 }
      );
    }

    // If data is a string, parse it
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data);

    const result = await importUserData(userId, jsonData);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    );
  }
}

