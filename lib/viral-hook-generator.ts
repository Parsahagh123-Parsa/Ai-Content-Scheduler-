import { openai } from './openai';

export interface HookRequest {
  topic: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'twitter';
  targetAudience: string;
  contentType: 'educational' | 'entertainment' | 'lifestyle' | 'comedy' | 'motivational' | 'controversial';
  tone: 'casual' | 'professional' | 'dramatic' | 'funny' | 'inspirational';
  duration: number; // in seconds (3-15)
  includeTrendingElements?: boolean;
  includeEmojis?: boolean;
  includeQuestions?: boolean;
  maxLength?: number;
}

export interface HookResponse {
  hooks: Array<{
    text: string;
    viralityScore: number;
    engagementPrediction: number;
    reasoning: string;
    variations: string[];
    timing: {
      start: number;
      end: number;
    };
  }>;
  trendingElements: string[];
  platformOptimizations: string[];
  suggestions: {
    improvements: string[];
    alternatives: string[];
    bestPractices: string[];
  };
  metadata: {
    generatedAt: Date;
    platform: string;
    contentType: string;
    averageViralityScore: number;
  };
}

// Hook templates for different content types
export const HOOK_TEMPLATES = {
  educational: [
    "Did you know that {topic}? Here's why it matters...",
    "I used to think {topic} was {assumption}, but I was wrong...",
    "The secret to {topic} that {authority} doesn't want you to know...",
    "This {topic} trick will change your life in {timeframe}...",
    "Why everyone's doing {topic} wrong (and how to fix it)..."
  ],
  entertainment: [
    "POV: You just discovered {topic}...",
    "Plot twist: {topic} is actually {surprise}...",
    "When you realize {topic} is {realization}...",
    "This {topic} story will blow your mind...",
    "Wait until you see what happened with {topic}..."
  ],
  lifestyle: [
    "My {topic} routine that everyone's asking about...",
    "The {topic} hack that changed everything...",
    "Why I stopped {topic} and what happened next...",
    "This {topic} mistake cost me {consequence}...",
    "The {topic} transformation you need to see..."
  ],
  comedy: [
    "Me trying to {topic} but {comedy_obstacle}...",
    "When you {topic} but {unexpected_result}...",
    "POV: You're {topic} and {funny_situation}...",
    "This {topic} fail is too good not to share...",
    "Why {topic} is harder than it looks..."
  ],
  motivational: [
    "If I can {topic}, so can you...",
    "The moment I realized {topic} was possible...",
    "Why I never gave up on {topic}...",
    "This {topic} journey changed my life...",
    "The truth about {topic} that will inspire you..."
  ],
  controversial: [
    "Unpopular opinion: {topic} is {controversial_view}...",
    "Why everyone's wrong about {topic}...",
    "The {topic} truth nobody wants to admit...",
    "This {topic} take will upset some people...",
    "Why I stopped believing in {topic}..."
  ]
};

// Platform-specific optimizations
export const PLATFORM_OPTIMIZATIONS = {
  tiktok: {
    maxLength: 50,
    trendingElements: ['POV', 'Plot twist', 'Wait until', 'This will', 'Did you know'],
    emojis: ['🔥', '💯', '✨', '👀', '🤯', '😱', '💪', '🎯'],
    timing: { start: 0, end: 3 },
    hooks: ['POV:', 'Plot twist:', 'Wait until you see:', 'This will blow your mind:', 'Did you know:']
  },
  youtube: {
    maxLength: 80,
    trendingElements: ['Secret', 'Trick', 'Hack', 'Method', 'Technique'],
    emojis: ['🎯', '💡', '⚡', '🔥', '📈', '🎉'],
    timing: { start: 0, end: 5 },
    hooks: ['In this video, I\'ll show you:', 'The secret to:', 'Here\'s why:', 'This method will:', 'You won\'t believe:']
  },
  instagram: {
    maxLength: 60,
    trendingElements: ['Story', 'Journey', 'Transformation', 'Behind the scenes'],
    emojis: ['✨', '💫', '🌟', '💎', '🎨', '📸'],
    timing: { start: 0, end: 4 },
    hooks: ['Behind the scenes:', 'The story of:', 'This journey:', 'What really happened:', 'The truth about:']
  },
  twitter: {
    maxLength: 40,
    trendingElements: ['Thread', 'Hot take', 'Unpopular opinion', 'Breaking'],
    emojis: ['🧵', '🔥', '💭', '⚡', '🎯'],
    timing: { start: 0, end: 2 },
    hooks: ['Thread:', 'Hot take:', 'Unpopular opinion:', 'Breaking:', 'This will:']
  }
};

