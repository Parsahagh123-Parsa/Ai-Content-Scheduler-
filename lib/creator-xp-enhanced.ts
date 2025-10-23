import { supabase } from './supabase';

export interface XPAction {
  id: string;
  type: 'content_created' | 'content_optimized' | 'trend_used' | 'streak_maintained' | 'achievement_unlocked' | 'collaboration' | 'viral_content' | 'daily_login' | 'weekly_mission' | 'social_engagement';
  points: number;
  multiplier: number;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'content' | 'engagement' | 'growth' | 'collaboration' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: {
    type: string;
    value: number;
    timeframe?: string;
  }[];
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
}

export interface Level {
  level: number;
  name: string;
  requiredXP: number;
  benefits: string[];
  color: string;
  badge: string;
}

export interface Streak {
  current: number;
  longest: number;
  lastActivity: Date;
  bonus: number;
}

export interface PowerCard {
  id: string;
  name: string;
  description: string;
  effect: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  duration: number; // in hours
  cooldown: number; // in hours
  active: boolean;
  expiresAt?: Date;
  cooldownUntil?: Date;
}

export interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  type: 'content' | 'engagement' | 'growth' | 'collaboration';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  points: number;
  requirements: {
    type: string;
    value: number;
  }[];
  progress: number;
  completed: boolean;
  expiresAt: Date;
  rewards: {
    xp: number;
    cards?: PowerCard[];
    achievements?: string[];
  };
}

export interface UserXP {
  userId: string;
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  streak: Streak;
  achievements: Achievement[];
  powerCards: PowerCard[];
  weeklyMissions: WeeklyMission[];
  stats: {
    contentCreated: number;
    contentOptimized: number;
    viralContent: number;
    collaborations: number;
    daysActive: number;
    totalEngagement: number;
  };
}

// XP Levels configuration
export const XP_LEVELS: Level[] = [
  { level: 1, name: 'Newcomer', requiredXP: 0, benefits: ['Basic content generation'], color: '#6B7280', badge: '🌱' },
  { level: 2, name: 'Creator', requiredXP: 100, benefits: ['Trend analysis', 'Basic optimization'], color: '#3B82F6', badge: '📝' },
  { level: 3, name: 'Rising Star', requiredXP: 300, benefits: ['Advanced optimization', 'Voice commands'], color: '#8B5CF6', badge: '⭐' },
  { level: 4, name: 'Influencer', requiredXP: 600, benefits: ['AI coaching', '3D dashboard'], color: '#EC4899', badge: '🌟' },
  { level: 5, name: 'Viral Creator', requiredXP: 1000, benefits: ['Video generation', 'Marketplace access'], color: '#F59E0B', badge: '🔥' },
  { level: 6, name: 'Content Master', requiredXP: 1500, benefits: ['Advanced analytics', 'Team collaboration'], color: '#10B981', badge: '👑' },
  { level: 7, name: 'Trend Setter', requiredXP: 2200, benefits: ['Trend prediction', 'Exclusive features'], color: '#EF4444', badge: '🚀' },
  { level: 8, name: 'Industry Leader', requiredXP: 3000, benefits: ['White-label options', 'API access'], color: '#6366F1', badge: '💎' },
  { level: 9, name: 'Content Legend', requiredXP: 4000, benefits: ['Custom AI models', 'Revenue sharing'], color: '#F97316', badge: '🏆' },
  { level: 10, name: 'Creator God', requiredXP: 5000, benefits: ['All features', 'Exclusive perks'], color: '#8B5CF6', badge: '⚡' }
];

