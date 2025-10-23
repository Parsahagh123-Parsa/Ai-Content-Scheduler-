import { openai } from './openai';

export interface SubtitleRequest {
  text: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'twitter';
  contentType: 'educational' | 'entertainment' | 'lifestyle' | 'comedy' | 'motivational' | 'tutorial';
  duration: number; // in seconds
  style: 'minimal' | 'bold' | 'elegant' | 'playful' | 'professional' | 'trending';
  mood: 'energetic' | 'calm' | 'dramatic' | 'funny' | 'inspiring' | 'neutral';
  language: string;
  includeEmojis: boolean;
  includeHashtags: boolean;
  maxLength: number;
  timing: 'auto' | 'manual' | 'sync';
  targetAudience: string;
}

export interface SubtitleSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  duration: number;
  style: {
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor?: string;
    position: 'top' | 'center' | 'bottom';
    alignment: 'left' | 'center' | 'right';
    animation?: string;
  };
  effects: string[];
  emphasis: boolean;
  confidence: number;
}

export interface SubtitleResponse {
  segments: SubtitleSegment[];
  totalDuration: number;
  style: string;
  mood: string;
  language: string;
  platform: string;
  recommendations: {
    improvements: string[];
    alternatives: string[];
    bestPractices: string[];
  };
  metadata: {
    generatedAt: Date;
    wordCount: number;
    averageWordsPerMinute: number;
    readabilityScore: number;
  };
}

// Subtitle templates for different platforms
export const SUBTITLE_TEMPLATES = {
  tiktok: {
    maxLength: 50,
    fontSize: 24,
    fontFamily: 'Arial Black',
    color: '#FFFFFF',
    backgroundColor: '#000000',
    position: 'center',
    alignment: 'center',
    animation: 'bounce',
    effects: ['outline', 'shadow', 'glow'],
    timing: 'fast'
  },
  youtube: {
    maxLength: 80,
    fontSize: 20,
    fontFamily: 'Arial',
    color: '#FFFFFF',
    backgroundColor: '#000000',
    position: 'bottom',
    alignment: 'center',
    animation: 'fade',
    effects: ['outline', 'shadow'],
    timing: 'medium'
  },
  instagram: {
    maxLength: 60,
    fontSize: 22,
    fontFamily: 'Helvetica',
    color: '#FFFFFF',
    backgroundColor: '#000000',
    position: 'center',
    alignment: 'center',
    animation: 'slide',
    effects: ['outline', 'shadow', 'gradient'],
    timing: 'medium'
  },
  twitter: {
    maxLength: 40,
    fontSize: 18,
    fontFamily: 'Arial',
    color: '#FFFFFF',
    backgroundColor: '#000000',
    position: 'bottom',
    alignment: 'left',
    animation: 'fade',
    effects: ['outline'],
    timing: 'fast'
  }
};

// Generate subtitles
export async function generateSubtitles(request: SubtitleRequest): Promise<SubtitleResponse> {
  try {
    // Analyze text for subtitle optimization
    const textAnalysis = await analyzeTextForSubtitles(request);
    
    // Generate subtitle segments using AI
    const segments = await generateSubtitleSegments(request, textAnalysis);
    
    // Calculate statistics
    const stats = calculateSubtitleStats(segments, request);
    
    // Generate recommendations
    const recommendations = await generateSubtitleRecommendations(request, segments);
    
    return {
      segments,
      totalDuration: request.duration,
      style: request.style,
      mood: request.mood,
      language: request.language,
      platform: request.platform,
      recommendations,
      metadata: {
        generatedAt: new Date(),
        wordCount: stats.wordCount,
        averageWordsPerMinute: stats.averageWordsPerMinute,
        readabilityScore: stats.readabilityScore
      }
    };
  } catch (error) {
    console.error('Error generating subtitles:', error);
    throw new Error('Failed to generate subtitles');
  }
}