// Generate viral hooks
export async function generateViralHooks(request: HookRequest): Promise<HookResponse> {
  try {
    // Get trending elements for the platform
    const trendingElements = await getTrendingElements(request.platform, request.topic);
    
    // Generate hooks using AI
    const hooks = await generateHooksWithAI(request, trendingElements);
    
    // Score and rank hooks
    const scoredHooks = await scoreHooks(hooks, request);
    
    // Generate platform optimizations
    const platformOptimizations = generatePlatformOptimizations(request);
    
    // Generate suggestions
    const suggestions = await generateSuggestions(request, scoredHooks);
    
    return {
      hooks: scoredHooks,
      trendingElements,
      platformOptimizations,
      suggestions,
      metadata: {
        generatedAt: new Date(),
        platform: request.platform,
        contentType: request.contentType,
        averageViralityScore: calculateAverageScore(scoredHooks)
      }
    };
  } catch (error) {
    console.error('Error generating viral hooks:', error);
    throw new Error('Failed to generate viral hooks');
  }
}

// Generate hooks using AI
async function generateHooksWithAI(request: HookRequest, trendingElements: string[]): Promise<string[]> {
  const systemPrompt = `You are an expert viral content creator specializing in attention-grabbing hooks for social media platforms.

Platform-specific guidelines:
- TikTok: 3-second hooks, trending language, POV format, emojis
- YouTube: 5-second hooks, educational value, clear value proposition
- Instagram: 4-second hooks, story-driven, aesthetic language
- Twitter: 2-second hooks, punchy, controversial takes

Content type guidelines:
- Educational: Focus on value, secrets, surprising facts
- Entertainment: Use POV, plot twists, unexpected outcomes
- Lifestyle: Personal stories, transformations, routines
- Comedy: Relatable situations, fails, unexpected results
- Motivational: Personal journeys, overcoming challenges
- Controversial: Unpopular opinions, contrarian takes

Hook principles:
1. Start with attention-grabbing words
2. Create curiosity or urgency
3. Promise value or entertainment
4. Use emotional triggers
5. Keep it concise and punchy
6. Include trending elements naturally`;

  const userPrompt = `Generate 10 viral hooks for this content:

Topic: ${request.topic}
Platform: ${request.platform}
Target Audience: ${request.targetAudience}
Content Type: ${request.contentType}
Tone: ${request.tone}
Duration: ${request.duration} seconds
Max Length: ${request.maxLength || PLATFORM_OPTIMIZATIONS[request.platform].maxLength} characters

Trending Elements to Include: ${trendingElements.join(', ')}
Include Emojis: ${request.includeEmojis ? 'Yes' : 'No'}
Include Questions: ${request.includeQuestions ? 'Yes' : 'No'}

Requirements:
- Each hook should be under ${request.maxLength || PLATFORM_OPTIMIZATIONS[request.platform].maxLength} characters
- Optimize for ${request.platform} algorithm
- Match ${request.tone} tone
- Target ${request.targetAudience}
- Include trending elements naturally
- Create curiosity and engagement

Provide 10 different hooks, each on a new line.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.9,
      max_tokens: 800,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No hooks generated');
    }

    return content.split('\n')
      .map(hook => hook.trim())
      .filter(hook => hook.length > 0)
      .slice(0, 10);
  } catch (error) {
    console.error('Error generating hooks with AI:', error);
    return generateFallbackHooks(request);
  }
}

// Generate fallback hooks using templates
function generateFallbackHooks(request: HookRequest): string[] {
  const templates = HOOK_TEMPLATES[request.contentType] || HOOK_TEMPLATES.educational;
  const platformOpts = PLATFORM_OPTIMIZATIONS[request.platform];
  
  return templates.slice(0, 5).map(template => {
    let hook = template
      .replace('{topic}', request.topic)
      .replace('{assumption}', 'simple')
      .replace('{authority}', 'experts')
      .replace('{timeframe}', '30 days')
      .replace('{surprise}', 'amazing')
      .replace('{realization}', 'incredible')
      .replace('{comedy_obstacle}', 'everything goes wrong')
      .replace('{unexpected_result}', 'it works perfectly')
      .replace('{funny_situation}', 'you have no idea what you\'re doing')
      .replace('{consequence}', 'everything')
      .replace('{controversial_view}', 'overrated');
    
    // Add trending elements
    if (request.includeTrendingElements && platformOpts.trendingElements.length > 0) {
      const trendingElement = platformOpts.trendingElements[Math.floor(Math.random() * platformOpts.trendingElements.length)];
      hook = `${trendingElement} ${hook}`;
    }
    
    // Add emojis
    if (request.includeEmojis && platformOpts.emojis.length > 0) {
      const emoji = platformOpts.emojis[Math.floor(Math.random() * platformOpts.emojis.length)];
      hook = `${hook} ${emoji}`;
    }
    
    return hook;
  });
}

// Score hooks for virality
async function scoreHooks(hooks: string[], request: HookRequest): Promise<Array<{
  text: string;
  viralityScore: number;
  engagementPrediction: number;
  reasoning: string;
  variations: string[];
  timing: { start: number; end: number };
}>> {
  const platformOpts = PLATFORM_OPTIMIZATIONS[request.platform];
  
  return hooks.map(hook => {
    const viralityScore = calculateViralityScore(hook, request, platformOpts);
    const engagementPrediction = calculateEngagementPrediction(hook, request);
    const reasoning = generateReasoning(hook, viralityScore, request);
    const variations = generateVariations(hook, request);
    
    return {
      text: hook,
      viralityScore,
      engagementPrediction,
      reasoning,
      variations,
      timing: {
        start: 0,
        end: request.duration
      }
    };
  }).sort((a, b) => b.viralityScore - a.viralityScore);
}

// Calculate virality score
function calculateViralityScore(hook: string, request: HookRequest, platformOpts: any): number {
  let score = 0;
  
  // Length optimization
  const optimalLength = platformOpts.maxLength;
  const lengthRatio = hook.length / optimalLength;
  if (lengthRatio <= 1) {
    score += 20;
  } else if (lengthRatio <= 1.2) {
    score += 10;
  }
  
  // Trending elements
  const trendingCount = platformOpts.trendingElements.filter((element: string) => 
    hook.toLowerCase().includes(element.toLowerCase())
  ).length;
  score += trendingCount * 15;
  
  // Emotional triggers
  const emotionalWords = ['amazing', 'incredible', 'shocking', 'secret', 'hidden', 'revealed', 'exposed', 'truth'];
  const emotionalCount = emotionalWords.filter(word => 
    hook.toLowerCase().includes(word)
  ).length;
  score += emotionalCount * 10;
  
  // Questions
  if (hook.includes('?')) {
    score += 15;
  }
  
  // Exclamation marks
  const exclamationCount = (hook.match(/!/g) || []).length;
  score += exclamationCount * 5;
  
  // Emojis
  const emojiCount = (hook.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
  score += emojiCount * 8;
  
  // Platform-specific bonuses
  if (request.platform === 'tiktok' && hook.includes('POV')) score += 20;
  if (request.platform === 'youtube' && hook.includes('secret')) score += 15;
  if (request.platform === 'instagram' && hook.includes('story')) score += 10;
  if (request.platform === 'twitter' && hook.includes('thread')) score += 15;
  
  return Math.min(100, Math.max(0, score));
}

// Calculate engagement prediction
function calculateEngagementPrediction(hook: string, request: HookRequest): number {
  let prediction = 50; // Base prediction
  
  // Curiosity factor
  if (hook.includes('?')) prediction += 20;
  if (hook.includes('secret') || hook.includes('hidden')) prediction += 15;
  if (hook.includes('wait') || hook.includes('until')) prediction += 10;
  
  // Emotional impact
  const emotionalWords = ['amazing', 'incredible', 'shocking', 'unbelievable'];
  const emotionalCount = emotionalWords.filter(word => 
    hook.toLowerCase().includes(word)
  ).length;
  prediction += emotionalCount * 10;
  
  // Personal connection
  if (hook.includes('I') || hook.includes('my') || hook.includes('me')) prediction += 10;
  
  // Controversy factor
  if (hook.includes('unpopular') || hook.includes('wrong') || hook.includes('truth')) prediction += 15;
  
  return Math.min(100, Math.max(0, prediction));
}

// Generate reasoning for score
function generateReasoning(hook: string, score: number, request: HookRequest): string {
  const reasons = [];
  
  if (score >= 80) {
    reasons.push('Excellent virality potential');
  } else if (score >= 60) {
    reasons.push('Good virality potential');
  } else if (score >= 40) {
    reasons.push('Moderate virality potential');
  } else {
    reasons.push('Low virality potential');
  }
  
  if (hook.includes('?')) {
    reasons.push('Includes question to drive engagement');
  }
  
  if (hook.includes('secret') || hook.includes('hidden')) {
    reasons.push('Creates curiosity with mystery element');
  }
  
  if (hook.length <= PLATFORM_OPTIMIZATIONS[request.platform].maxLength) {
    reasons.push('Optimal length for platform');
  }
  
  if (hook.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu)) {
    reasons.push('Uses emojis for visual appeal');
  }
  
  return reasons.join('. ') + '.';
}

// Generate variations of the hook
function generateVariations(hook: string, request: HookRequest): string[] {
  const variations = [];
  const platformOpts = PLATFORM_OPTIMIZATIONS[request.platform];
  
  // Add different trending elements
  platformOpts.trendingElements.slice(0, 2).forEach(element => {
    if (!hook.toLowerCase().includes(element.toLowerCase())) {
      variations.push(`${element} ${hook}`);
    }
  });
  
  // Add different emojis
  if (request.includeEmojis) {
    platformOpts.emojis.slice(0, 2).forEach(emoji => {
      if (!hook.includes(emoji)) {
        variations.push(`${hook} ${emoji}`);
      }
    });
  }
  
  // Change tone variations
  if (hook.includes('amazing')) {
    variations.push(hook.replace('amazing', 'incredible'));
  }
  if (hook.includes('secret')) {
    variations.push(hook.replace('secret', 'hidden truth'));
  }
  
  return variations.slice(0, 3);
}

// Get trending elements for platform
async function getTrendingElements(platform: string, topic: string): Promise<string[]> {
  // In a real implementation, fetch from trending APIs
  const trendingMap: Record<string, string[]> = {
    tiktok: ['POV', 'Plot twist', 'Wait until', 'This will', 'Did you know', 'CapCut', 'FYP'],
    youtube: ['Secret', 'Trick', 'Hack', 'Method', 'Technique', 'Tutorial', 'Guide'],
    instagram: ['Story', 'Journey', 'Transformation', 'Behind the scenes', 'Reel', 'Vibe'],
    twitter: ['Thread', 'Hot take', 'Unpopular opinion', 'Breaking', 'This will', 'Actually']
  };
  
  return trendingMap[platform] || trendingMap.tiktok;
}

// Generate platform optimizations
function generatePlatformOptimizations(request: HookRequest): string[] {
  const optimizations = [];
  const platformOpts = PLATFORM_OPTIMIZATIONS[request.platform];
  
  optimizations.push(`Optimized for ${request.platform} algorithm`);
  optimizations.push(`Target length: ${platformOpts.maxLength} characters`);
  optimizations.push(`Use trending elements: ${platformOpts.trendingElements.slice(0, 3).join(', ')}`);
  
  if (request.includeEmojis) {
    optimizations.push(`Include emojis: ${platformOpts.emojis.slice(0, 3).join(', ')}`);
  }
  
  optimizations.push(`Hook timing: ${platformOpts.timing.start}-${platformOpts.timing.end} seconds`);
  
  return optimizations;
}

// Generate suggestions
async function generateSuggestions(request: HookRequest, hooks: any[]): Promise<{
  improvements: string[];
  alternatives: string[];
  bestPractices: string[];
}> {
  const improvements = [];
  const alternatives = [];
  const bestPractices = [];
  
  // Analyze hooks for improvements
  const avgScore = calculateAverageScore(hooks);
  if (avgScore < 60) {
    improvements.push('Add more emotional triggers to increase engagement');
    improvements.push('Include trending elements specific to your platform');
    improvements.push('Create more curiosity with mystery or secrets');
  }
  
  if (hooks.some(hook => hook.text.length > PLATFORM_OPTIMIZATIONS[request.platform].maxLength)) {
    improvements.push('Shorten hooks to optimal platform length');
  }
  
  // Generate alternatives
  alternatives.push('Try different content types for variety');
  alternatives.push('Experiment with controversial takes');
  alternatives.push('Use personal stories and experiences');
  
  // Best practices
  bestPractices.push('Test multiple hooks and track performance');
  bestPractices.push('A/B test different emotional triggers');
  bestPractices.push('Keep hooks under 3 seconds for maximum impact');
  bestPractices.push('Use platform-specific trending language');
  
  return {
    improvements,
    alternatives,
    bestPractices
  };
}

// Calculate average score
function calculateAverageScore(hooks: any[]): number {
  if (hooks.length === 0) return 0;
  const total = hooks.reduce((sum, hook) => sum + hook.viralityScore, 0);
  return Math.round(total / hooks.length);
}
