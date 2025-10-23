import { openai } from './openai';

export interface BrollRequest {
  caption: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'twitter';
  contentType: 'educational' | 'entertainment' | 'lifestyle' | 'comedy' | 'motivational' | 'tutorial';
  duration: number; // in seconds
  style: 'cinematic' | 'documentary' | 'vlog' | 'tutorial' | 'comedy' | 'dramatic';
  mood: 'upbeat' | 'calm' | 'energetic' | 'mysterious' | 'inspiring' | 'funny';
  targetAudience: string;
  budget: 'low' | 'medium' | 'high';
  equipment: string[];
  location: string;
}

export interface BrollSuggestion {
  id: string;
  type: 'stock' | 'user_generated' | 'ai_generated' | 'practical';
  description: string;
  timing: {
    start: number;
    end: number;
  };
  purpose: string;
  visualElements: string[];
  cameraMovements: string[];
  lighting: string;
  colorPalette: string[];
  mood: string;
  sources: {
    stock: string[];
    ai: string[];
    practical: string[];
  };
  difficulty: 'easy' | 'medium' | 'hard';
  cost: 'free' | 'low' | 'medium' | 'high';
  alternatives: string[];
  tips: string[];
}

export interface BrollResponse {
  suggestions: BrollSuggestion[];
  totalDuration: number;
  coverage: number; // percentage of video covered
  style: string;
  mood: string;
  recommendations: {
    improvements: string[];
    alternatives: string[];
    bestPractices: string[];
  };
  metadata: {
    generatedAt: Date;
    platform: string;
    contentType: string;
    estimatedCost: string;
  };
}

// B-roll templates for different content types
export const BROLL_TEMPLATES = {
  educational: {
    common: [
      'Close-up of hands demonstrating technique',
      'Wide shot of workspace/studio',
      'Split screen showing before/after',
      'Overhead shot of materials/tools',
      'Time-lapse of process',
      'Detail shots of key elements',
      'Reaction shots of audience/students',
      'Establishing shot of learning environment'
    ],
    cameraMovements: ['Static', 'Slow zoom', 'Pan left/right', 'Tilt up/down'],
    lighting: 'Natural or soft studio lighting',
    colorPalette: ['Blue', 'Green', 'White', 'Gray']
  },
  entertainment: {
    common: [
      'Reaction shots with exaggerated expressions',
      'Quick cuts between different angles',
      'Slow motion for dramatic effect',
      'Wide shots for context',
      'Close-ups for emotional impact',
      'Behind-the-scenes moments',
      'Candid shots of people laughing',
      'Action sequences'
    ],
    cameraMovements: ['Quick cuts', 'Dynamic movements', 'Handheld', 'Tracking shots'],
    lighting: 'Bright, colorful lighting',
    colorPalette: ['Bright colors', 'High contrast', 'Vibrant tones']
  },
  lifestyle: {
    common: [
      'Lifestyle shots of daily routines',
      'Product shots in natural settings',
      'Environmental shots of locations',
      'People in their natural environment',
      'Food and drink preparation',
      'Fashion and style shots',
      'Home and interior shots',
      'Outdoor activities'
    ],
    cameraMovements: ['Smooth, steady shots', 'Gentle movements', 'Natural handheld'],
    lighting: 'Natural lighting, golden hour',
    colorPalette: ['Warm tones', 'Natural colors', 'Soft pastels']
  },
  comedy: {
    common: [
      'Reaction shots with comedic timing',
      'Physical comedy sequences',
      'Props and visual gags',
      'Facial expressions and gestures',
      'Unexpected angles and perspectives',
      'Quick cuts for comedic effect',
      'Behind-the-scenes bloopers',
      'Exaggerated movements'
    ],
    cameraMovements: ['Quick cuts', 'Unusual angles', 'Dynamic movements'],
    lighting: 'Bright, even lighting',
    colorPalette: ['Bright, cheerful colors', 'High contrast']
  },
  motivational: {
    common: [
      'Inspiring landscapes and nature',
      'People achieving goals',
      'Success montages',
      'Before and after transformations',
      'Teamwork and collaboration',
      'Overcoming challenges',
      'Celebration moments',
      'Aspirational lifestyle shots'
    ],
    cameraMovements: ['Sweeping movements', 'Slow motion', 'Cinematic shots'],
    lighting: 'Dramatic lighting, golden hour',
    colorPalette: ['Warm, inspiring colors', 'Golden tones']
  },
  tutorial: {
    common: [
      'Step-by-step process shots',
      'Tool and equipment close-ups',
      'Hands demonstrating techniques',
      'Screen recordings and graphics',
      'Before and after comparisons',
      'Safety demonstrations',
      'Troubleshooting scenarios',
      'Final result showcases'
    ],
    cameraMovements: ['Static shots', 'Slow, deliberate movements'],
    lighting: 'Clear, even lighting',
    colorPalette: ['Clean, professional colors']
  }
};

