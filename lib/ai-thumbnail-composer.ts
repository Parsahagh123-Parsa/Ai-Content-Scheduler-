import { openai } from './openai';

export interface ThumbnailRequest {
  title: string;
  caption: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'twitter';
  contentType: 'educational' | 'entertainment' | 'lifestyle' | 'comedy' | 'motivational' | 'tutorial';
  style: 'minimalist' | 'bold' | 'vintage' | 'modern' | 'artistic' | 'corporate';
  mood: 'energetic' | 'calm' | 'mysterious' | 'inspiring' | 'funny' | 'professional';
  targetAudience: string;
  brandColors?: string[];
  includeText: boolean;
  textStyle: 'bold' | 'elegant' | 'playful' | 'serious';
  dimensions: {
    width: number;
    height: number;
  };
  budget: 'low' | 'medium' | 'high';
}

export interface ThumbnailSuggestion {
  id: string;
  title: string;
  description: string;
  prompt: string;
  style: string;
  mood: string;
  colors: string[];
  composition: string;
  textOverlay: {
    text: string;
    position: 'top' | 'center' | 'bottom';
    size: 'small' | 'medium' | 'large';
    color: string;
    font: string;
  };
  elements: string[];
  ctrOptimization: {
    score: number;
    factors: string[];
    improvements: string[];
  };
  generation: {
    method: 'ai' | 'stock' | 'custom' | 'template';
    tools: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    time: number; // in minutes
    cost: 'free' | 'low' | 'medium' | 'high';
  };
  alternatives: string[];
  tips: string[];
}

export interface ThumbnailResponse {
  suggestions: ThumbnailSuggestion[];
  bestPerformer: ThumbnailSuggestion;
  ctrPrediction: number;
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
    estimatedCTR: number;
  };
}

// Thumbnail templates for different platforms
export const THUMBNAIL_TEMPLATES = {
  youtube: {
    dimensions: { width: 1280, height: 720 },
    textSize: 'large',
    composition: 'rule of thirds',
    elements: ['face', 'text', 'background', 'logo'],
    colors: ['bright', 'high contrast', 'vibrant']
  },
  tiktok: {
    dimensions: { width: 1080, height: 1920 },
    textSize: 'medium',
    composition: 'vertical center',
    elements: ['face', 'text', 'trending elements'],
    colors: ['bold', 'trending', 'eye-catching']
  },
  instagram: {
    dimensions: { width: 1080, height: 1080 },
    textSize: 'medium',
    composition: 'center',
    elements: ['aesthetic', 'brand', 'text'],
    colors: ['cohesive', 'brand colors', 'aesthetic']
  },
  twitter: {
    dimensions: { width: 1200, height: 675 },
    textSize: 'small',
    composition: 'left aligned',
    elements: ['text', 'minimal', 'clean'],
    colors: ['professional', 'clean', 'readable']
  }
};

// CTR optimization factors
export const CTR_FACTORS = {
  high: [
    'Clear, readable text',
    'High contrast colors',
    'Emotional facial expressions',
    'Bold, eye-catching design',
    'Trending visual elements',
    'Professional quality',
    'Brand consistency',
    'Mobile-optimized'
  ],
  medium: [
    'Good color scheme',
    'Decent text visibility',
    'Appropriate mood',
    'Platform-specific design',
    'Relevant imagery',
    'Clean composition'
  ],
  low: [
    'Poor text readability',
    'Low contrast',
    'Generic design',
    'Outdated style',
    'Poor quality',
    'Inappropriate mood',
    'Cluttered composition'
  ]
};

// Generate thumbnail suggestions
export async function generateThumbnailSuggestions(request: ThumbnailRequest): Promise<ThumbnailResponse> {
  try {
    // Analyze content for thumbnail opportunities
    const contentAnalysis = await analyzeContentForThumbnails(request);
    
    // Generate thumbnail suggestions using AI
    const suggestions = await generateThumbnailSuggestionsWithAI(request, contentAnalysis);
    
    // Calculate CTR predictions
    const ctrPredictions = await calculateCTRPredictions(suggestions, request);
    
    // Find best performer
    const bestPerformer = findBestPerformer(suggestions);
    
    // Generate recommendations
    const recommendations = await generateThumbnailRecommendations(request, suggestions);
    
    return {
      suggestions,
      bestPerformer,
      ctrPrediction: bestPerformer.ctrOptimization.score,
      style: request.style,
      mood: request.mood,
      recommendations,
      metadata: {
        generatedAt: new Date(),
        platform: request.platform,
        contentType: request.contentType,
        estimatedCTR: bestPerformer.ctrOptimization.score
      }
    };
  } catch (error) {
    console.error('Error generating thumbnail suggestions:', error);
    throw new Error('Failed to generate thumbnail suggestions');
  }
}

