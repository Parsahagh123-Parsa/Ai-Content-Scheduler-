import { openai } from './openai';

export interface AutoEditRequest {
  videoUrl: string;
  caption: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'twitter';
  contentType: 'educational' | 'entertainment' | 'lifestyle' | 'comedy' | 'motivational' | 'tutorial';
  targetDuration: number; // in seconds
  style: 'fast-paced' | 'cinematic' | 'documentary' | 'vlog' | 'tutorial' | 'comedy';
  mood: 'energetic' | 'calm' | 'dramatic' | 'funny' | 'inspiring' | 'professional';
  includeTransitions: boolean;
  includeEffects: boolean;
  includeMusic: boolean;
  includeSubtitles: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
}

export interface EditSegment {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: 'keep' | 'cut' | 'highlight' | 'transition';
  confidence: number;
  reasoning: string;
  effects?: string[];
  transitions?: string[];
  audioLevel?: number;
  speed?: number;
}

export interface AutoEditResponse {
  segments: EditSegment[];
  totalDuration: number;
  editedDuration: number;
  cuts: number;
  highlights: number;
  transitions: number;
  effects: string[];
  music: {
    track: string;
    startTime: number;
    endTime: number;
    volume: number;
  }[];
  subtitles: {
    text: string;
    startTime: number;
    endTime: number;
    style: string;
  }[];
  exportSettings: {
    resolution: string;
    fps: number;
    bitrate: string;
    format: string;
    codec: string;
  };
  metadata: {
    generatedAt: Date;
    platform: string;
    contentType: string;
    processingTime: number;
    aiConfidence: number;
  };
}

// Auto-edit templates for different content types
export const AUTO_EDIT_TEMPLATES = {
  tiktok: {
    maxDuration: 60,
    cutsPerMinute: 8,
    transitions: ['quick-cut', 'zoom', 'swipe'],
    effects: ['speed-ramp', 'zoom', 'color-grading'],
    music: 'trending',
    subtitles: true,
    aspectRatio: '9:16'
  },
  youtube: {
    maxDuration: 600,
    cutsPerMinute: 4,
    transitions: ['fade', 'dissolve', 'wipe'],
    effects: ['color-grading', 'stabilization', 'noise-reduction'],
    music: 'background',
    subtitles: true,
    aspectRatio: '16:9'
  },
  instagram: {
    maxDuration: 90,
    cutsPerMinute: 6,
    transitions: ['quick-cut', 'fade', 'zoom'],
    effects: ['color-grading', 'filters', 'overlay'],
    music: 'trending',
    subtitles: true,
    aspectRatio: '1:1'
  },
  twitter: {
    maxDuration: 30,
    cutsPerMinute: 10,
    transitions: ['quick-cut', 'jump-cut'],
    effects: ['speed-ramp', 'zoom'],
    music: 'minimal',
    subtitles: true,
    aspectRatio: '16:9'
  }
};

// Generate auto-edit suggestions
export async function generateAutoEdit(request: AutoEditRequest): Promise<AutoEditResponse> {
  try {
    // Analyze video content for editing opportunities
    const contentAnalysis = await analyzeVideoContent(request);
    
    // Generate edit segments using AI
    const segments = await generateEditSegments(request, contentAnalysis);
    
    // Calculate edit statistics
    const stats = calculateEditStats(segments);
    
    // Generate music and subtitles
    const music = await generateMusicTracks(request, segments);
    const subtitles = await generateSubtitles(request, segments);
    
    // Generate export settings
    const exportSettings = generateExportSettings(request);
    
    return {
      segments,
      totalDuration: contentAnalysis.totalDuration,
      editedDuration: stats.editedDuration,
      cuts: stats.cuts,
      highlights: stats.highlights,
      transitions: stats.transitions,
      effects: stats.effects,
      music,
      subtitles,
      exportSettings,
      metadata: {
        generatedAt: new Date(),
        platform: request.platform,
        contentType: request.contentType,
        processingTime: Date.now(),
        aiConfidence: stats.confidence
      }
    };
  } catch (error) {
    console.error('Error generating auto-edit:', error);
    throw new Error('Failed to generate auto-edit suggestions');
  }
}