// Generate B-roll recommendations
export async function generateBrollRecommendations(request: BrollRequest): Promise<BrollResponse> {
  try {
    // Analyze caption for key themes and visual elements
    const visualAnalysis = await analyzeCaptionForVisuals(request.caption, request.contentType);
    
    // Generate B-roll suggestions using AI
    const suggestions = await generateBrollSuggestions(request, visualAnalysis);
    
    // Calculate coverage and timing
    const totalDuration = calculateTotalDuration(suggestions);
    const coverage = calculateCoverage(totalDuration, request.duration);
    
    // Generate recommendations
    const recommendations = await generateBrollRecommendations(request, suggestions);
    
    return {
      suggestions,
      totalDuration,
      coverage,
      style: request.style,
      mood: request.mood,
      recommendations,
      metadata: {
        generatedAt: new Date(),
        platform: request.platform,
        contentType: request.contentType,
        estimatedCost: calculateEstimatedCost(suggestions)
      }
    };
  } catch (error) {
    console.error('Error generating B-roll recommendations:', error);
    throw new Error('Failed to generate B-roll recommendations');
  }
}

// Analyze caption for visual elements
async function analyzeCaptionForVisuals(caption: string, contentType: string): Promise<{
  themes: string[];
  emotions: string[];
  actions: string[];
  objects: string[];
  settings: string[];
}> {
  const systemPrompt = `You are an expert video editor and content strategist. Analyze the given caption to identify visual elements that would make compelling B-roll footage.

Focus on:
- Key themes and concepts
- Emotional tone and mood
- Actions and movements
- Objects and props
- Settings and locations

Return a JSON object with arrays for themes, emotions, actions, objects, and settings.`;

  const userPrompt = `Analyze this caption for B-roll opportunities:

Caption: "${caption}"
Content Type: ${contentType}

Identify visual elements that would enhance this content with compelling B-roll footage.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No visual analysis generated');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing caption for visuals:', error);
    return {
      themes: ['general'],
      emotions: ['neutral'],
      actions: ['demonstration'],
      objects: ['tools'],
      settings: ['workspace']
    };
  }
}

// Generate B-roll suggestions using AI
async function generateBrollSuggestions(
  request: BrollRequest, 
  visualAnalysis: any
): Promise<BrollSuggestion[]> {
  const systemPrompt = `You are an expert video editor and B-roll specialist. Generate specific B-roll suggestions for the given content.

Consider:
- Platform-specific requirements (TikTok, YouTube, Instagram, Twitter)
- Content type and style
- Target audience and mood
- Budget and equipment constraints
- Timing and pacing
- Visual storytelling principles

For each suggestion, provide:
- Type (stock, user_generated, ai_generated, practical)
- Description of the shot
- Timing (start/end seconds)
- Purpose and visual elements
- Camera movements and lighting
- Difficulty and cost
- Alternatives and tips`;

  const userPrompt = `Generate B-roll suggestions for this content:

Caption: "${request.caption}"
Platform: ${request.platform}
Content Type: ${request.contentType}
Duration: ${request.duration} seconds
Style: ${request.style}
Mood: ${request.mood}
Target Audience: ${request.targetAudience}
Budget: ${request.budget}
Equipment: ${request.equipment.join(', ')}
Location: ${request.location}

Visual Analysis:
- Themes: ${visualAnalysis.themes.join(', ')}
- Emotions: ${visualAnalysis.emotions.join(', ')}
- Actions: ${visualAnalysis.actions.join(', ')}
- Objects: ${visualAnalysis.objects.join(', ')}
- Settings: ${visualAnalysis.settings.join(', ')}

Generate 8-12 specific B-roll suggestions that would enhance this content.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No B-roll suggestions generated');
    }

    const data = JSON.parse(content);
    return (data.suggestions || []).map((suggestion: any, index: number) => ({
      id: `broll_${Date.now()}_${index}`,
      type: suggestion.type || 'stock',
      description: suggestion.description || '',
      timing: suggestion.timing || { start: 0, end: 5 },
      purpose: suggestion.purpose || '',
      visualElements: suggestion.visualElements || [],
      cameraMovements: suggestion.cameraMovements || [],
      lighting: suggestion.lighting || 'Natural',
      colorPalette: suggestion.colorPalette || [],
      mood: suggestion.mood || request.mood,
      sources: suggestion.sources || {
        stock: [],
        ai: [],
        practical: []
      },
      difficulty: suggestion.difficulty || 'easy',
      cost: suggestion.cost || 'free',
      alternatives: suggestion.alternatives || [],
      tips: suggestion.tips || []
    }));
  } catch (error) {
    console.error('Error generating B-roll suggestions:', error);
    return generateFallbackBrollSuggestions(request);
  }
}

