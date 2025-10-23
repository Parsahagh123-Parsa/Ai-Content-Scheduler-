import { SupabaseClient } from '@supabase/supabase-js';
import { openai } from './openai';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'feature' | 'bug' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  tags: string[];
  attachments: string[];
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'ai';
  content: string;
  isInternal: boolean;
  createdAt: Date;
  attachments: string[];
}

export interface AIResponse {
  response: string;
  confidence: number;
  suggestedActions: string[];
  relatedTickets: string[];
  escalationNeeded: boolean;
  category: string;
  priority: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  lastUpdated: Date;
  isActive: boolean;
}

export class AISupportChatbot {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async processUserMessage(message: string, userId: string, context?: any): Promise<AIResponse> {
    try {
      // Get user's recent tickets and context
      const userContext = await this.getUserContext(userId);
      
      // Search knowledge base for relevant articles
      const relevantArticles = await this.searchKnowledgeBase(message);
      
      // Generate AI response
      const aiResponse = await this.generateAIResponse(message, userContext, relevantArticles);
      
      // Classify the message
      const classification = await this.classifyMessage(message);
      
      // Check if escalation is needed
      const escalationNeeded = this.shouldEscalate(classification, aiResponse.confidence);
      
      // Get related tickets
      const relatedTickets = await this.findRelatedTickets(message, userId);
      
      return {
        response: aiResponse.response,
        confidence: aiResponse.confidence,
        suggestedActions: aiResponse.suggestedActions,
        relatedTickets,
        escalationNeeded,
        category: classification.category,
        priority: classification.priority
      };
    } catch (error) {
      console.error('Error processing user message:', error);
      return {
        response: "I apologize, but I'm experiencing technical difficulties. Please try again or contact our support team directly.",
        confidence: 0,
        suggestedActions: ['Contact support', 'Try again later'],
        relatedTickets: [],
        escalationNeeded: true,
        category: 'technical',
        priority: 'medium'
      };
    }
  }