// Analyze text for subtitle optimization
async function analyzeTextForSubtitles(request: SubtitleRequest): Promise<{
  sentences: string[];
  words: string[];
  emotionalWords: string[];
  keyPhrases: string[];
  pacing: 'slow' | 'medium' | 'fast';
  complexity: 'simple' | 'medium' | 'complex';
}> {
  const systemPrompt = `You are an expert subtitle designer and accessibility specialist. Analyze the given text to optimize it for subtitle display.

Focus on:
- Sentence structure and readability
- Emotional impact and key phrases
- Pacing and timing considerations
- Platform-specific requirements
- Accessibility and clarity

Return a JSON object with analysis results.`;

  const userPrompt = `Analyze this text for subtitle optimization:

Text: "${request.text}"
Platform: ${request.platform}
Content Type: ${request.contentType}
Duration: ${request.duration} seconds
Style: ${request.style}
Mood: ${request.mood}
Language: ${request.language}
Include Emojis: ${request.includeEmojis}
Include Hashtags: ${request.includeHashtags}
Max Length: ${request.maxLength} characters

Optimize for ${request.platform} subtitle display.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: "json_object" }
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No text analysis generated');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing text for subtitles:', error);
    return {
      sentences: request.text.split('.').filter(s => s.trim()),
      words: request.text.split(' '),
      emotionalWords: [],
      keyPhrases: [],
      pacing: 'medium',
      complexity: 'medium'
    };
  }
}

// Generate subtitle segments using AI
async function generateSubtitleSegments(
  request: SubtitleRequest,
  textAnalysis: any
): Promise<SubtitleSegment[]> {
  const systemPrompt = `You are an expert subtitle designer specializing in ${request.platform} content. Generate specific subtitle segments for the given text.

Consider:
- Platform-specific requirements and best practices
- Content type and target audience
- Style and mood requirements
- Timing and pacing
- Readability and accessibility
- Visual design and effects

For each segment, provide:
- Text content (optimized for length and readability)
- Start and end times
- Style specifications (font, color, position, animation)
- Effects and emphasis
- Confidence score (0-100)`;

  const userPrompt = `Generate subtitle segments for this text:

Text: "${request.text}"
Platform: ${request.platform}
Content Type: ${request.contentType}
Duration: ${request.duration} seconds
Style: ${request.style}
Mood: ${request.mood}
Language: ${request.language}
Include Emojis: ${request.includeEmojis}
Include Hashtags: ${request.includeHashtags}
Max Length: ${request.maxLength} characters

Text Analysis:
- Sentences: ${textAnalysis.sentences.length}
- Words: ${textAnalysis.words.length}
- Emotional Words: ${textAnalysis.emotionalWords.length}
- Key Phrases: ${textAnalysis.keyPhrases.length}
- Pacing: ${textAnalysis.pacing}
- Complexity: ${textAnalysis.complexity}

Generate 6-12 subtitle segments optimized for ${request.platform} engagement.`;

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
      throw new Error('No subtitle segments generated');
    }

    const data = JSON.parse(content);
    return (data.segments || []).map((segment: any, index: number) => ({
      id: `subtitle_${Date.now()}_${index}`,
      text: segment.text || '',
      startTime: segment.startTime || 0,
      endTime: segment.endTime || 3,
      duration: (segment.endTime || 3) - (segment.startTime || 0),
      style: {
        fontSize: segment.style?.fontSize || getPlatformFontSize(request.platform),
        fontFamily: segment.style?.fontFamily || getPlatformFontFamily(request.platform),
        color: segment.style?.color || '#FFFFFF',
        backgroundColor: segment.style?.backgroundColor || '#000000',
        position: segment.style?.position || 'center',
        alignment: segment.style?.alignment || 'center',
        animation: segment.style?.animation || 'fade'
      },
      effects: segment.effects || [],
      emphasis: segment.emphasis || false,
      confidence: segment.confidence || 80
    }));
  } catch (error) {
    console.error('Error generating subtitle segments:', error);
    return generateFallbackSubtitleSegments(request);
  }
}

// Generate fallback subtitle segments
function generateFallbackSubtitleSegments(request: SubtitleRequest): SubtitleSegment[] {
  const segments: SubtitleSegment[] = [];
  const template = SUBTITLE_TEMPLATES[request.platform];
  const words = request.text.split(' ');
  const wordsPerSegment = Math.ceil(words.length / 6); // 6 segments
  const segmentDuration = request.duration / 6;
  
  for (let i = 0; i < 6; i++) {
    const startWord = i * wordsPerSegment;
    const endWord = Math.min((i + 1) * wordsPerSegment, words.length);
    const text = words.slice(startWord, endWord).join(' ');
    
    if (text.trim()) {
      const startTime = i * segmentDuration;
      const endTime = (i + 1) * segmentDuration;
      
      segments.push({
        id: `subtitle_${Date.now()}_${i}`,
        text: text.trim(),
        startTime,
        endTime,
        duration: segmentDuration,
        style: {
          fontSize: template.fontSize,
          fontFamily: template.fontFamily,
          color: template.color,
          backgroundColor: template.backgroundColor,
          position: template.position as any,
          alignment: template.alignment as any,
          animation: template.animation
        },
        effects: template.effects,
        emphasis: false,
        confidence: 70
      });
    }
  }
  
  return segments;
}

// Get platform-specific font size
function getPlatformFontSize(platform: string): number {
  const sizes = {
    tiktok: 24,
    youtube: 20,
    instagram: 22,
    twitter: 18
  };
  
  return sizes[platform as keyof typeof sizes] || 20;
}

// Get platform-specific font family
function getPlatformFontFamily(platform: string): string {
  const families = {
    tiktok: 'Arial Black',
    youtube: 'Arial',
    instagram: 'Helvetica',
    twitter: 'Arial'
  };
  
  return families[platform as keyof typeof families] || 'Arial';
}

// Calculate subtitle statistics
function calculateSubtitleStats(segments: SubtitleSegment[], request: SubtitleRequest): {
  wordCount: number;
  averageWordsPerMinute: number;
  readabilityScore: number;
} {
  const wordCount = segments.reduce((total, segment) => {
    return total + segment.text.split(' ').length;
  }, 0);
  
  const averageWordsPerMinute = (wordCount / request.duration) * 60;
  
  // Simple readability score based on word length and sentence structure
  const averageWordLength = segments.reduce((total, segment) => {
    const words = segment.text.split(' ');
    const wordLengths = words.map(word => word.length);
    return total + wordLengths.reduce((sum, length) => sum + length, 0) / words.length;
  }, 0) / segments.length;
  
  const readabilityScore = Math.max(0, Math.min(100, 100 - (averageWordLength - 4) * 10));
  
  return {
    wordCount,
    averageWordsPerMinute,
    readabilityScore
  };
}

// Generate recommendations
async function generateSubtitleRecommendations(
  request: SubtitleRequest,
  segments: SubtitleSegment[]
): Promise<{
  improvements: string[];
  alternatives: string[];
  bestPractices: string[];
}> {
  const improvements = [];
  const alternatives = [];
  const bestPractices = [];
  
  // Analyze segments for improvements
  const avgConfidence = segments.reduce((sum, s) => sum + s.confidence, 0) / segments.length;
  
  if (avgConfidence < 70) {
    improvements.push('Improve text clarity and readability');
    improvements.push('Optimize timing for better pacing');
    improvements.push('Add more visual emphasis for key points');
  }
  
  if (request.platform === 'tiktok' && !segments.some(s => s.effects.includes('outline'))) {
    improvements.push('Add outline effects for better visibility on TikTok');
  }
  
  if (request.platform === 'youtube' && !segments.some(s => s.style.position === 'bottom')) {
    improvements.push('Position subtitles at bottom for YouTube');
  }
  
  // Generate alternatives
  alternatives.push('Try different font styles and colors');
  alternatives.push('Experiment with animation effects');
  alternatives.push('Test different positioning options');
  alternatives.push('A/B test with and without emojis');
  
  // Best practices
  bestPractices.push('Keep subtitles under 2 lines per segment');
  bestPractices.push('Use high contrast colors for readability');
  bestPractices.push('Match subtitle style to content mood');
  bestPractices.push('Test subtitles on mobile devices');
  bestPractices.push('Ensure subtitles are accessible to all users');
  bestPractices.push('Use consistent timing and pacing');
  
  return {
    improvements,
    alternatives,
    bestPractices
  };
}

// Generate subtitles for specific content types
export const generateSubtitlesForContentType = {
  tutorial: async (text: string, platform: string, duration: number): Promise<SubtitleResponse> => {
    return generateSubtitles({
      text,
      platform: platform as any,
      contentType: 'tutorial',
      duration,
      style: 'professional',
      mood: 'neutral',
      language: 'en',
      includeEmojis: false,
      includeHashtags: false,
      maxLength: 80,
      timing: 'auto',
      targetAudience: 'learners'
    });
  },
  
  entertainment: async (text: string, platform: string, duration: number): Promise<SubtitleResponse> => {
    return generateSubtitles({
      text,
      platform: platform as any,
      contentType: 'entertainment',
      duration,
      style: 'playful',
      mood: 'energetic',
      language: 'en',
      includeEmojis: true,
      includeHashtags: true,
      maxLength: 50,
      timing: 'auto',
      targetAudience: 'entertainment seekers'
    });
  },
  
  motivational: async (text: string, platform: string, duration: number): Promise<SubtitleResponse> => {
    return generateSubtitles({
      text,
      platform: platform as any,
      contentType: 'motivational',
      duration,
      style: 'elegant',
      mood: 'inspiring',
      language: 'en',
      includeEmojis: true,
      includeHashtags: false,
      maxLength: 60,
      timing: 'auto',
      targetAudience: 'motivated individuals'
    });
  }
};

// Get subtitle styles for platform
export function getSubtitleStyles(platform: string): {
  fonts: string[];
  colors: string[];
  animations: string[];
  effects: string[];
} {
  const styles = {
    tiktok: {
      fonts: ['Arial Black', 'Impact', 'Helvetica Bold'],
      colors: ['#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
      animations: ['bounce', 'pulse', 'shake', 'glow'],
      effects: ['outline', 'shadow', 'glow', 'gradient']
    },
    youtube: {
      fonts: ['Arial', 'Helvetica', 'Verdana'],
      colors: ['#FFFFFF', '#000000', '#FF0000', '#00FF00'],
      animations: ['fade', 'slide', 'zoom'],
      effects: ['outline', 'shadow', 'background']
    },
    instagram: {
      fonts: ['Helvetica', 'Arial', 'Georgia'],
      colors: ['#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4'],
      animations: ['fade', 'slide', 'bounce'],
      effects: ['outline', 'shadow', 'gradient', 'glow']
    },
    twitter: {
      fonts: ['Arial', 'Helvetica', 'Verdana'],
      colors: ['#FFFFFF', '#000000', '#1DA1F2'],
      animations: ['fade', 'slide'],
      effects: ['outline', 'shadow']
    }
  };
  
  return styles[platform as keyof typeof styles] || styles.youtube;
}

// Batch subtitle generation
export async function generateBatchSubtitles(
  requests: Array<{ text: string; platform: string; duration: number; contentType: string }>
): Promise<SubtitleResponse[]> {
  const results: SubtitleResponse[] = [];
  
  // Process in parallel with rate limiting
  const batchSize = 3;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchPromises = batch.map(request => 
      generateSubtitles({
        text: request.text,
        platform: request.platform as any,
        contentType: request.contentType as any,
        duration: request.duration,
        style: 'professional',
        mood: 'neutral',
        language: 'en',
        includeEmojis: false,
        includeHashtags: false,
        maxLength: 80,
        timing: 'auto',
        targetAudience: 'general'
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
