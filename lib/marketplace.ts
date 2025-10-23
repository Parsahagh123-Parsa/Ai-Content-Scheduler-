import { supabase } from './supabase';
import { stripe } from './stripe';

export interface MarketplaceTemplate {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  creatorType: string;
  price: number; // in cents
  isFree: boolean;
  templateData: any; // The actual content plan
  previewImages: string[];
  tags: string[];
  performance: {
    sales: number;
    rating: number;
    reviews: number;
    views: number;
  };
  status: 'draft' | 'published' | 'featured' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceReview {
  id: string;
  templateId: string;
  userId: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: string;
}

export interface Collaboration {
  id: string;
  templateId: string;
  collaborators: Array<{
    userId: string;
    role: 'owner' | 'co-owner' | 'contributor';
    revenueShare: number; // percentage
  }>;
  revenueSplit: {
    owner: number;
    collaborators: number;
  };
  totalRevenue: number;
  createdAt: string;
}

// Template management
export async function createMarketplaceTemplate(
  creatorId: string,
  templateData: Omit<MarketplaceTemplate, 'id' | 'creatorId' | 'performance' | 'createdAt' | 'updatedAt'>
): Promise<MarketplaceTemplate> {
  const template: MarketplaceTemplate = {
    id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    creatorId,
    ...templateData,
    performance: {
      sales: 0,
      rating: 0,
      reviews: 0,
      views: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('marketplace_templates')
    .insert([template])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMarketplaceTemplates(
  filters: {
    category?: string;
    platform?: string;
    creatorType?: string;
    priceRange?: { min: number; max: number };
    tags?: string[];
    sortBy?: 'popular' | 'newest' | 'rating' | 'price';
    limit?: number;
    offset?: number;
  } = {}
): Promise<MarketplaceTemplate[]> {
  let query = supabase
    .from('marketplace_templates')
    .select('*')
    .eq('status', 'published');

  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.platform) {
    query = query.eq('platform', filters.platform);
  }
  if (filters.creatorType) {
    query = query.eq('creatorType', filters.creatorType);
  }
  if (filters.priceRange) {
    query = query
      .gte('price', filters.priceRange.min)
      .lte('price', filters.priceRange.max);
  }
  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  // Apply sorting
  switch (filters.sortBy) {
    case 'popular':
      query = query.order('performance.sales', { ascending: false });
      break;
    case 'newest':
      query = query.order('createdAt', { ascending: false });
      break;
    case 'rating':
      query = query.order('performance.rating', { ascending: false });
      break;
    case 'price':
      query = query.order('price', { ascending: true });
      break;
    default:
      query = query.order('createdAt', { ascending: false });
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getTemplateById(templateId: string): Promise<MarketplaceTemplate | null> {
  const { data, error } = await supabase
    .from('marketplace_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) return null;
  return data;
}

// Purchase system
export async function purchaseTemplate(
  templateId: string,
  buyerId: string,
  paymentMethodId: string
): Promise<{ success: boolean; purchaseId?: string; error?: string }> {
  try {
    // Get template details
    const template = await getTemplateById(templateId);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    if (template.isFree) {
      // Free template - just grant access
      await grantTemplateAccess(templateId, buyerId);
      return { success: true, purchaseId: `free_${Date.now()}` };
    }

    // Get buyer's Stripe customer ID
    const { data: buyer } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', buyerId)
      .single();

    if (!buyer?.stripe_customer_id) {
      return { success: false, error: 'Payment method not found' };
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: template.price,
      currency: 'usd',
      customer: buyer.stripe_customer_id,
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        templateId,
        buyerId,
        creatorId: template.creatorId,
      },
    });

    if (paymentIntent.status === 'succeeded') {
      // Grant access to template
      await grantTemplateAccess(templateId, buyerId);
      
      // Process revenue split
      await processRevenueSplit(templateId, template.price, template.creatorId);
      
      // Update template performance
      await updateTemplatePerformance(templateId, 'purchase');
      
      return { success: true, purchaseId: paymentIntent.id };
    } else {
      return { success: false, error: 'Payment failed' };
    }
  } catch (error) {
    console.error('Purchase error:', error);
    return { success: false, error: 'Purchase failed' };
  }
}

async function grantTemplateAccess(templateId: string, buyerId: string) {
  await supabase
    .from('template_purchases')
    .insert([{
      template_id: templateId,
      buyer_id: buyerId,
      purchased_at: new Date().toISOString(),
    }]);
}

async function processRevenueSplit(
  templateId: string,
  amount: number,
  creatorId: string
) {
  // Get collaboration details
  const { data: collaboration } = await supabase
    .from('collaborations')
    .select('*')
    .eq('templateId', templateId)
    .single();

  if (!collaboration) {
    // Single creator - full revenue
    await distributeRevenue(creatorId, amount, templateId);
    return;
  }

  // Split revenue among collaborators
  const ownerShare = Math.round(amount * (collaboration.revenueSplit.owner / 100));
  const collaboratorShare = amount - ownerShare;

  // Distribute to owner
  await distributeRevenue(creatorId, ownerShare, templateId);

  // Distribute to collaborators
  for (const collaborator of collaboration.collaborators) {
    const share = Math.round(collaboratorShare * (collaborator.revenueShare / 100));
    await distributeRevenue(collaborator.userId, share, templateId);
  }
}

async function distributeRevenue(userId: string, amount: number, templateId: string) {
  // Record revenue in database
  await supabase
    .from('creator_revenue')
    .insert([{
      user_id: userId,
      template_id: templateId,
      amount,
      type: 'template_sale',
      created_at: new Date().toISOString(),
    }]);

  // Update user's total revenue
  const { data: user } = await supabase
    .from('users')
    .select('total_revenue')
    .eq('id', userId)
    .single();

  const newTotal = (user?.total_revenue || 0) + amount;
  
  await supabase
    .from('users')
    .update({ total_revenue: newTotal })
    .eq('id', userId);
}

async function updateTemplatePerformance(templateId: string, action: 'view' | 'purchase' | 'review') {
  const { data: template } = await supabase
    .from('marketplace_templates')
    .select('performance')
    .eq('id', templateId)
    .single();

  if (!template) return;

  const performance = template.performance;
  
  switch (action) {
    case 'view':
      performance.views += 1;
      break;
    case 'purchase':
      performance.sales += 1;
      break;
    case 'review':
      performance.reviews += 1;
      break;
  }

  await supabase
    .from('marketplace_templates')
    .update({ performance })
    .eq('id', templateId);
}

// Review system
export async function addTemplateReview(
  templateId: string,
  userId: string,
  rating: number,
  comment: string
): Promise<MarketplaceReview> {
  const review: MarketplaceReview = {
    id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId,
    userId,
    rating,
    comment,
    helpful: 0,
    createdAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('marketplace_reviews')
    .insert([review])
    .select()
    .single();

  if (error) throw error;

  // Update template rating
  await updateTemplateRating(templateId);
  
  // Update template performance
  await updateTemplatePerformance(templateId, 'review');

  return data;
}

async function updateTemplateRating(templateId: string) {
  const { data: reviews } = await supabase
    .from('marketplace_reviews')
    .select('rating')
    .eq('templateId', templateId);

  if (!reviews || reviews.length === 0) return;

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await supabase
    .from('marketplace_templates')
    .update({
      'performance.rating': Math.round(averageRating * 10) / 10,
    })
    .eq('id', templateId);
}

// Collaboration system
export async function createCollaboration(
  templateId: string,
  ownerId: string,
  collaborators: Array<{
    userId: string;
    role: 'co-owner' | 'contributor';
    revenueShare: number;
  }>
): Promise<Collaboration> {
  const totalShare = collaborators.reduce((sum, collab) => sum + collab.revenueShare, 0);
  
  if (totalShare > 100) {
    throw new Error('Total revenue share cannot exceed 100%');
  }

  const collaboration: Collaboration = {
    id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId,
    collaborators: [
      { userId: ownerId, role: 'owner', revenueShare: 100 - totalShare },
      ...collaborators,
    ],
    revenueSplit: {
      owner: 100 - totalShare,
      collaborators: totalShare,
    },
    totalRevenue: 0,
    createdAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('collaborations')
    .insert([collaboration])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Smart recommendations
export async function getCollaboratorRecommendations(
  userId: string,
  templateId: string
): Promise<Array<{ userId: string; name: string; similarity: number; reason: string }>> {
  // Get template details
  const template = await getTemplateById(templateId);
  if (!template) return [];

  // Find users with similar niches and high performance
  const { data: similarUsers } = await supabase
    .from('users')
    .select(`
      id,
      email,
      creator_type,
      total_revenue,
      marketplace_templates!creatorId (
        performance
      )
    `)
    .eq('creator_type', template.creatorType)
    .neq('id', userId)
    .order('total_revenue', { ascending: false })
    .limit(10);

  if (!similarUsers) return [];

  // Calculate similarity scores
  const recommendations = similarUsers.map(user => {
    const similarity = calculateSimilarity(template, user);
    return {
      userId: user.id,
      name: user.email.split('@')[0], // Use email prefix as name
      similarity,
      reason: getRecommendationReason(similarity, user),
    };
  });

  return recommendations
    .filter(rec => rec.similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

function calculateSimilarity(template: MarketplaceTemplate, user: any): number {
  let score = 0;
  
  // Same creator type
  if (user.creator_type === template.creatorType) score += 0.4;
  
  // High revenue (successful creator)
  if (user.total_revenue > 10000) score += 0.3;
  else if (user.total_revenue > 1000) score += 0.2;
  
  // High-performing templates
  const avgRating = user.marketplace_templates?.reduce((sum: number, t: any) => 
    sum + (t.performance?.rating || 0), 0) / (user.marketplace_templates?.length || 1);
  
  if (avgRating > 4.5) score += 0.3;
  else if (avgRating > 4.0) score += 0.2;
  
  return Math.min(score, 1);
}

function getRecommendationReason(similarity: number, user: any): string {
  if (similarity > 0.8) return 'Highly compatible creator with excellent track record';
  if (similarity > 0.6) return 'Good match with strong performance history';
  if (similarity > 0.4) return 'Similar niche with growing success';
  return 'Emerging creator in your field';
}

// Get user's marketplace stats
export async function getUserMarketplaceStats(userId: string) {
  const { data: templates } = await supabase
    .from('marketplace_templates')
    .select('performance, price, status')
    .eq('creatorId', userId);

  const { data: revenue } = await supabase
    .from('creator_revenue')
    .select('amount')
    .eq('user_id', userId);

  const totalRevenue = revenue?.reduce((sum, r) => sum + r.amount, 0) || 0;
  const totalSales = templates?.reduce((sum, t) => sum + (t.performance?.sales || 0), 0) || 0;
  const avgRating = templates?.reduce((sum, t) => sum + (t.performance?.rating || 0), 0) / (templates?.length || 1) || 0;

  return {
    totalTemplates: templates?.length || 0,
    totalSales,
    totalRevenue,
    avgRating: Math.round(avgRating * 10) / 10,
    publishedTemplates: templates?.filter(t => t.status === 'published').length || 0,
  };
}
