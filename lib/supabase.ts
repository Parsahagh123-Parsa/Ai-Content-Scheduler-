import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface ContentPlan {
  id: string;
  user_id: string;
  creator_type: string;
  platform: string;
  content_goal?: string;
  target_audience?: string;
  content_plan: any; // JSON object containing the 7-day plan
  trending_topics?: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Database functions
export async function saveContentPlan(plan: Omit<ContentPlan, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('content_plans')
      .insert([plan])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving content plan:', error);
    throw error;
  }
}

export async function getUserContentPlans(userId: string) {
  try {
    const { data, error } = await supabase
      .from('content_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching content plans:', error);
    throw error;
  }
}

export async function getContentPlan(planId: string) {
  try {
    const { data, error } = await supabase
      .from('content_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching content plan:', error);
    throw error;
  }
}

export async function updateContentPlan(planId: string, updates: Partial<ContentPlan>) {
  try {
    const { data, error } = await supabase
      .from('content_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating content plan:', error);
    throw error;
  }
}

export async function deleteContentPlan(planId: string) {
  try {
    const { error } = await supabase
      .from('content_plans')
      .delete()
      .eq('id', planId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting content plan:', error);
    throw error;
  }
}