// Generate fallback B-roll suggestions
function generateFallbackBrollSuggestions(request: BrollRequest): BrollSuggestion[] {
  const templates = BROLL_TEMPLATES[request.contentType] || BROLL_TEMPLATES.educational;
  const suggestions: BrollSuggestion[] = [];
  
  // Generate 6-8 suggestions based on templates
  const commonShots = templates.common.slice(0, 6);
  
  commonShots.forEach((shot, index) => {
    const startTime = index * (request.duration / commonShots.length);
    const endTime = startTime + (request.duration / commonShots.length);
    
    suggestions.push({
      id: `broll_${Date.now()}_${index}`,
      type: 'stock',
      description: shot,
      timing: { start: startTime, end: endTime },
      purpose: 'Visual enhancement and context',
      visualElements: [shot],
      cameraMovements: templates.cameraMovements.slice(0, 2),
      lighting: templates.lighting,
      colorPalette: templates.colorPalette,
      mood: request.mood,
      sources: {
        stock: ['Unsplash', 'Pexels', 'Pixabay'],
        ai: ['DALL-E', 'Midjourney', 'Stable Diffusion'],
        practical: ['User-generated', 'Professional shoot']
      },
      difficulty: 'easy',
      cost: 'free',
      alternatives: [shot.replace('Close-up', 'Wide shot'), shot.replace('Wide shot', 'Close-up')],
      tips: ['Ensure good lighting', 'Keep camera steady', 'Match the mood of the content']
    });
  });
  
  return suggestions;
}

// Calculate total duration of B-roll suggestions
function calculateTotalDuration(suggestions: BrollSuggestion[]): number {
  return suggestions.reduce((total, suggestion) => {
    return total + (suggestion.timing.end - suggestion.timing.start);
  }, 0);
}

// Calculate coverage percentage
function calculateCoverage(totalDuration: number, videoDuration: number): number {
  return Math.min(100, Math.round((totalDuration / videoDuration) * 100));
}

// Generate recommendations
async function generateBrollRecommendations(
  request: BrollRequest, 
  suggestions: BrollSuggestion[]
): Promise<{
  improvements: string[];
  alternatives: string[];
  bestPractices: string[];
}> {
  const improvements = [];
  const alternatives = [];
  const bestPractices = [];
  
  // Analyze suggestions for improvements
  const stockCount = suggestions.filter(s => s.type === 'stock').length;
  const practicalCount = suggestions.filter(s => s.type === 'practical').length;
  
  if (stockCount > practicalCount) {
    improvements.push('Consider adding more practical/user-generated B-roll for authenticity');
  }
  
  if (suggestions.length < 6) {
    improvements.push('Add more B-roll suggestions for better coverage');
  }
  
  // Generate alternatives
  alternatives.push('Use AI-generated visuals for unique content');
  alternatives.push('Create user-generated content with your audience');
  alternatives.push('Mix stock footage with original content');
  
  // Best practices
  bestPractices.push('Plan B-roll shots before filming');
  bestPractices.push('Use consistent lighting and color grading');
  bestPractices.push('Match B-roll mood to main content');
  bestPractices.push('Keep B-roll shots short and impactful');
  bestPractices.push('Use B-roll to support your narrative');
  
  return {
    improvements,
    alternatives,
    bestPractices
  };
}