// Analyze content for thumbnail opportunities
async function analyzeContentForThumbnails(request: ThumbnailRequest): Promise<{
  keyWords: string[];
  emotions: string[];
  themes: string[];
  visualElements: string[];
  targetAudience: string;
}> {
  const systemPrompt = `You are an expert thumbnail designer and CTR optimization specialist. Analyze the given content to identify the best visual elements for a high-performing thumbnail.

Focus on:
- Key words and phrases that should be highlighted
- Emotional triggers that drive clicks
- Visual themes and concepts
- Elements that appeal to the target audience
- Platform-specific optimization opportunities

Return a JSON object with arrays for keyWords, emotions, themes, visualElements, and targetAudience insights.`;

  const userPrompt = `Analyze this content for thumbnail optimization:

Title: "${request.title}"
Caption: "${request.caption}"
Platform: ${request.platform}
Content Type: ${request.contentType}
Target Audience: ${request.targetAudience}
Style: ${request.style}
Mood: ${request.mood}

Identify the best visual elements and strategies for a high-CTR thumbnail.`;

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
      throw new Error('No content analysis generated');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing content for thumbnails:', error);
    return {
      keyWords: [request.title.split(' ').slice(0, 3)],
      emotions: [request.mood],
      themes: [request.contentType],
      visualElements: ['text', 'background', 'face'],
      targetAudience: request.targetAudience
    };
  }
}

