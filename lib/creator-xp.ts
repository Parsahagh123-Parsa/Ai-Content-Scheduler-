export interface CreatorLevel {
  level: number;
  name: string;
  xpRequired: number;
  color: string;
  badge: string;
  benefits: string[];
  unlockFeatures: string[];
}

export interface UserProgress {
  userId: string;
  currentLevel: number;
  currentXP: number;
  totalXP: number;
  achievements: Achievement[];
  streaks: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  stats: {
    contentPlansCreated: number;
    postsGenerated: number;
    viralPosts: number;
    engagementRate: number;
    followersGained: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const CREATOR_LEVELS: CreatorLevel[] = [
  {
    level: 1,
    name: 'Rookie Creator',
    xpRequired: 0,
    color: '#CD7F32',
    badge: '🥉',
    benefits: ['Basic content generation', '5 daily AI calls'],
    unlockFeatures: ['Basic templates', 'Standard hashtags']
  },
  {
    level: 2,
    name: 'Rising Star',
    xpRequired: 100,
    color: '#C0C0C0',
    badge: '🥈',
    benefits: ['Advanced content generation', '10 daily AI calls'],
    unlockFeatures: ['Trend analysis', 'Voice commands']
  },
  {
    level: 3,
    name: 'Content Creator',
    xpRequired: 300,
    color: '#FFD700',
    badge: '🥇',
    benefits: ['Premium content generation', '20 daily AI calls'],
    unlockFeatures: ['3D dashboard', 'Advanced analytics']
  },
  {
    level: 4,
    name: 'Viral Master',
    xpRequired: 600,
    color: '#9D4EDD',
    badge: '💎',
    benefits: ['Unlimited AI calls', 'Priority support'],
    unlockFeatures: ['AI video generation', 'Custom models']
  },
  {
    level: 5,
    name: 'Content Legend',
    xpRequired: 1000,
    color: '#FF6B6B',
    badge: '👑',
    benefits: ['All features unlocked', 'Exclusive content'],
    unlockFeatures: ['White-label options', 'API access']
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_plan',
    name: 'First Steps',
    description: 'Create your first content plan',
    icon: '🎯',
    xpReward: 25,
    unlockedAt: new Date(),
    rarity: 'common'
  },
  {
    id: 'viral_post',
    name: 'Going Viral',
    description: 'Generate a post with 90+ viral score',
    icon: '🚀',
    xpReward: 50,
    unlockedAt: new Date(),
    rarity: 'rare'
  },
  {
    id: 'streak_7',
    name: 'Consistent Creator',
    description: 'Generate content for 7 consecutive days',
    icon: '🔥',
    xpReward: 100,
    unlockedAt: new Date(),
    rarity: 'epic'
  },
  {
    id: 'trend_master',
    name: 'Trend Master',
    description: 'Use 50 trending hashtags',
    icon: '📈',
    xpReward: 75,
    unlockedAt: new Date(),
    rarity: 'rare'
  },
  {
    id: 'ai_expert',
    name: 'AI Expert',
    description: 'Generate 100 AI-powered posts',
    icon: '🤖',
    xpReward: 150,
    unlockedAt: new Date(),
    rarity: 'epic'
  },
  {
    id: 'engagement_king',
    name: 'Engagement King',
    description: 'Achieve 95%+ engagement prediction',
    icon: '👑',
    xpReward: 200,
    unlockedAt: new Date(),
    rarity: 'legendary'
  }
];

export class CreatorXPSystem {
  private userProgress: UserProgress;

  constructor(userId: string) {
    this.userProgress = {
      userId,
      currentLevel: 1,
      currentXP: 0,
      totalXP: 0,
      achievements: [],
      streaks: {
        daily: 0,
        weekly: 0,
        monthly: 0
      },
      stats: {
        contentPlansCreated: 0,
        postsGenerated: 0,
        viralPosts: 0,
        engagementRate: 0,
        followersGained: 0
      }
    };
  }

  addXP(amount: number, source: string): { leveledUp: boolean; newLevel?: CreatorLevel; achievements: Achievement[] } {
    this.userProgress.currentXP += amount;
    this.userProgress.totalXP += amount;

    const leveledUp = this.checkLevelUp();
    const newAchievements = this.checkAchievements(source);

    return {
      leveledUp,
      newLevel: leveledUp ? this.getCurrentLevel() : undefined,
      achievements: newAchievements
    };
  }

  private checkLevelUp(): boolean {
    const currentLevelData = this.getCurrentLevel();
    const nextLevelData = CREATOR_LEVELS.find(level => level.level === currentLevelData.level + 1);

    if (nextLevelData && this.userProgress.currentXP >= nextLevelData.xpRequired) {
      this.userProgress.currentLevel = nextLevelData.level;
      return true;
    }

    return false;
  }

  private checkAchievements(source: string): Achievement[] {
    const newAchievements: Achievement[] = [];

    // Check for specific achievements based on source
    switch (source) {
      case 'content_plan_created':
        this.userProgress.stats.contentPlansCreated++;
        if (this.userProgress.stats.contentPlansCreated === 1) {
          const achievement = ACHIEVEMENTS.find(a => a.id === 'first_plan');
          if (achievement && !this.userProgress.achievements.find(a => a.id === achievement.id)) {
            this.userProgress.achievements.push(achievement);
            newAchievements.push(achievement);
          }
        }
        break;

      case 'viral_post':
        this.userProgress.stats.viralPosts++;
        if (this.userProgress.stats.viralPosts === 1) {
          const achievement = ACHIEVEMENTS.find(a => a.id === 'viral_post');
          if (achievement && !this.userProgress.achievements.find(a => a.id === achievement.id)) {
            this.userProgress.achievements.push(achievement);
            newAchievements.push(achievement);
          }
        }
        break;

      case 'daily_streak':
        this.userProgress.streaks.daily++;
        if (this.userProgress.streaks.daily === 7) {
          const achievement = ACHIEVEMENTS.find(a => a.id === 'streak_7');
          if (achievement && !this.userProgress.achievements.find(a => a.id === achievement.id)) {
            this.userProgress.achievements.push(achievement);
            newAchievements.push(achievement);
          }
        }
        break;
    }

    return newAchievements;
  }

  getCurrentLevel(): CreatorLevel {
    return CREATOR_LEVELS.find(level => level.level === this.userProgress.currentLevel) || CREATOR_LEVELS[0];
  }

  getNextLevel(): CreatorLevel | null {
    const nextLevel = CREATOR_LEVELS.find(level => level.level === this.userProgress.currentLevel + 1);
    return nextLevel || null;
  }

  getProgressToNextLevel(): { current: number; required: number; percentage: number } {
    const currentLevel = this.getCurrentLevel();
    const nextLevel = this.getNextLevel();

    if (!nextLevel) {
      return { current: this.userProgress.currentXP, required: 0, percentage: 100 };
    }

    const current = this.userProgress.currentXP - currentLevel.xpRequired;
    const required = nextLevel.xpRequired - currentLevel.xpRequired;
    const percentage = Math.min(100, (current / required) * 100);

    return { current, required, percentage };
  }

  getUserProgress(): UserProgress {
    return { ...this.userProgress };
  }

  updateStats(stats: Partial<UserProgress['stats']>): void {
    this.userProgress.stats = { ...this.userProgress.stats, ...stats };
  }

  getUnlockedFeatures(): string[] {
    const currentLevel = this.getCurrentLevel();
    return currentLevel.unlockFeatures;
  }

  getAvailableAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(achievement => 
      !this.userProgress.achievements.find(a => a.id === achievement.id)
    );
  }

  getRarityColor(rarity: string): string {
    const colors = {
      common: '#6B7280',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  }

  calculateDailyBonus(): number {
    const streak = this.userProgress.streaks.daily;
    return Math.min(50, streak * 5); // Max 50 bonus XP
  }

  resetDailyStreak(): void {
    this.userProgress.streaks.daily = 0;
  }

  addDailyStreak(): void {
    this.userProgress.streaks.daily++;
    this.addXP(this.calculateDailyBonus(), 'daily_streak');
  }
}

// XP calculation functions
export const calculateContentPlanXP = (viralScore: number, engagement: number): number => {
  const baseXP = 25;
  const viralBonus = Math.floor(viralScore / 10);
  const engagementBonus = Math.floor(engagement / 10);
  return baseXP + viralBonus + engagementBonus;
};

export const calculatePostXP = (platform: string, viralScore: number): number => {
  const platformMultipliers = {
    'TikTok': 1.5,
    'Instagram': 1.2,
    'YouTube': 1.3,
    'Twitter': 1.0,
    'LinkedIn': 1.1
  };

  const baseXP = 10;
  const multiplier = platformMultipliers[platform as keyof typeof platformMultipliers] || 1.0;
  const viralBonus = Math.floor(viralScore / 20);

  return Math.floor((baseXP + viralBonus) * multiplier);
};

export const calculateTrendXP = (trendsUsed: number): number => {
  return Math.min(50, trendsUsed * 2);
};
