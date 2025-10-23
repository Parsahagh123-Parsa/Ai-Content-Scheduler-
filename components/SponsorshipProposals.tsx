'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  EyeIcon, 
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface SponsorshipProposal {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  brandId: string;
  campaign: {
    objective: string;
    targetAudience: string[];
    platforms: string[];
    contentTypes: string[];
    messaging: string;
    brandGuidelines: string[];
    exclusivity: boolean;
    duration: number;
    launchDate: string;
    endDate: string;
  };
  deliverables: Array<{
    id: string;
    type: string;
    platform: string;
    description: string;
    quantity: number;
    specifications: string[];
    deadline: string;
    price: number;
    requirements: string[];
  }>;
  timeline: {
    proposal: string;
    review: string;
    approval: string;
    contentCreation: string;
    review: string;
    publish: string;
    reporting: string;
  };
  budget: {
    total: number;
    currency: string;
    breakdown: {
      content: number;
      performance: number;
      exclusivity: number;
      rush: number;
    };
    paymentSchedule: Array<{
      milestone: string;
      amount: number;
      percentage: number;
      dueDate: string;
      conditions: string[];
    }>;
    bonuses: Array<{
      metric: string;
      target: number;
      bonus: number;
      description: string;
    }>;
  };
  metrics: {
    reach: number;
    impressions: number;
    engagement: number;
    clicks: number;
    conversions: number;
    cpm: number;
    cpc: number;
    cpa: number;
    roi: number;
  };
  terms: {
    contentOwnership: string;
    usageRights: string;
    exclusivity: boolean;
    termination: string;
    forceMajeure: string;
    confidentiality: string;
    liability: string;
    disputeResolution: string;
  };
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'negotiating';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  aiGenerated: boolean;
  confidence: number;
}

interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables: string[];
  isDefault: boolean;
  createdBy: string;
}

