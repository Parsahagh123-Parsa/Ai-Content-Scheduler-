import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AISupportChatbot } from '../../../lib/ai-support-chatbot';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const aiSupport = new AISupportChatbot(supabase);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'chat':
        const response = await aiSupport.processUserMessage(
          params.message,
          params.userId || 'user-123',
          params.context
        );
        return NextResponse.json({ response });

      case 'create_ticket':
        const ticketId = await aiSupport.createTicket(
          params.userId || 'user-123',
          params.subject,
          params.description,
          params.category,
          params.priority
        );
        return NextResponse.json({ ticketId });

      case 'add_message':
        await aiSupport.addMessage(
          params.ticketId,
          params.senderId,
          params.senderType,
          params.content,
          params.isInternal
        );
        return NextResponse.json({ success: true });

      case 'update_ticket_status':
        await aiSupport.updateTicketStatus(
          params.ticketId,
          params.status,
          params.notes
        );
        return NextResponse.json({ success: true });

      case 'rate_article':
        await aiSupport.rateArticleHelpfulness(
          params.articleId,
          params.helpful
        );
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in AI support API:', error);
    return NextResponse.json(
      { error: 'Failed to process AI support request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId') || 'user-123';
    const ticketId = searchParams.get('ticketId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');

    switch (action) {
      case 'get_ticket':
        if (!ticketId) {
          return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
        }
        const ticket = await aiSupport.getTicket(ticketId);
        return NextResponse.json({ ticket });

      case 'get_user_tickets':
        const tickets = await aiSupport.getUserTickets(userId);
        return NextResponse.json({ tickets });

      case 'get_knowledge_base':
        const articles = await aiSupport.getKnowledgeBaseArticles(category || undefined, limit);
        return NextResponse.json({ articles });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in AI support API:', error);
    return NextResponse.json(
      { error: 'Failed to process AI support request' },
      { status: 500 }
    );
  }
}