// Achievements configuration
export const ACHIEVEMENTS: Achievement[] = [
  // Content Achievements
  {
    id: 'first_content',
    name: 'First Steps',
    description: 'Create your first content plan',
    icon: '🎯',
    category: 'content',
    rarity: 'common',
    points: 50,
    requirements: [{ type: 'content_created', value: 1 }],
    unlocked: false,
    progress: 0
  },
  {
    id: 'content_machine',
    name: 'Content Machine',
    description: 'Create 100 content plans',
    icon: '🏭',
    category: 'content',
    rarity: 'rare',
    points: 500,
    requirements: [{ type: 'content_created', value: 100 }],
    unlocked: false,
    progress: 0
  },
  {
    id: 'viral_master',
    name: 'Viral Master',
    description: 'Create 10 viral content pieces',
    icon: '🔥',
    category: 'content',
    rarity: 'epic',
    points: 1000,
    requirements: [{ type: 'viral_content', value: 10 }],
    unlocked: false,
    progress: 0
  },
  
  // Engagement Achievements
  {
    id: 'optimizer',
    name: 'Optimizer',
    description: 'Optimize 50 posts for virality',
    icon: '⚡',
    category: 'engagement',
    rarity: 'common',
    points: 200,
    requirements: [{ type: 'content_optimized', value: 50 }],
    unlocked: false,
    progress: 0
  },
  {
    id: 'trend_hunter',
    name: 'Trend Hunter',
    description: 'Use 25 trending topics in your content',
    icon: '🎯',
    category: 'engagement',
    rarity: 'rare',
    points: 400,
    requirements: [{ type: 'trend_used', value: 25 }],
    unlocked: false,
    progress: 0
  },
  
  // Growth Achievements
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    category: 'growth',
    rarity: 'epic',
    points: 800,
    requirements: [{ type: 'streak_maintained', value: 30 }],
    unlocked: false,
    progress: 0
  },
  {
    id: 'daily_grind',
    name: 'Daily Grind',
    description: 'Be active for 100 days',
    icon: '💪',
    category: 'growth',
    rarity: 'legendary',
    points: 1500,
    requirements: [{ type: 'daily_login', value: 100 }],
    unlocked: false,
    progress: 0
  },
  
  // Collaboration Achievements
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Complete 10 collaborations',
    icon: '🤝',
    category: 'collaboration',
    rarity: 'rare',
    points: 600,
    requirements: [{ type: 'collaboration', value: 10 }],
    unlocked: false,
    progress: 0
  },
  
  // Special Achievements
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Join during beta phase',
    icon: '🚀',
    category: 'special',
    rarity: 'legendary',
    points: 2000,
    requirements: [{ type: 'beta_user', value: 1 }],
    unlocked: false,
    progress: 0
  }
];

// Power Cards configuration
export const POWER_CARDS: PowerCard[] = [
  {
    id: 'xp_boost',
    name: 'XP Boost',
    description: 'Double XP for 2 hours',
    effect: '2x XP multiplier',
    rarity: 'common',
    duration: 2,
    cooldown: 24,
    active: false
  },
  {
    id: 'viral_predictor',
    name: 'Viral Predictor',
    description: 'Get viral potential scores for all content',
    effect: 'Enhanced virality analysis',
    rarity: 'rare',
    duration: 4,
    cooldown: 48,
    active: false
  },
  {
    id: 'trend_insight',
    name: 'Trend Insight',
    description: 'Access to exclusive trending data',
    effect: 'Premium trend analysis',
    rarity: 'epic',
    duration: 6,
    cooldown: 72,
    active: false
  },
  {
    id: 'ai_coach_pro',
    name: 'AI Coach Pro',
    description: 'Enhanced AI coaching with personalized tips',
    effect: 'Advanced AI assistance',
    rarity: 'legendary',
    duration: 8,
    cooldown: 96,
    active: false
  }
];