const SponsorshipProposals: React.FC = () => {
  const [proposals, setProposals] = useState<SponsorshipProposal[]>([]);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'proposals' | 'templates' | 'create'>('proposals');
  const [selectedProposal, setSelectedProposal] = useState<SponsorshipProposal | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state for creating new proposals
  const [formData, setFormData] = useState({
    creatorId: '',
    brandId: '',
    campaignObjective: '',
    targetAudience: [] as string[],
    platforms: [] as string[],
    budget: 0,
    timeline: 30,
    contentTypes: [] as string[],
    exclusivity: false
  });

  useEffect(() => {
    loadProposals();
    loadTemplates();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sponsorship-proposals?action=get_user_proposals&userId=user-123&userType=creator');
      const data = await response.json();
      setProposals(data.proposals || []);
    } catch (error) {
      console.error('Error loading proposals:', error);
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/sponsorship-proposals?action=get_templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const generateProposal = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sponsorship-proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          creatorId: formData.creatorId || 'creator-123',
          brandId: formData.brandId || 'brand-456',
          requirements: {
            campaignObjective: formData.campaignObjective,
            targetAudience: formData.targetAudience,
            platforms: formData.platforms,
            budget: formData.budget,
            timeline: formData.timeline,
            contentTypes: formData.contentTypes,
            exclusivity: formData.exclusivity
          }
        })
      });

      const data = await response.json();
      if (data.proposal) {
        setProposals(prev => [data.proposal, ...prev]);
        setShowCreateForm(false);
        setActiveTab('proposals');
      }
    } catch (error) {
      console.error('Error generating proposal:', error);
      setError('Failed to generate proposal');
    } finally {
      setLoading(false);
    }
  };

  const submitProposal = async (proposalId: string) => {
    try {
      const response = await fetch('/api/sponsorship-proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          proposalId
        })
      });

      if (response.ok) {
        setProposals(prev => prev.map(p => 
          p.id === proposalId ? { ...p, status: 'submitted' } : p
        ));
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
    }
  };

  const updateProposalStatus = async (proposalId: string, status: string) => {
    try {
      const response = await fetch('/api/sponsorship-proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          proposalId,
          status
        })
      });

      if (response.ok) {
        setProposals(prev => prev.map(p => 
          p.id === proposalId ? { ...p, status } : p
        ));
      }
    } catch (error) {
      console.error('Error updating proposal status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-yellow-400 bg-yellow-400/20';
      case 'submitted': return 'text-blue-400 bg-blue-400/20';
      case 'under_review': return 'text-purple-400 bg-purple-400/20';
      case 'accepted': return 'text-green-400 bg-green-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/20';
      case 'negotiating': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <PencilIcon className="h-4 w-4" />;
      case 'submitted': return <ClockIcon className="h-4 w-4" />;
      case 'under_review': return <EyeIcon className="h-4 w-4" />;
      case 'accepted': return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected': return <XCircleIcon className="h-4 w-4" />;
      case 'negotiating': return <DocumentTextIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-8 rounded-2xl shadow-xl text-white max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">🤝 Sponsorship Proposals</h2>
          <p className="text-gray-200">AI-powered proposal generation and management</p>
        </div>
        <motion.button
          onClick={() => setShowCreateForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Proposal</span>
        </motion.button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-8 bg-white/10 rounded-xl p-2">
        {[
          { id: 'proposals', label: 'Proposals', icon: '📋' },
          { id: 'templates', label: 'Templates', icon: '📄' },
          { id: 'create', label: 'Create', icon: '✨' }
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
        {activeTab === 'proposals' && (
          <motion.div
            key="proposals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Proposals Yet</h3>
                <p className="text-gray-400 mb-6">Create your first AI-powered sponsorship proposal</p>
                <motion.button
                  onClick={() => setShowCreateForm(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Create Proposal
                </motion.button>
              </div>
            ) : (
              <div className="grid gap-6">
                {proposals.map((proposal) => (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6 rounded-xl border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{proposal.title}</h3>
                        <p className="text-gray-300 mb-4">{proposal.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(proposal.status)}`}>
                            {getStatusIcon(proposal.status)}
                            <span className="text-sm font-medium capitalize">{proposal.status.replace('_', ' ')}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-gray-400">
                            <CurrencyDollarIcon className="h-4 w-4" />
                            <span className="text-sm">{formatCurrency(proposal.budget.total, proposal.budget.currency)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-gray-400">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="text-sm">{proposal.campaign.duration} days</span>
                          </div>
                          
                          {proposal.aiGenerated && (
                            <div className="flex items-center space-x-2 text-purple-400">
                              <span className="text-sm">AI Generated ({proposal.confidence}% confidence)</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => setSelectedProposal(proposal)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </motion.button>
                        
                        {proposal.status === 'draft' && (
                          <motion.button
                            onClick={() => submitProposal(proposal.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Submit
                          </motion.button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Platforms:</span>
                        <p className="text-white">{proposal.campaign.platforms.join(', ')}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Content Types:</span>
                        <p className="text-white">{proposal.campaign.contentTypes.join(', ')}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Deliverables:</span>
                        <p className="text-white">{proposal.deliverables.length} items</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Created:</span>
                        <p className="text-white">{formatDate(proposal.createdAt)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid gap-4">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-6 rounded-xl border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                      <p className="text-gray-300 mb-4">{template.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-400">Category: {template.category}</span>
                        {template.isDefault && (
                          <span className="text-purple-400 bg-purple-400/20 px-2 py-1 rounded-full text-xs">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Use Template
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="glass p-6 rounded-xl border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6">Create New Proposal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Campaign Objective</label>
                  <input
                    type="text"
                    value={formData.campaignObjective}
                    onChange={(e) => setFormData(prev => ({ ...prev, campaignObjective: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
                    placeholder="e.g., Increase brand awareness"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Budget ($)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
                    placeholder="5000"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Timeline (days)</label>
                  <input
                    type="number"
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: parseInt(e.target.value) || 30 }))}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
                    placeholder="30"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Platforms</label>
                  <div className="flex flex-wrap gap-2">
                    {['TikTok', 'Instagram', 'YouTube', 'Twitter'].map((platform) => (
                      <motion.button
                        key={platform}
                        onClick={() => {
                          const platforms = formData.platforms.includes(platform)
                            ? formData.platforms.filter(p => p !== platform)
                            : [...formData.platforms, platform];
                          setFormData(prev => ({ ...prev, platforms }));
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1 rounded-full text-sm ${
                          formData.platforms.includes(platform)
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {platform}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Content Types</label>
                  <div className="flex flex-wrap gap-2">
                    {['Posts', 'Stories', 'Reels', 'Videos', 'Lives'].map((type) => (
                      <motion.button
                        key={type}
                        onClick={() => {
                          const contentTypes = formData.contentTypes.includes(type)
                            ? formData.contentTypes.filter(t => t !== type)
                            : [...formData.contentTypes, type];
                          setFormData(prev => ({ ...prev, contentTypes }));
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1 rounded-full text-sm ${
                          formData.contentTypes.includes(type)
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {type}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="exclusivity"
                    checked={formData.exclusivity}
                    onChange={(e) => setFormData(prev => ({ ...prev, exclusivity: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded"
                  />
                  <label htmlFor="exclusivity" className="text-gray-300">Exclusivity Required</label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8">
                <motion.button
                  onClick={() => setShowCreateForm(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={generateProposal}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Proposal'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proposal Detail Modal */}
      <AnimatePresence>
        {selectedProposal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedProposal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">{selectedProposal.title}</h3>
                <motion.button
                  onClick={() => setSelectedProposal(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircleIcon className="h-6 w-6" />
                </motion.button>
              </div>
              
              <div className="space-y-6">
                {/* Campaign Details */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Campaign Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Objective:</span>
                      <p className="text-white">{selectedProposal.campaign.objective}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Platforms:</span>
                      <p className="text-white">{selectedProposal.campaign.platforms.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <p className="text-white">{selectedProposal.campaign.duration} days</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Exclusivity:</span>
                      <p className="text-white">{selectedProposal.campaign.exclusivity ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Budget Breakdown */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Budget Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total:</span>
                      <p className="text-white text-lg font-semibold">{formatCurrency(selectedProposal.budget.total)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Content:</span>
                      <p className="text-white">{formatCurrency(selectedProposal.budget.breakdown.content)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Performance:</span>
                      <p className="text-white">{formatCurrency(selectedProposal.budget.breakdown.performance)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Exclusivity:</span>
                      <p className="text-white">{formatCurrency(selectedProposal.budget.breakdown.exclusivity)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Deliverables */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Deliverables</h4>
                  <div className="space-y-3">
                    {selectedProposal.deliverables.map((deliverable, index) => (
                      <div key={deliverable.id} className="glass p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white">{deliverable.type} - {deliverable.platform}</h5>
                          <span className="text-purple-400 font-semibold">{formatCurrency(deliverable.price)}</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{deliverable.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>Qty: {deliverable.quantity}</span>
                          <span>Due: {formatDate(deliverable.deadline)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Expected Performance</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Reach:</span>
                      <p className="text-white">{selectedProposal.metrics.reach.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Engagement:</span>
                      <p className="text-white">{selectedProposal.metrics.engagement}%</p>
                    </div>
                    <div>
                      <span className="text-gray-400">CPM:</span>
                      <p className="text-white">{formatCurrency(selectedProposal.metrics.cpm)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">ROI:</span>
                      <p className="text-white">{selectedProposal.metrics.roi}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SponsorshipProposals;