// Analyze video content for editing opportunities
async function analyzeVideoContent(request: AutoEditRequest): Promise<{
  totalDuration: number;
  keyMoments: Array<{ time: number; importance: number; type: string }>;
  audioLevels: Array<{ time: number; level: number }>;
  visualElements: string[];
  pacing: 'slow' | 'medium' | 'fast';
  quality: 'low' | 'medium' | 'high';
}> {
  const systemPrompt = `You are an expert video editor and content analyst. Analyze the given video content to identify the best editing opportunities.

Focus on:
- Key moments and highlights
- Audio levels and silence detection
- Visual elements and composition
- Pacing and rhythm
- Quality and technical aspects

Return a JSON object with analysis results.`;

  const userPrompt = `Analyze this video for auto-editing:

Caption: "${request.caption}"
Platform: ${request.platform}
Content Type: ${request.contentType}
Target Duration: ${request.targetDuration} seconds
Style: ${request.style}
Mood: ${request.mood}

Identify the best moments to keep, cut, or highlight for optimal engagement.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content analysis generated');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing video content:', error);
    return {
      totalDuration: request.targetDuration * 2, // Assume 2x target duration
      keyMoments: [],
      audioLevels: [],
      visualElements: [],
      pacing: 'medium',
      quality: 'medium'
    };
  }
}

// Generate edit segments using AI
async function generateEditSegments(
  request: AutoEditRequest,
  contentAnalysis: any
): Promise<EditSegment[]> {
  const systemPrompt = `You are an expert video editor specializing in ${request.platform} content. Generate specific edit segments for the given video.

Consider:
- Platform-specific requirements and best practices
- Content type and target audience
- Style and mood requirements
- Pacing and rhythm
- Technical constraints and quality

For each segment, provide:
- Start and end times
- Edit type (keep, cut, highlight, transition)
- Confidence score (0-100)
- Reasoning for the edit decision
- Suggested effects and transitions
- Audio and speed adjustments`;

  const userPrompt = `Generate edit segments for this video:

Caption: "${request.caption}"
Platform: ${request.platform}
Content Type: ${request.contentType}
Target Duration: ${request.targetDuration} seconds
Style: ${request.style}
Mood: ${request.mood}
Include Transitions: ${request.includeTransitions}
Include Effects: ${request.includeEffects}

Content Analysis:
- Total Duration: ${contentAnalysis.totalDuration} seconds
- Key Moments: ${contentAnalysis.keyMoments.length}
- Pacing: ${contentAnalysis.pacing}
- Quality: ${contentAnalysis.quality}

Generate 8-15 specific edit segments optimized for ${request.platform} engagement.`;

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
      throw new Error('No edit segments generated');
    }

    const data = JSON.parse(content);
    return (data.segments || []).map((segment: any, index: number) => ({
      id: `segment_${Date.now()}_${index}`,
      startTime: segment.startTime || 0,
      endTime: segment.endTime || 5,
      duration: (segment.endTime || 5) - (segment.startTime || 0),
      type: segment.type || 'keep',
      confidence: segment.confidence || 80,
      reasoning: segment.reasoning || 'AI-generated edit',
      effects: segment.effects || [],
      transitions: segment.transitions || [],
      audioLevel: segment.audioLevel || 1.0,
      speed: segment.speed || 1.0
    }));
  } catch (error) {
    console.error('Error generating edit segments:', error);
    return generateFallbackEditSegments(request);
  }
}

// Generate fallback edit segments
function generateFallbackEditSegments(request: AutoEditRequest): EditSegment[] {
  const segments: EditSegment[] = [];
  const template = AUTO_EDIT_TEMPLATES[request.platform];
  const segmentDuration = request.targetDuration / 8; // 8 segments
  
  for (let i = 0; i < 8; i++) {
    const startTime = i * segmentDuration;
    const endTime = (i + 1) * segmentDuration;
    
    segments.push({
      id: `segment_${Date.now()}_${i}`,
      startTime,
      endTime,
      duration: segmentDuration,
      type: i % 3 === 0 ? 'highlight' : 'keep',
      confidence: 70,
      reasoning: 'AI-generated edit based on timing',
      effects: template.effects.slice(0, 2),
      transitions: template.transitions.slice(0, 1),
      audioLevel: 1.0,
      speed: 1.0
    });
  }
  
  return segments;
}

// Calculate edit statistics
function calculateEditStats(segments: EditSegment[]): {
  editedDuration: number;
  cuts: number;
  highlights: number;
  transitions: number;
  effects: string[];
  confidence: number;
} {
  const editedDuration = segments
    .filter(s => s.type === 'keep' || s.type === 'highlight')
    .reduce((total, segment) => total + segment.duration, 0);
  
  const cuts = segments.filter(s => s.type === 'cut').length;
  const highlights = segments.filter(s => s.type === 'highlight').length;
  const transitions = segments.filter(s => s.type === 'transition').length;
  
  const effects = Array.from(new Set(
    segments.flatMap(s => s.effects || [])
  ));
  
  const confidence = segments.reduce((sum, s) => sum + s.confidence, 0) / segments.length;
  
  return {
    editedDuration,
    cuts,
    highlights,
    transitions,
    effects,
    confidence
  };
}

// Generate music tracks
async function generateMusicTracks(
  request: AutoEditRequest,
  segments: EditSegment[]
): Promise<Array<{
  track: string;
  startTime: number;
  endTime: number;
  volume: number;
}>> {
  if (!request.includeMusic) return [];
  
  const template = AUTO_EDIT_TEMPLATES[request.platform];
  const musicTracks = [];
  
  // Add background music
  musicTracks.push({
    track: template.music,
    startTime: 0,
    endTime: request.targetDuration,
    volume: 0.3
  });
  
  // Add transition music for highlights
  segments
    .filter(s => s.type === 'highlight')
    .forEach(segment => {
      musicTracks.push({
        track: 'transition-music',
        startTime: segment.startTime,
        endTime: segment.endTime,
        volume: 0.5
      });
    });
  
  return musicTracks;
}

// Generate subtitles
async function generateSubtitles(
  request: AutoEditRequest,
  segments: EditSegment[]
): Promise<Array<{
  text: string;
  startTime: number;
  endTime: number;
  style: string;
}>> {
  if (!request.includeSubtitles) return [];
  
  const subtitles = [];
  const words = request.caption.split(' ');
  const wordsPerSegment = Math.ceil(words.length / segments.length);
  
  segments.forEach((segment, index) => {
    const startWord = index * wordsPerSegment;
    const endWord = Math.min((index + 1) * wordsPerSegment, words.length);
    const text = words.slice(startWord, endWord).join(' ');
    
    if (text.trim()) {
      subtitles.push({
        text: text.trim(),
        startTime: segment.startTime,
        endTime: segment.endTime,
        style: getSubtitleStyle(request.platform)
      });
    }
  });
  
  return subtitles;
}

// Get subtitle style for platform
function getSubtitleStyle(platform: string): string {
  const styles = {
    tiktok: 'bold, large, high contrast',
    youtube: 'clean, readable, professional',
    instagram: 'elegant, aesthetic, branded',
    twitter: 'minimal, clear, concise'
  };
  
  return styles[platform as keyof typeof styles] || 'clean, readable';
}

// Generate export settings
function generateExportSettings(request: AutoEditRequest): {
  resolution: string;
  fps: number;
  bitrate: string;
  format: string;
  codec: string;
} {
  const settings = {
    tiktok: { resolution: '1080x1920', fps: 30, bitrate: '2M', format: 'mp4', codec: 'h264' },
    youtube: { resolution: '1920x1080', fps: 30, bitrate: '5M', format: 'mp4', codec: 'h264' },
    instagram: { resolution: '1080x1080', fps: 30, bitrate: '3M', format: 'mp4', codec: 'h264' },
    twitter: { resolution: '1280x720', fps: 30, bitrate: '2M', format: 'mp4', codec: 'h264' }
  };
  
  const platformSettings = settings[request.platform] || settings.youtube;
  
  // Adjust quality based on request
  if (request.quality === 'ultra') {
    platformSettings.bitrate = '8M';
    platformSettings.fps = 60;
  } else if (request.quality === 'high') {
    platformSettings.bitrate = '5M';
  } else if (request.quality === 'medium') {
    platformSettings.bitrate = '3M';
  } else {
    platformSettings.bitrate = '1M';
  }
  
  return platformSettings;
}

// Generate auto-edit for specific content types
export const generateAutoEditForContentType = {
  tutorial: async (videoUrl: string, caption: string, platform: string): Promise<AutoEditResponse> => {
    return generateAutoEdit({
      videoUrl,
      caption,
      platform: platform as any,
      contentType: 'tutorial',
      targetDuration: 120,
      style: 'tutorial',
      mood: 'professional',
      includeTransitions: true,
      includeEffects: false,
      includeMusic: true,
      includeSubtitles: true,
      quality: 'high',
      aspectRatio: '16:9'
    });
  },
  
  entertainment: async (videoUrl: string, caption: string, platform: string): Promise<AutoEditResponse> => {
    return generateAutoEdit({
      videoUrl,
      caption,
      platform: platform as any,
      contentType: 'entertainment',
      targetDuration: 60,
      style: 'fast-paced',
      mood: 'energetic',
      includeTransitions: true,
      includeEffects: true,
      includeMusic: true,
      includeSubtitles: true,
      quality: 'high',
      aspectRatio: '9:16'
    });
  },
  
  motivational: async (videoUrl: string, caption: string, platform: string): Promise<AutoEditResponse> => {
    return generateAutoEdit({
      videoUrl,
      caption,
      platform: platform as any,
      contentType: 'motivational',
      targetDuration: 90,
      style: 'cinematic',
      mood: 'inspiring',
      includeTransitions: true,
      includeEffects: true,
      includeMusic: true,
      includeSubtitles: true,
      quality: 'high',
      aspectRatio: '16:9'
    });
  }
};

// Batch auto-edit generation
export async function generateBatchAutoEdit(
  requests: Array<{ videoUrl: string; caption: string; platform: string; contentType: string }>
): Promise<AutoEditResponse[]> {
  const results: AutoEditResponse[] = [];
  
  // Process in parallel with rate limiting
  const batchSize = 2;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchPromises = batch.map(request => 
      generateAutoEdit({
        videoUrl: request.videoUrl,
        caption: request.caption,
        platform: request.platform as any,
        contentType: request.contentType as any,
        targetDuration: 60,
        style: 'fast-paced',
        mood: 'energetic',
        includeTransitions: true,
        includeEffects: true,
        includeMusic: true,
        includeSubtitles: true,
        quality: 'medium',
        aspectRatio: '16:9'
      })
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Rate limiting delay
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  return results;
}