// Main XP Manager class
export class CreatorXPManager {
  private userId: string;
  private userXP: UserXP | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Initialize user XP data
  async initialize(): Promise<UserXP> {
    try {
      const { data, error } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        this.userXP = {
          ...data,
          achievements: data.achievements || [],
          powerCards: data.power_cards || [],
          weeklyMissions: data.weekly_missions || [],
          streak: data.streak || { current: 0, longest: 0, lastActivity: new Date(), bonus: 1 }
        };
      } else {
        // Create new user XP record
        this.userXP = await this.createNewUserXP();
      }

      return this.userXP;
    } catch (error) {
      console.error('Error initializing user XP:', error);
      throw new Error('Failed to initialize user XP');
    }
  }

  // Create new user XP record
  private async createNewUserXP(): Promise<UserXP> {
    const newUserXP: UserXP = {
      userId: this.userId,
      totalXP: 0,
      currentLevel: 1,
      xpToNextLevel: XP_LEVELS[1].requiredXP,
      streak: { current: 0, longest: 0, lastActivity: new Date(), bonus: 1 },
      achievements: ACHIEVEMENTS.map(achievement => ({ ...achievement, unlocked: false, progress: 0 })),
      powerCards: [],
      weeklyMissions: [],
      stats: {
        contentCreated: 0,
        contentOptimized: 0,
        viralContent: 0,
        collaborations: 0,
        daysActive: 0,
        totalEngagement: 0
      }
    };

    const { error } = await supabase
      .from('user_xp')
      .insert([{
        user_id: this.userId,
        total_xp: newUserXP.totalXP,
        current_level: newUserXP.currentLevel,
        xp_to_next_level: newUserXP.xpToNextLevel,
        streak: newUserXP.streak,
        achievements: newUserXP.achievements,
        power_cards: newUserXP.powerCards,
        weekly_missions: newUserXP.weeklyMissions,
        stats: newUserXP.stats
      }]);

    if (error) throw error;
    return newUserXP;
  }

  // Add XP for an action
  async addXP(action: XPAction): Promise<{ xpGained: number; levelUp: boolean; newLevel?: Level }> {
    if (!this.userXP) {
      await this.initialize();
    }

    const basePoints = action.points;
    const multiplier = action.multiplier * this.userXP!.streak.bonus;
    const xpGained = Math.round(basePoints * multiplier);

    const oldLevel = this.userXP!.currentLevel;
    this.userXP!.totalXP += xpGained;
    this.userXP!.currentLevel = this.calculateLevel(this.userXP!.totalXP);
    this.userXP!.xpToNextLevel = this.calculateXPToNextLevel();

    const levelUp = this.userXP!.currentLevel > oldLevel;
    const newLevel = levelUp ? this.getLevel(this.userXP!.currentLevel) : undefined;

    // Update stats based on action type
    this.updateStats(action);

    // Check for achievements
    await this.checkAchievements(action);

    // Update streak
    this.updateStreak();

    // Save to database
    await this.saveUserXP();

    return { xpGained, levelUp, newLevel };
  }

  // Calculate current level based on total XP
  private calculateLevel(totalXP: number): number {
    for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
      if (totalXP >= XP_LEVELS[i].requiredXP) {
        return XP_LEVELS[i].level;
      }
    }
    return 1;
  }

  // Calculate XP needed for next level
  private calculateXPToNextLevel(): number {
    const currentLevel = this.userXP!.currentLevel;
    const nextLevel = currentLevel + 1;
    
    if (nextLevel > XP_LEVELS.length) {
      return 0; // Max level reached
    }
    
    const nextLevelXP = XP_LEVELS.find(level => level.level === nextLevel)?.requiredXP || 0;
    return nextLevelXP - this.userXP!.totalXP;
  }

  // Get level information
  private getLevel(level: number): Level {
    return XP_LEVELS.find(l => l.level === level) || XP_LEVELS[0];
  }

  // Update user stats
  private updateStats(action: XPAction): void {
    switch (action.type) {
      case 'content_created':
        this.userXP!.stats.contentCreated++;
        break;
      case 'content_optimized':
        this.userXP!.stats.contentOptimized++;
        break;
      case 'viral_content':
        this.userXP!.stats.viralContent++;
        break;
      case 'collaboration':
        this.userXP!.stats.collaborations++;
        break;
      case 'daily_login':
        this.userXP!.stats.daysActive++;
        break;
      case 'social_engagement':
        this.userXP!.stats.totalEngagement += action.metadata?.engagement || 0;
        break;
    }
  }

  // Check for achievement unlocks
  private async checkAchievements(action: XPAction): Promise<void> {
    for (const achievement of this.userXP!.achievements) {
      if (achievement.unlocked) continue;

      const requirement = achievement.requirements.find(req => req.type === action.type);
      if (!requirement) continue;

      // Update progress
      achievement.progress = Math.min(achievement.progress + 1, requirement.value);

      // Check if achievement is unlocked
      if (achievement.progress >= requirement.value) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        
        // Award XP for achievement
        await this.addXP({
          id: `achievement_${achievement.id}`,
          type: 'achievement_unlocked',
          points: achievement.points,
          multiplier: 1,
          description: `Unlocked achievement: ${achievement.name}`,
          timestamp: new Date(),
          metadata: { achievementId: achievement.id }
        });
      }
    }
  }

  // Update streak
  private updateStreak(): void {
    const now = new Date();
    const lastActivity = new Date(this.userXP!.streak.lastActivity);
    const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day
      this.userXP!.streak.current++;
      this.userXP!.streak.longest = Math.max(this.userXP!.streak.current, this.userXP!.streak.longest);
    } else if (daysDiff > 1) {
      // Streak broken
      this.userXP!.streak.current = 1;
    }

    this.userXP!.streak.lastActivity = now;
    this.userXP!.streak.bonus = Math.min(1 + (this.userXP!.streak.current * 0.1), 3); // Max 3x bonus
  }

  // Save user XP to database
  private async saveUserXP(): Promise<void> {
    const { error } = await supabase
      .from('user_xp')
      .update({
        total_xp: this.userXP!.totalXP,
        current_level: this.userXP!.currentLevel,
        xp_to_next_level: this.userXP!.xpToNextLevel,
        streak: this.userXP!.streak,
        achievements: this.userXP!.achievements,
        power_cards: this.userXP!.powerCards,
        weekly_missions: this.userXP!.weeklyMissions,
        stats: this.userXP!.stats
      })
      .eq('user_id', this.userId);

    if (error) throw error;
  }

  // Get user XP data
  getUserXP(): UserXP | null {
    return this.userXP;
  }

  // Get current level info
  getCurrentLevel(): Level {
    return this.getLevel(this.userXP!.currentLevel);
  }

  // Get next level info
  getNextLevel(): Level | null {
    const nextLevel = this.userXP!.currentLevel + 1;
    return nextLevel <= XP_LEVELS.length ? this.getLevel(nextLevel) : null;
  }

  // Activate power card
  async activatePowerCard(cardId: string): Promise<boolean> {
    const card = this.userXP!.powerCards.find(c => c.id === cardId);
    if (!card || card.active || (card.cooldownUntil && new Date() < card.cooldownUntil)) {
      return false;
    }

    card.active = true;
    card.expiresAt = new Date(Date.now() + card.duration * 60 * 60 * 1000);
    
    await this.saveUserXP();
    return true;
  }

  // Deactivate expired power cards
  async deactivateExpiredCards(): Promise<void> {
    const now = new Date();
    let updated = false;

    for (const card of this.userXP!.powerCards) {
      if (card.active && card.expiresAt && now > card.expiresAt) {
        card.active = false;
        card.cooldownUntil = new Date(now.getTime() + card.cooldown * 60 * 60 * 1000);
        updated = true;
      }
    }

    if (updated) {
      await this.saveUserXP();
    }
  }

  // Generate weekly missions
  async generateWeeklyMissions(): Promise<void> {
    const missions: WeeklyMission[] = [
      {
        id: 'create_content',
        title: 'Content Creator',
        description: 'Create 5 content plans this week',
        type: 'content',
        difficulty: 'easy',
        points: 200,
        requirements: [{ type: 'content_created', value: 5 }],
        progress: 0,
        completed: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rewards: { xp: 200 }
      },
      {
        id: 'optimize_posts',
        title: 'Optimization Master',
        description: 'Optimize 10 posts for virality',
        type: 'engagement',
        difficulty: 'medium',
        points: 400,
        requirements: [{ type: 'content_optimized', value: 10 }],
        progress: 0,
        completed: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rewards: { xp: 400 }
      },
      {
        id: 'viral_hit',
        title: 'Viral Sensation',
        description: 'Create 2 viral content pieces',
        type: 'growth',
        difficulty: 'hard',
        points: 800,
        requirements: [{ type: 'viral_content', value: 2 }],
        progress: 0,
        completed: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rewards: { xp: 800 }
      }
    ];

    this.userXP!.weeklyMissions = missions;
    await this.saveUserXP();
  }

  // Award power card
  async awardPowerCard(cardId: string): Promise<void> {
    const cardTemplate = POWER_CARDS.find(c => c.id === cardId);
    if (!cardTemplate) return;

    const newCard: PowerCard = {
      ...cardTemplate,
      active: false
    };

    this.userXP!.powerCards.push(newCard);
    await this.saveUserXP();
  }

  // Get leaderboard data
  async getLeaderboard(limit: number = 10): Promise<Array<{ userId: string; totalXP: number; level: number; name: string }>> {
    const { data, error } = await supabase
      .from('user_xp')
      .select('user_id, total_xp, current_level, stats')
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(user => ({
      userId: user.user_id,
      totalXP: user.total_xp,
      level: user.current_level,
      name: user.stats?.name || `User ${user.user_id.slice(0, 8)}`
    }));
  }
}

