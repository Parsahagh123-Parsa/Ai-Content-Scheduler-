import { supabase } from './supabase';
import { openai } from './openai';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: 'billing' | 'technical' | 'feature_request' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  confidence: number; // AI confidence score 0-1
  aiResponse?: string;
  humanResponse?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  ticketId?: string;
  userId: string;
  content: string;
  isFromAI: boolean;
  confidence?: number;
  suggestedActions?: string[];
  createdAt: string;
}

export interface SupportKnowledge {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  confidence: number;
  lastUpdated: string;
}

// AI Support Chatbot
export class AISupportChatbot {
  private knowledgeBase: SupportKnowledge[] = [];
  private confidenceThreshold = 0.7;

  constructor() {
    this.loadKnowledgeBase();
  }

  async loadKnowledgeBase() {
    try {
      const { data, error } = await supabase
        .from('support_knowledge')
        .select('*')
        .order('confidence', { ascending: false });

      if (error) throw error;
      this.knowledgeBase = data || [];
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    }
  }

  async processMessage(
    userId: string,
    message: string,
    context?: {
      previousMessages?: ChatMessage[];
      userTier?: string;
      recentIssues?: string[];
    }
  ): Promise<{
    response: string;
    confidence: number;
    suggestedActions: string[];
    shouldEscalate: boolean;
    ticketId?: string;
  }> {
    try {
      // Classify the message
      const classification = await this.classifyMessage(message, context);
      
      // Search knowledge base
      const knowledgeMatch = await this.searchKnowledgeBase(message, classification.category);
      
      // Generate response
      const response = await this.generateResponse(
        message,
        classification,
        knowledgeMatch,
        context
      );

      // Determine if escalation is needed
      const shouldEscalate = classification.confidence < this.confidenceThreshold || 
                           classification.priority === 'urgent';

      // Create ticket if needed
      let ticketId: string | undefined;
      if (shouldEscalate || classification.category !== 'general') {
        ticketId = await this.createTicket(userId, message, classification);
      }

      // Store chat message
      await this.storeChatMessage(userId, message, response, classification.confidence, ticketId);

      return {
        response: response.message,
        confidence: classification.confidence,
        suggestedActions: response.suggestedActions,
        shouldEscalate,
        ticketId
      };
    } catch (error) {
      console.error('Error processing support message:', error);
      return {
        response: "I'm sorry, I'm experiencing technical difficulties. Please try again or contact our support team.",
        confidence: 0,
        suggestedActions: ['Contact human support'],
        shouldEscalate: true
      };
    }
  }

