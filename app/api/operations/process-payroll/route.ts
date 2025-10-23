import { NextRequest, NextResponse } from 'next/server';
import { aiOperationsService } from '@/lib/ai-operations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period } = body;

    if (!period) {
      return NextResponse.json(
        { error: 'Period is required' },
        { status: 400 }
      );
    }

    const payrollRecords = await aiOperationsService.processPayroll(period);

    return NextResponse.json({
      success: true,
      data: payrollRecords,
    });
  } catch (error) {
    console.error('Error processing payroll:', error);
    return NextResponse.json(
      { error: 'Failed to process payroll' },
      { status: 500 }
    );
  }
}