// XP Action creators
export const createXPAction = {
  contentCreated: (metadata?: any): XPAction => ({
    id: `content_${Date.now()}`,
    type: 'content_created',
    points: 50,
    multiplier: 1,
    description: 'Created new content plan',
    timestamp: new Date(),
    metadata
  }),

  contentOptimized: (viralityScore: number): XPAction => ({
    id: `optimize_${Date.now()}`,
    type: 'content_optimized',
    points: 25 + Math.floor(viralityScore / 4),
    multiplier: 1,
    description: 'Optimized content for virality',
    timestamp: new Date(),
    metadata: { viralityScore }
  }),

  trendUsed: (trendName: string): XPAction => ({
    id: `trend_${Date.now()}`,
    type: 'trend_used',
    points: 30,
    multiplier: 1,
    description: `Used trending topic: ${trendName}`,
    timestamp: new Date(),
    metadata: { trendName }
  }),

  viralContent: (engagement: number): XPAction => ({
    id: `viral_${Date.now()}`,
    type: 'viral_content',
    points: 100 + Math.floor(engagement / 10),
    multiplier: 2,
    description: 'Created viral content',
    timestamp: new Date(),
    metadata: { engagement }
  }),

  dailyLogin: (): XPAction => ({
    id: `login_${Date.now()}`,
    type: 'daily_login',
    points: 20,
    multiplier: 1,
    description: 'Daily login bonus',
    timestamp: new Date()
  }),

  collaboration: (partnerName: string): XPAction => ({
    id: `collab_${Date.now()}`,
    type: 'collaboration',
    points: 75,
    multiplier: 1.5,
    description: `Collaborated with ${partnerName}`,
    timestamp: new Date(),
    metadata: { partnerName }
  })
};