  private async generateAIResponse(message: string, userContext: any, relevantArticles: KnowledgeBaseArticle[]): Promise<{
    response: string;
    confidence: number;
    suggestedActions: string[];
  }> {
    try {
      const systemPrompt = `You are an expert AI support chatbot for an AI content creation platform. 
      You help users with technical issues, billing questions, feature requests, and general inquiries.
      
      User Context: ${JSON.stringify(userContext)}
      Relevant Knowledge Base Articles: ${JSON.stringify(relevantArticles)}
      
      Provide helpful, accurate, and friendly responses. If you're not sure about something, 
      suggest contacting human support. Always be specific and actionable.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const content = response.choices?.[0]?.message?.content || '';
      
      // Calculate confidence based on response quality and knowledge base matches
      const confidence = this.calculateConfidence(content, relevantArticles);
      
      // Extract suggested actions from response
      const suggestedActions = this.extractSuggestedActions(content);

      return {
        response: content,
        confidence,
        suggestedActions
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        response: "I'm sorry, I couldn't process your request. Please try rephrasing your question or contact support.",
        confidence: 0.3,
        suggestedActions: ['Rephrase your question', 'Contact support']
      };
    }
  }

  private async classifyMessage(message: string): Promise<{ category: string; priority: string }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Classify this support message into categories and priority levels.
            Categories: technical, billing, feature, bug, general
            Priorities: low, medium, high, urgent
            
            Respond with JSON: {"category": "category", "priority": "priority"}`
          },
          { role: "user", content: message }
        ],
        temperature: 0.3,
        max_tokens: 100,
        response_format: { type: "json_object" }
      });

      const content = response.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error classifying message:', error);
      return { category: 'general', priority: 'medium' };
    }
  }

  private async searchKnowledgeBase(query: string): Promise<KnowledgeBaseArticle[]> {
    try {
      const { data: articles, error } = await this.supabase
        .from('knowledge_base_articles')
        .select('*')
        .eq('is_active', true)
        .textSearch('content', query)
        .limit(5);

      if (error) {
        console.error('Error searching knowledge base:', error);
        return [];
      }

      return (articles || []).map((article: any) => ({
        id: article.id,
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags || [],
        views: article.views || 0,
        helpful: article.helpful || 0,
        lastUpdated: new Date(article.last_updated),
        isActive: article.is_active
      }));
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }

  private async getUserContext(userId: string): Promise<any> {
    try {
      // Get user's recent tickets
      const { data: tickets } = await this.supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get user's subscription info
      const { data: user } = await this.supabase
        .from('users')
        .select('subscription_tier, subscription_status')
        .eq('id', userId)
        .single();

      return {
        recentTickets: tickets || [],
        subscriptionTier: user?.subscription_tier || 'free',
        subscriptionStatus: user?.subscription_status || 'active'
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return {};
    }
  }

  private calculateConfidence(response: string, articles: KnowledgeBaseArticle[]): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence if we have relevant knowledge base articles
    if (articles.length > 0) {
      confidence += 0.3;
    }

    // Increase confidence if response is detailed and specific
    if (response.length > 100) {
      confidence += 0.1;
    }

    // Increase confidence if response contains specific actions or solutions
    if (response.includes('try') || response.includes('check') || response.includes('verify')) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private extractSuggestedActions(response: string): string[] {
    const actions: string[] = [];
    
    // Look for common action patterns
    if (response.includes('check') || response.includes('verify')) {
      actions.push('Check your settings');
    }
    if (response.includes('update') || response.includes('upgrade')) {
      actions.push('Update your account');
    }
    if (response.includes('contact') || response.includes('reach out')) {
      actions.push('Contact support');
    }
    if (response.includes('restart') || response.includes('refresh')) {
      actions.push('Refresh the page');
    }

    return actions.length > 0 ? actions : ['Try the suggested solution'];
  }

  private shouldEscalate(classification: any, confidence: number): boolean {
    // Escalate if confidence is low or priority is high/urgent
    return confidence < 0.6 || 
           classification.priority === 'high' || 
           classification.priority === 'urgent' ||
           classification.category === 'bug';
  }

  private async findRelatedTickets(message: string, userId: string): Promise<string[]> {
    try {
      const { data: tickets } = await this.supabase
        .from('support_tickets')
        .select('id, subject, description')
        .eq('user_id', userId)
        .limit(10);

      if (!tickets) return [];

      // Simple keyword matching for related tickets
      const messageWords = message.toLowerCase().split(' ');
      const relatedTickets = tickets.filter(ticket => {
        const ticketText = `${ticket.subject} ${ticket.description}`.toLowerCase();
        return messageWords.some(word => ticketText.includes(word));
      });

      return relatedTickets.map(ticket => ticket.id);
    } catch (error) {
      console.error('Error finding related tickets:', error);
      return [];
    }
  }

  async createTicket(userId: string, subject: string, description: string, category: string, priority: string): Promise<string> {
    try {
      const ticketId = `ticket_${Date.now()}`;
      
      const { error } = await this.supabase
        .from('support_tickets')
        .insert({
          id: ticketId,
          user_id: userId,
          subject,
          description,
          category,
          priority,
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: [],
          attachments: []
        });

      if (error) {
        console.error('Error creating ticket:', error);
        throw new Error('Failed to create support ticket');
      }

      return ticketId;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  async addMessage(ticketId: string, senderId: string, senderType: 'user' | 'agent' | 'ai', content: string, isInternal: boolean = false): Promise<void> {
    try {
      const messageId = `msg_${Date.now()}`;
      
      const { error } = await this.supabase
        .from('support_messages')
        .insert({
          id: messageId,
          ticket_id: ticketId,
          sender_id: senderId,
          sender_type: senderType,
          content,
          is_internal: isInternal,
          created_at: new Date().toISOString(),
          attachments: []
        });

      if (error) {
        console.error('Error adding message:', error);
        throw new Error('Failed to add message');
      }
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    try {
      const { data: ticket, error } = await this.supabase
        .from('support_tickets')
        .select(`
          *,
          messages:support_messages(*)
        `)
        .eq('id', ticketId)
        .single();

      if (error || !ticket) {
        return null;
      }

      return {
        id: ticket.id,
        userId: ticket.user_id,
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        assignedTo: ticket.assigned_to,
        createdAt: new Date(ticket.created_at),
        updatedAt: new Date(ticket.updated_at),
        resolvedAt: ticket.resolved_at ? new Date(ticket.resolved_at) : undefined,
        tags: ticket.tags || [],
        attachments: ticket.attachments || [],
        messages: (ticket.messages || []).map((msg: any) => ({
          id: msg.id,
          ticketId: msg.ticket_id,
          senderId: msg.sender_id,
          senderType: msg.sender_type,
          content: msg.content,
          isInternal: msg.is_internal,
          createdAt: new Date(msg.created_at),
          attachments: msg.attachments || []
        }))
      };
    } catch (error) {
      console.error('Error getting ticket:', error);
      return null;
    }
  }

  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    try {
      const { data: tickets, error } = await this.supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting user tickets:', error);
        return [];
      }

      return (tickets || []).map((ticket: any) => ({
        id: ticket.id,
        userId: ticket.user_id,
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        assignedTo: ticket.assigned_to,
        createdAt: new Date(ticket.created_at),
        updatedAt: new Date(ticket.updated_at),
        resolvedAt: ticket.resolved_at ? new Date(ticket.resolved_at) : undefined,
        tags: ticket.tags || [],
        attachments: ticket.attachments || [],
        messages: []
      }));
    } catch (error) {
      console.error('Error getting user tickets:', error);
      return [];
    }
  }

  async updateTicketStatus(ticketId: string, status: string, notes?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      if (notes) {
        updateData.notes = notes;
      }

      const { error } = await this.supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) {
        console.error('Error updating ticket status:', error);
        throw new Error('Failed to update ticket status');
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  async getKnowledgeBaseArticles(category?: string, limit: number = 10): Promise<KnowledgeBaseArticle[]> {
    try {
      let query = this.supabase
        .from('knowledge_base_articles')
        .select('*')
        .eq('is_active', true)
        .order('views', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      const { data: articles, error } = await query;

      if (error) {
        console.error('Error getting knowledge base articles:', error);
        return [];
      }

      return (articles || []).map((article: any) => ({
        id: article.id,
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags || [],
        views: article.views || 0,
        helpful: article.helpful || 0,
        lastUpdated: new Date(article.last_updated),
        isActive: article.is_active
      }));
    } catch (error) {
      console.error('Error getting knowledge base articles:', error);
      return [];
    }
  }

  async rateArticleHelpfulness(articleId: string, helpful: boolean): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('knowledge_base_articles')
        .update({
          helpful: helpful ? 1 : 0,
          last_updated: new Date().toISOString()
        })
        .eq('id', articleId);

      if (error) {
        console.error('Error rating article:', error);
        throw new Error('Failed to rate article');
      }
    } catch (error) {
      console.error('Error rating article:', error);
      throw error;
    }
  }
}