// Generate thumbnail suggestions using AI
async function generateThumbnailSuggestionsWithAI(
  request: ThumbnailRequest,
  contentAnalysis: any
): Promise<ThumbnailSuggestion[]> {
  const systemPrompt = `You are an expert thumbnail designer and CTR optimization specialist. Generate specific thumbnail suggestions that will maximize click-through rates.

Consider:
- Platform-specific requirements and best practices
- CTR optimization factors (contrast, text readability, emotional triggers)
- Target audience preferences
- Content type and mood
- Brand consistency and style
- Technical specifications and constraints

For each suggestion, provide:
- Detailed description and visual prompt
- Style and mood specifications
- Color palette and composition
- Text overlay details
- CTR optimization score and factors
- Generation method and tools
- Difficulty, time, and cost estimates
- Alternatives and tips`;

  const userPrompt = `Generate thumbnail suggestions for this content:

Title: "${request.title}"
Caption: "${request.caption}"
Platform: ${request.platform}
Content Type: ${request.contentType}
Style: ${request.style}
Mood: ${request.mood}
Target Audience: ${request.targetAudience}
Dimensions: ${request.dimensions.width}x${request.dimensions.height}
Include Text: ${request.includeText}
Text Style: ${request.textStyle}
Budget: ${request.budget}

Content Analysis:
- Key Words: ${contentAnalysis.keyWords.join(', ')}
- Emotions: ${contentAnalysis.emotions.join(', ')}
- Themes: ${contentAnalysis.themes.join(', ')}
- Visual Elements: ${contentAnalysis.visualElements.join(', ')}
- Target Audience: ${contentAnalysis.targetAudience}

Generate 6-8 specific thumbnail suggestions optimized for high CTR.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No thumbnail suggestions generated');
    }

    const data = JSON.parse(content);
    return (data.suggestions || []).map((suggestion: any, index: number) => ({
      id: `thumb_${Date.now()}_${index}`,
      title: suggestion.title || `Thumbnail ${index + 1}`,
      description: suggestion.description || '',
      prompt: suggestion.prompt || '',
      style: suggestion.style || request.style,
      mood: suggestion.mood || request.mood,
      colors: suggestion.colors || ['#FF0000', '#00FF00', '#0000FF'],
      composition: suggestion.composition || 'center',
      textOverlay: suggestion.textOverlay || {
        text: request.title,
        position: 'center',
        size: 'medium',
        color: '#FFFFFF',
        font: 'bold'
      },
      elements: suggestion.elements || [],
      ctrOptimization: suggestion.ctrOptimization || {
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        factors: ['High contrast', 'Clear text', 'Emotional appeal'],
        improvements: ['Increase contrast', 'Add trending elements']
      },
      generation: suggestion.generation || {
        method: 'ai',
        tools: ['DALL-E', 'Midjourney'],
        difficulty: 'medium',
        time: 15,
        cost: 'low'
      },
      alternatives: suggestion.alternatives || [],
      tips: suggestion.tips || []
    }));
  } catch (error) {
    console.error('Error generating thumbnail suggestions with AI:', error);
    return generateFallbackThumbnailSuggestions(request);
  }
}

// Generate fallback thumbnail suggestions
function generateFallbackThumbnailSuggestions(request: ThumbnailRequest): ThumbnailSuggestion[] {
  const suggestions: ThumbnailSuggestion[] = [];
  const platformTemplate = THUMBNAIL_TEMPLATES[request.platform];
  
  // Generate 6 suggestions based on different approaches
  const approaches = [
    'Bold text with high contrast background',
    'Face close-up with emotional expression',
    'Split screen with before/after',
    'Minimalist design with key text',
    'Action shot with dynamic elements',
    'Brand-focused with logo placement'
  ];
  
  approaches.forEach((approach, index) => {
    suggestions.push({
      id: `thumb_${Date.now()}_${index}`,
      title: `Thumbnail ${index + 1}`,
      description: approach,
      prompt: `Create a ${request.style} thumbnail for "${request.title}" with ${approach}. Style: ${request.style}, Mood: ${request.mood}, Platform: ${request.platform}`,
      style: request.style,
      mood: request.mood,
      colors: request.brandColors || ['#FF0000', '#00FF00', '#0000FF'],
      composition: platformTemplate.composition,
      textOverlay: {
        text: request.title,
        position: 'center',
        size: platformTemplate.textSize as any,
        color: '#FFFFFF',
        font: request.textStyle
      },
      elements: platformTemplate.elements,
      ctrOptimization: {
        score: Math.floor(Math.random() * 30) + 70, // 70-100
        factors: ['High contrast', 'Clear text', 'Emotional appeal'],
        improvements: ['Increase contrast', 'Add trending elements']
      },
      generation: {
        method: 'ai',
        tools: ['DALL-E', 'Midjourney'],
        difficulty: 'medium',
        time: 15,
        cost: 'low'
      },
      alternatives: [approach.replace('Bold', 'Minimalist'), approach.replace('Face', 'Text')],
      tips: ['Ensure mobile readability', 'Test on different devices', 'A/B test variations']
    });
  });
  
  return suggestions;
}

// Calculate CTR predictions
async function calculateCTRPredictions(suggestions: ThumbnailSuggestion[], request: ThumbnailRequest): Promise<void> {
  // This would typically use a machine learning model trained on thumbnail performance data
  // For now, we'll use a simple scoring system based on known CTR factors
  
  suggestions.forEach(suggestion => {
    let score = 50; // Base score
    
    // Platform-specific bonuses
    if (request.platform === 'youtube' && suggestion.elements.includes('face')) score += 20;
    if (request.platform === 'tiktok' && suggestion.elements.includes('trending')) score += 15;
    if (request.platform === 'instagram' && suggestion.elements.includes('aesthetic')) score += 10;
    
    // Style bonuses
    if (suggestion.style === 'bold') score += 15;
    if (suggestion.mood === 'energetic') score += 10;
    
    // Text readability
    if (suggestion.textOverlay.size === 'large') score += 10;
    if (suggestion.textOverlay.color === '#FFFFFF') score += 5;
    
    // Contrast and visibility
    if (suggestion.colors.length >= 2) score += 5;
    
    suggestion.ctrOptimization.score = Math.min(100, Math.max(0, score));
  });
}

// Find best performing thumbnail
function findBestPerformer(suggestions: ThumbnailSuggestion[]): ThumbnailSuggestion {
  return suggestions.reduce((best, current) => 
    current.ctrOptimization.score > best.ctrOptimization.score ? current : best
  );
}

// Generate recommendations
async function generateThumbnailRecommendations(
  request: ThumbnailRequest,
  suggestions: ThumbnailSuggestion[]
): Promise<{
  improvements: string[];
  alternatives: string[];
  bestPractices: string[];
}> {
  const improvements = [];
  const alternatives = [];
  const bestPractices = [];
  
  // Analyze suggestions for improvements
  const avgScore = suggestions.reduce((sum, s) => sum + s.ctrOptimization.score, 0) / suggestions.length;
  
  if (avgScore < 70) {
    improvements.push('Increase contrast and text readability');
    improvements.push('Add emotional triggers and facial expressions');
    improvements.push('Use trending visual elements');
  }
  
  if (request.platform === 'youtube' && !suggestions.some(s => s.elements.includes('face'))) {
    improvements.push('Include human faces for YouTube thumbnails');
  }
  
  if (request.platform === 'tiktok' && !suggestions.some(s => s.elements.includes('trending'))) {
    improvements.push('Add trending elements for TikTok');
  }
  
  // Generate alternatives
  alternatives.push('A/B test different text overlays');
  alternatives.push('Try different color schemes');
  alternatives.push('Experiment with composition styles');
  alternatives.push('Test with and without faces');
  
  // Best practices
  bestPractices.push('Use high contrast colors for mobile viewing');
  bestPractices.push('Keep text large and readable on small screens');
  bestPractices.push('Test thumbnails on different devices');
  bestPractices.push('A/B test multiple variations');
  bestPractices.push('Match thumbnail mood to content mood');
  bestPractices.push('Use consistent branding elements');
  
  return {
    improvements,
    alternatives,
    bestPractices
  };
}

// Generate thumbnails for specific content types
export const generateThumbnailsForContentType = {
  tutorial: async (title: string, platform: string): Promise<ThumbnailResponse> => {
    return generateThumbnailSuggestions({
      title,
      caption: title,
      platform: platform as any,
      contentType: 'tutorial',
      style: 'modern',
      mood: 'professional',
      targetAudience: 'learners',
      includeText: true,
      textStyle: 'bold',
      dimensions: THUMBNAIL_TEMPLATES[platform as keyof typeof THUMBNAIL_TEMPLATES]?.dimensions || { width: 1280, height: 720 },
      budget: 'medium'
    });
  },
  
  entertainment: async (title: string, platform: string): Promise<ThumbnailResponse> => {
    return generateThumbnailSuggestions({
      title,
      caption: title,
      platform: platform as any,
      contentType: 'entertainment',
      style: 'bold',
      mood: 'energetic',
      targetAudience: 'entertainment seekers',
      includeText: true,
      textStyle: 'playful',
      dimensions: THUMBNAIL_TEMPLATES[platform as keyof typeof THUMBNAIL_TEMPLATES]?.dimensions || { width: 1280, height: 720 },
      budget: 'low'
    });
  },
  
  motivational: async (title: string, platform: string): Promise<ThumbnailResponse> => {
    return generateThumbnailSuggestions({
      title,
      caption: title,
      platform: platform as any,
      contentType: 'motivational',
      style: 'artistic',
      mood: 'inspiring',
      targetAudience: 'motivated individuals',
      includeText: true,
      textStyle: 'elegant',
      dimensions: THUMBNAIL_TEMPLATES[platform as keyof typeof THUMBNAIL_TEMPLATES]?.dimensions || { width: 1280, height: 720 },
      budget: 'medium'
    });
  }
};

// Get thumbnail generation tools
export function getThumbnailGenerationTools(): {
  ai: string[];
  stock: string[];
  custom: string[];
  templates: string[];
} {
  return {
    ai: [
      'DALL-E 3',
      'Midjourney',
      'Stable Diffusion',
      'RunwayML',
      'Krea AI',
      'Canva AI',
      'Adobe Firefly',
      'Leonardo AI'
    ],
    stock: [
      'Unsplash',
      'Pexels',
      'Shutterstock',
      'Getty Images',
      'Adobe Stock',
      'Freepik',
      'Pixabay',
      'Vecteezy'
    ],
    custom: [
      'Photoshop',
      'Figma',
      'Canva',
      'GIMP',
      'Sketch',
      'Adobe Illustrator',
      'Procreate',
      'Affinity Designer'
    ],
    templates: [
      'YouTube Thumbnail Templates',
      'TikTok Thumbnail Templates',
      'Instagram Thumbnail Templates',
      'Twitter Thumbnail Templates',
      'Custom Brand Templates',
      'A/B Test Templates',
      'Seasonal Templates',
      'Trending Templates'
    ]
  };
}

// Batch thumbnail generation
export async function generateBatchThumbnails(
  requests: Array<{ title: string; platform: string; contentType: string }>
): Promise<ThumbnailResponse[]> {
  const results: ThumbnailResponse[] = [];
  
  // Process in parallel with rate limiting
  const batchSize = 3;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchPromises = batch.map(request => 
      generateThumbnailSuggestions({
        title: request.title,
        caption: request.title,
        platform: request.platform as any,
        contentType: request.contentType as any,
        style: 'modern',
        mood: 'neutral',
        targetAudience: 'general',
        includeText: true,
        textStyle: 'bold',
        dimensions: { width: 1280, height: 720 },
        budget: 'medium'
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