  private async classifyMessage(
    message: string,
    context?: any
  ): Promise<{
    category: 'billing' | 'technical' | 'feature_request' | 'general';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    confidence: number;
    tags: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a support ticket classifier. Analyze the user message and classify it into one of these categories:
            - billing: Payment, subscription, refund issues
            - technical: App bugs, performance, integration issues
            - feature_request: New feature requests, improvements
            - general: General questions, how-to, account issues
            
            Also determine priority:
            - urgent: Critical issues affecting core functionality
            - high: Important issues affecting user experience
            - medium: Moderate issues with workarounds
            - low: Minor issues or questions
            
            Return confidence score (0-1) and relevant tags.
            
            Context: ${JSON.stringify(context || {})}`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content || '';
      const parsed = this.parseClassificationResponse(content);
      
      return {
        category: parsed.category || 'general',
        priority: parsed.priority || 'medium',
        confidence: parsed.confidence || 0.5,
        tags: parsed.tags || []
      };
    } catch (error) {
      console.error('Error classifying message:', error);
      return {
        category: 'general',
        priority: 'medium',
        confidence: 0.3,
        tags: []
      };
    }
  }

  private parseClassificationResponse(content: string): any {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing
      const lines = content.split('\n');
      const result: any = {};
      
      lines.forEach(line => {
        if (line.includes('Category:')) {
          result.category = line.split('Category:')[1]?.trim().toLowerCase();
        } else if (line.includes('Priority:')) {
          result.priority = line.split('Priority:')[1]?.trim().toLowerCase();
        } else if (line.includes('Confidence:')) {
          result.confidence = parseFloat(line.split('Confidence:')[1]?.trim() || '0.5');
        } else if (line.includes('Tags:')) {
          result.tags = line.split('Tags:')[1]?.trim().split(',').map(t => t.trim()) || [];
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error parsing classification response:', error);
      return {};
    }
  }

  private async searchKnowledgeBase(
    message: string,
    category: string
  ): Promise<SupportKnowledge | null> {
    try {
      // Filter by category first
      const categoryKnowledge = this.knowledgeBase.filter(k => k.category === category);
      
      if (categoryKnowledge.length === 0) {
        return null;
      }

      // Use OpenAI to find best match
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Find the best matching knowledge base entry for the user's question. Return the title of the best match or "none" if no good match exists.`
          },
          {
            role: "user",
            content: `User question: "${message}"\n\nKnowledge base entries:\n${categoryKnowledge.map(k => `Title: ${k.title}\nContent: ${k.content}`).join('\n\n')}`
          }
        ],
        temperature: 0.1,
        max_tokens: 100,
      });

      const bestMatchTitle = response.choices[0]?.message?.content?.trim();
      if (bestMatchTitle && bestMatchTitle !== 'none') {
        return categoryKnowledge.find(k => k.title === bestMatchTitle) || null;
      }

      return null;
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return null;
    }
  }

  private async generateResponse(
    message: string,
    classification: any,
    knowledgeMatch: SupportKnowledge | null,
    context?: any
  ): Promise<{
    message: string;
    suggestedActions: string[];
  }> {
    try {
      const systemPrompt = `You are a helpful AI support assistant for AI Content Scheduler. 
      
      Context about the user:
      - Tier: ${context?.userTier || 'unknown'}
      - Recent issues: ${context?.recentIssues?.join(', ') || 'none'}
      
      Classification:
      - Category: ${classification.category}
      - Priority: ${classification.priority}
      - Confidence: ${classification.confidence}
      
      ${knowledgeMatch ? `Relevant knowledge base entry: ${knowledgeMatch.content}` : ''}
      
      Provide a helpful, empathetic response. If you don't know something, admit it and suggest contacting human support.
      Keep responses concise but informative.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const aiResponse = response.choices[0]?.message?.content || '';
      const suggestedActions = this.generateSuggestedActions(classification, knowledgeMatch);

      return {
        message: aiResponse,
        suggestedActions
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        message: "I'm sorry, I couldn't process your request. Please contact our support team for assistance.",
        suggestedActions: ['Contact human support']
      };
    }
  }

  private generateSuggestedActions(
    classification: any,
    knowledgeMatch: SupportKnowledge | null
  ): string[] {
    const actions: string[] = [];

    switch (classification.category) {
      case 'billing':
        actions.push('View billing history', 'Update payment method', 'Contact billing support');
        break;
      case 'technical':
        actions.push('Check system status', 'Clear cache and cookies', 'Contact technical support');
        break;
      case 'feature_request':
        actions.push('View feature roadmap', 'Vote on similar requests', 'Contact product team');
        break;
      default:
        actions.push('Browse help center', 'Contact support');
    }

    if (classification.priority === 'urgent') {
      actions.unshift('Escalate to urgent support');
    }

    if (knowledgeMatch) {
      actions.unshift('Read full article');
    }

    return actions;
  }

  private async createTicket(
    userId: string,
    message: string,
    classification: any
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: userId,
          subject: this.generateTicketSubject(message),
          description: message,
          category: classification.category,
          priority: classification.priority,
          status: 'open',
          confidence: classification.confidence,
          tags: classification.tags,
        }])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  private generateTicketSubject(message: string): string {
    // Extract key words for subject
    const words = message.split(' ').slice(0, 8);
    return words.join(' ') + (message.split(' ').length > 8 ? '...' : '');
  }

  private async storeChatMessage(
    userId: string,
    message: string,
    response: { message: string; suggestedActions: string[] },
    confidence: number,
    ticketId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('support_chat_messages')
        .insert([
          {
            user_id: userId,
            content: message,
            is_from_ai: false,
            ticket_id: ticketId,
          },
          {
            user_id: userId,
            content: response.message,
            is_from_ai: true,
            confidence: confidence,
            suggested_actions: response.suggestedActions,
            ticket_id: ticketId,
          }
        ]);
    } catch (error) {
      console.error('Error storing chat messages:', error);
    }
  }

  // Voice-to-Support with Whisper
  async processVoiceMessage(
    userId: string,
    audioBlob: Blob,
    context?: any
  ): Promise<{
    transcript: string;
    response: string;
    confidence: number;
    suggestedActions: string[];
    shouldEscalate: boolean;
    ticketId?: string;
  }> {
    try {
      // Transcribe audio with Whisper
      const transcript = await this.transcribeAudio(audioBlob);
      
      // Process the transcript as a regular message
      const result = await this.processMessage(userId, transcript, context);
      
      return {
        transcript,
        ...result
      };
    } catch (error) {
      console.error('Error processing voice message:', error);
      return {
        transcript: '',
        response: "I couldn't understand your voice message. Please try typing your question.",
        confidence: 0,
        suggestedActions: ['Try typing instead'],
        shouldEscalate: false
      };
    }
  }

  private async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }

  // Smart Issue Classifier
  async classifyTicket(ticketId: string): Promise<void> {
    try {
      const { data: ticket } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (!ticket) return;

      const classification = await this.classifyMessage(ticket.description);
      
      await supabase
        .from('support_tickets')
        .update({
          category: classification.category,
          priority: classification.priority,
          confidence: classification.confidence,
          tags: classification.tags,
        })
        .eq('id', ticketId);

      // Auto-route based on category
      await this.routeTicket(ticketId, classification.category);
    } catch (error) {
      console.error('Error classifying ticket:', error);
    }
  }

  private async routeTicket(ticketId: string, category: string): Promise<void> {
    try {
      // Get available support agents by category
      const { data: agents } = await supabase
        .from('support_agents')
        .select('*')
        .eq('specialties', category)
        .eq('is_available', true)
        .order('current_tickets', { ascending: true })
        .limit(1);

      if (agents && agents.length > 0) {
        // Assign to agent
        await supabase
          .from('support_tickets')
          .update({
            assigned_to: agents[0].id,
            status: 'in_progress',
          })
          .eq('id', ticketId);

        // Update agent's current tickets count
        await supabase
          .from('support_agents')
          .update({
            current_tickets: supabase.raw('current_tickets + 1')
          })
          .eq('id', agents[0].id);
      }
    } catch (error) {
      console.error('Error routing ticket:', error);
    }
  }

  // Get user's support history
  async getUserSupportHistory(userId: string): Promise<{
    tickets: SupportTicket[];
    messages: ChatMessage[];
  }> {
    try {
      const [ticketsResult, messagesResult] = await Promise.all([
        supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('support_chat_messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      return {
        tickets: ticketsResult.data || [],
        messages: messagesResult.data || []
      };
    } catch (error) {
      console.error('Error fetching support history:', error);
      return { tickets: [], messages: [] };
    }
  }

  // Update knowledge base
  async updateKnowledgeBase(
    title: string,
    content: string,
    category: string,
    tags: string[]
  ): Promise<void> {
    try {
      await supabase
        .from('support_knowledge')
        .upsert([{
          title,
          content,
          category,
          tags,
          confidence: 1.0,
          last_updated: new Date().toISOString(),
        }]);

      // Reload knowledge base
      await this.loadKnowledgeBase();
    } catch (error) {
      console.error('Error updating knowledge base:', error);
    }
  }
}

// Export singleton instance
export const aiSupportChatbot = new AISupportChatbot();
