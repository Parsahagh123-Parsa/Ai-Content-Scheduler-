'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  TicketIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  RobotIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

interface SupportTicket {
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

interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'ai';
  content: string;
  isInternal: boolean;
  createdAt: Date;
  attachments: string[];
}

interface AIResponse {
  response: string;
  confidence: number;
  suggestedActions: string[];
  relatedTickets: string[];
  escalationNeeded: boolean;
  category: string;
  priority: string;
}

interface KnowledgeBaseArticle {
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

const AISupportChatbot: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'knowledge'>('chat');
  const [messages, setMessages] = useState<Array<SupportMessage & { isAI?: boolean }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const newTicketForm = {
    subject: '',
    description: '',
    category: 'general' as const,
    priority: 'medium' as const
  };

  const [ticketForm, setTicketForm] = useState(newTicketForm);

  useEffect(() => {
    loadTickets();
    loadKnowledgeBase();
    // Add welcome message
    setMessages([{
      id: 'welcome',
      ticketId: '',
      senderId: 'ai',
      senderType: 'ai',
      content: "Hi! I'm your AI support assistant. How can I help you today?",
      isInternal: false,
      createdAt: new Date(),
      attachments: [],
      isAI: true
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTickets = async () => {
    try {
      const response = await fetch('/api/ai-support?action=get_user_tickets&userId=user-123');
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      const response = await fetch('/api/ai-support?action=get_knowledge_base&limit=20');
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: SupportMessage & { isAI?: boolean } = {
      id: `msg_${Date.now()}`,
      ticketId: '',
      senderId: 'user-123',
      senderType: 'user',
      content: inputMessage,
      isInternal: false,
      createdAt: new Date(),
      attachments: [],
      isAI: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          message: inputMessage,
          userId: 'user-123'
        })
      });

      const data = await response.json();
      
      if (data.response) {
        const aiMessage: SupportMessage & { isAI?: boolean } = {
          id: `ai_${Date.now()}`,
          ticketId: '',
          senderId: 'ai',
          senderType: 'ai',
          content: data.response.response,
          isInternal: false,
          createdAt: new Date(),
          attachments: [],
          isAI: true
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: SupportMessage & { isAI?: boolean } = {
        id: `error_${Date.now()}`,
        ticketId: '',
        senderId: 'ai',
        senderType: 'ai',
        content: "I'm sorry, I encountered an error. Please try again or contact support directly.",
        isInternal: false,
        createdAt: new Date(),
        attachments: [],
        isAI: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const createTicket = async () => {
    try {
      const response = await fetch('/api/ai-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_ticket',
          userId: 'user-123',
          ...ticketForm
        })
      });

      const data = await response.json();
      if (data.ticketId) {
        setShowNewTicket(false);
        setTicketForm(newTicketForm);
        loadTickets();
        setActiveTab('tickets');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-400 bg-blue-400/20';
      case 'in_progress': return 'text-yellow-400 bg-yellow-400/20';
      case 'resolved': return 'text-green-400 bg-green-400/20';
      case 'closed': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-8 rounded-2xl shadow-xl text-white max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">🤖 AI Support Assistant</h2>
          <p className="text-gray-200">Get instant help with AI-powered support</p>
        </div>
        <motion.button
          onClick={() => setShowNewTicket(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Ticket</span>
        </motion.button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-8 bg-white/10 rounded-xl p-2">
        {[
          { id: 'chat', label: 'AI Chat', icon: '💬' },
          { id: 'tickets', label: 'My Tickets', icon: '🎫' },
          { id: 'knowledge', label: 'Knowledge Base', icon: '📚' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'text-gray-300 hover:bg-white/20'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-96 flex flex-col"
          >
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-white/5 rounded-xl">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.senderType === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-white/10 text-gray-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      {message.senderType === 'ai' ? (
                        <RobotIcon className="h-4 w-4" />
                      ) : (
                        <UserIcon className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-75">
                        {message.senderType === 'ai' ? 'AI Assistant' : 'You'}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {formatTimeAgo(message.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-gray-200 px-4 py-2 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <RobotIcon className="h-4 w-4" />
                      <span className="text-sm">AI is typing...</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
              />
              <motion.button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-lg disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {activeTab === 'tickets' && (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <TicketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Support Tickets</h3>
                <p className="text-gray-400 mb-6">Create a ticket to get help with any issues</p>
                <motion.button
                  onClick={() => setShowNewTicket(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Create First Ticket
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6 rounded-xl border border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{ticket.subject}</h3>
                        <p className="text-gray-300 text-sm mb-2 line-clamp-2">{ticket.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span className="capitalize">{ticket.category}</span>
                        <span>{ticket.messages.length} messages</span>
                      </div>
                      <span>{formatTimeAgo(ticket.createdAt)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'knowledge' && (
          <motion.div
            key="knowledge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search knowledge base..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
              />
            </div>

            {/* Articles */}
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-6 rounded-xl border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">{article.title}</h3>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-3">{article.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="capitalize">{article.category}</span>
                        <span>{article.views} views</span>
                        <span>{article.helpful} helpful</span>
                        <span>Updated {formatTimeAgo(article.lastUpdated)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 rounded-full text-xs bg-white/10 text-gray-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewTicket(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Create Support Ticket</h3>
                <motion.button
                  onClick={() => setShowNewTicket(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 h-32 resize-none"
                    placeholder="Detailed description of your issue or question"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Category</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Priority</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <motion.button
                    onClick={() => setShowNewTicket(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    onClick={createTicket}
                    disabled={!ticketForm.subject || !ticketForm.description}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50"
                  >
                    Create Ticket
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AISupportChatbot;
