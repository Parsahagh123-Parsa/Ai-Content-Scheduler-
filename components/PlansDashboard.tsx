"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Hash, Trash2, Eye, Download } from "lucide-react";
import { ContentPlan } from "@/lib/supabase";

interface PlansDashboardProps {
  userId: string;
}

export default function PlansDashboard({ userId }: PlansDashboardProps) {
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<ContentPlan | null>(null);

  useEffect(() => {
    fetchUserPlans();
  }, [userId]);

  const fetchUserPlans = async () => {
    try {
      const response = await fetch(`/api/user-plans?userId=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setPlans(result.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/delete-plan?id=${planId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setPlans(plans.filter(plan => plan.id !== planId));
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCreatorTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      fitness: "💪",
      tech: "💻",
      beauty: "✨",
      gaming: "🎮",
      cooking: "🍳",
      travel: "✈️",
      business: "💼",
      education: "📚",
    };
    return icons[type] || "📝";
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      tiktok: "🎵",
      "youtube-shorts": "📺",
      instagram: "📸",
      "instagram-stories": "📱",
      linkedin: "💼",
    };
    return icons[platform] || "📱";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Content Plans</h1>
        <p className="text-muted-foreground">
          Manage and view your AI-generated content strategies
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Content Plans Yet</h3>
          <p className="text-muted-foreground">
            Create your first AI-generated content plan to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getCreatorTypeIcon(plan.creator_type)}</div>
                  <div>
                    <h3 className="font-semibold capitalize">{plan.creator_type}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="text-lg">{getPlatformIcon(plan.platform)}</span>
                      {plan.platform.replace('-', ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    title="View Plan"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    title="Delete Plan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Created {formatDate(plan.created_at)}
                </p>
                {plan.content_goal && (
                  <p className="font-medium text-foreground">
                    Goal: {plan.content_goal}
                  </p>
                )}
                {plan.trending_topics && plan.trending_topics.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    <span>{plan.trending_topics.length} trending topics</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {Object.keys(plan.content_plan || {}).length} days planned
                  </span>
                  <button className="text-primary hover:text-primary/80 text-sm font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Plan Detail Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg border max-w-4xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <span className="text-3xl">{getCreatorTypeIcon(selectedPlan.creator_type)}</span>
                    {selectedPlan.creator_type} Content Plan
                  </h2>
                  <p className="text-muted-foreground">
                    {selectedPlan.platform.replace('-', ' ')} • Created {formatDate(selectedPlan.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(selectedPlan.content_plan || {}).map(([day, content]: [string, any]) => (
                  <div key={day} className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold">{day}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {content.time}
                      </div>
                    </div>
                    
                    <div className="text-2xl mb-3 text-center">{content.thumbnail}</div>
                    
                    <h4 className="font-semibold mb-2">{content.title}</h4>
                    
                    <p className="text-sm text-muted-foreground mb-3">{content.caption}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Hashtags:</span>
                      </div>
                      <p className="text-xs text-muted-foreground break-words">{content.hashtags}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