// Calculate estimated cost
function calculateEstimatedCost(suggestions: BrollSuggestion[]): string {
  const costMap = {
    'free': 0,
    'low': 10,
    'medium': 50,
    'high': 100
  };
  
  const totalCost = suggestions.reduce((total, suggestion) => {
    return total + costMap[suggestion.cost];
  }, 0);
  
  if (totalCost === 0) return 'Free';
  if (totalCost <= 50) return 'Low ($0-50)';
  if (totalCost <= 200) return 'Medium ($50-200)';
  return 'High ($200+)';
}

// Generate B-roll for specific content types
export const generateBrollForContentType = {
  tutorial: async (caption: string, platform: string, duration: number): Promise<BrollResponse> => {
    return generateBrollRecommendations({
      caption,
      platform: platform as any,
      contentType: 'tutorial',
      duration,
      style: 'tutorial',
      mood: 'neutral',
      targetAudience: 'learners',
      budget: 'medium',
      equipment: ['camera', 'tripod', 'lighting'],
      location: 'studio'
    });
  },
  
  lifestyle: async (caption: string, platform: string, duration: number): Promise<BrollResponse> => {
    return generateBrollRecommendations({
      caption,
      platform: platform as any,
      contentType: 'lifestyle',
      duration,
      style: 'vlog',
      mood: 'upbeat',
      targetAudience: 'lifestyle enthusiasts',
      budget: 'low',
      equipment: ['smartphone', 'gimbal'],
      location: 'home'
    });
  },
  
  motivational: async (caption: string, platform: string, duration: number): Promise<BrollResponse> => {
    return generateBrollRecommendations({
      caption,
      platform: platform as any,
      contentType: 'motivational',
      duration,
      style: 'cinematic',
      mood: 'inspiring',
      targetAudience: 'motivated individuals',
      budget: 'medium',
      equipment: ['camera', 'drone', 'gimbal'],
      location: 'outdoor'
    });
  }
};

// Get B-roll sources by type
export function getBrollSources(type: string): {
  stock: string[];
  ai: string[];
  practical: string[];
} {
  const sources = {
    stock: [
      'Unsplash',
      'Pexels',
      'Pixabay',
      'Shutterstock',
      'Getty Images',
      'Adobe Stock',
      'Freepik',
      'Videvo'
    ],
    ai: [
      'DALL-E 3',
      'Midjourney',
      'Stable Diffusion',
      'RunwayML',
      'Pika Labs',
      'Synthesia',
      'Luma AI',
      'Krea AI'
    ],
    practical: [
      'User-generated content',
      'Professional shoot',
      'Behind-the-scenes',
      'B-roll library',
      'Archive footage',
      'Partner content',
      'Community submissions',
      'Crowdsourced footage'
    ]
  };
  
  return sources;
}

// Batch B-roll generation
export async function generateBatchBroll(
  requests: Array<{ caption: string; platform: string; duration: number; contentType: string }>
): Promise<BrollResponse[]> {
  const results: BrollResponse[] = [];
  
  // Process in parallel with rate limiting
  const batchSize = 3;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchPromises = batch.map(request => 
      generateBrollRecommendations({
        caption: request.caption,
        platform: request.platform as any,
        contentType: request.contentType as any,
        duration: request.duration,
        style: 'cinematic',
        mood: 'neutral',
        targetAudience: 'general',
        budget: 'medium',
        equipment: ['camera'],
        location: 'studio'
      })
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Rate limiting delay
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}
