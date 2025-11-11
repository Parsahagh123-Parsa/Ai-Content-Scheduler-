import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Health Check API
 * 
 * Returns the health status of the application and its dependencies
 */
export async function GET(request: NextRequest) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'unknown',
      openai: 'unknown',
    },
    uptime: process.uptime(),
  };

  try {
    // Check database connection
    const { error: dbError } = await supabase.from('users').select('count').limit(1);
    health.services.database = dbError ? 'unhealthy' : 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
  }

  try {
    // Check OpenAI (if API key is set)
    if (process.env.OPENAI_API_KEY) {
      health.services.openai = 'configured';
    } else {
      health.services.openai = 'not_configured';
    }
  } catch (error) {
    health.services.openai = 'error';
  }

  // Overall status
  if (health.services.database === 'unhealthy') {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}

