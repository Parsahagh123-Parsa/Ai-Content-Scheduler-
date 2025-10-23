import { openai } from './openai';

export interface MusicRequest {
  style: 'upbeat' | 'calm' | 'dramatic' | 'funny' | 'inspiring' | 'mysterious' | 'romantic' | 'energetic';
  duration: number; // in seconds
  mood: 'happy' | 'sad' | 'neutral' | 'excited' | 'relaxed' | 'intense';
  tempo: 'slow' | 'medium' | 'fast' | 'very-fast';
  instruments: string[];
  platform: 'tiktok' | 'youtube' | 'instagram' | 'twitter';
  genre?: 'pop' | 'electronic' | 'classical' | 'rock' | 'jazz' | 'ambient' | 'hip-hop';
  volume: number; // 0.0 to 1.0
  fadeIn?: number; // seconds
  fadeOut?: number; // seconds
}

export interface MusicResponse {
  musicUrl: string;
  duration: number;
  format: 'mp3' | 'wav' | 'ogg';
  size: number; // in bytes
  bpm: number;
  key: string;
  genre: string;
  mood: string;
  instruments: string[];
  waveform?: string; // Base64 encoded waveform data
  metadata: {
    title: string;
    artist: string;
    description: string;
    tags: string[];
    license: 'royalty-free' | 'creative-commons' | 'commercial';
  };
}

// Music style presets for different content types
export const MUSIC_PRESETS: Record<string, Partial<MusicRequest>> = {
  // Content Type Presets
  'fitness_workout': {
    style: 'energetic',
    mood: 'excited',
    tempo: 'fast',
    instruments: ['drums', 'bass', 'electric-guitar', 'synth'],
    genre: 'electronic',
    volume: 0.7
  },
  'tech_tutorial': {
    style: 'calm',
    mood: 'neutral',
    tempo: 'medium',
    instruments: ['piano', 'strings', 'ambient-pad'],
    genre: 'ambient',
    volume: 0.4
  },
  'comedy_skit': {
    style: 'funny',
    mood: 'happy',
    tempo: 'medium',
    instruments: ['ukulele', 'xylophone', 'bass', 'drums'],
    genre: 'pop',
    volume: 0.6
  },
  'lifestyle_vlog': {
    style: 'upbeat',
    mood: 'happy',
    tempo: 'medium',
    instruments: ['acoustic-guitar', 'piano', 'strings', 'light-drums'],
    genre: 'pop',
    volume: 0.5
  },
  'dramatic_reveal': {
    style: 'dramatic',
    mood: 'intense',
    tempo: 'slow',
    instruments: ['orchestra', 'piano', 'strings', 'brass'],
    genre: 'classical',
    volume: 0.8
  },
  'motivational_speech': {
    style: 'inspiring',
    mood: 'excited',
    tempo: 'medium',
    instruments: ['piano', 'strings', 'drums', 'brass'],
    genre: 'classical',
    volume: 0.7
  },
  
  // Platform-specific presets
  'tiktok_trending': {
    style: 'energetic',
    mood: 'excited',
    tempo: 'very-fast',
    instruments: ['drums', 'bass', 'synth', 'vocal-samples'],
    genre: 'hip-hop',
    volume: 0.8
  },
  'youtube_intro': {
    style: 'upbeat',
    mood: 'happy',
    tempo: 'fast',
    instruments: ['guitar', 'drums', 'bass', 'synth'],
    genre: 'pop',
    volume: 0.6
  },
  'instagram_story': {
    style: 'calm',
    mood: 'relaxed',
    tempo: 'medium',
    instruments: ['piano', 'strings', 'ambient-pad'],
    genre: 'ambient',
    volume: 0.4
  },
  'twitter_thread': {
    style: 'neutral',
    mood: 'neutral',
    tempo: 'slow',
    instruments: ['piano', 'strings'],
    genre: 'classical',
    volume: 0.3
  }
};

// Generate background music using AI
export async function generateBackgroundMusic(request: MusicRequest): Promise<MusicResponse> {
  try {
    // Generate music description using AI
    const musicDescription = await generateMusicDescription(request);
    
    // Generate music using music generation API (mock implementation)
    const musicData = await generateMusicFromDescription(musicDescription, request);
    
    // Generate metadata
    const metadata = await generateMusicMetadata(request, musicDescription);
    
    return {
      musicUrl: musicData.url,
      duration: request.duration,
      format: 'mp3',
      size: musicData.size,
      bpm: musicData.bpm,
      key: musicData.key,
      genre: request.genre || 'electronic',
      mood: request.mood,
      instruments: request.instruments,
      waveform: musicData.waveform,
      metadata
    };
  } catch (error) {
    console.error('Error generating background music:', error);
    throw new Error('Failed to generate background music');
  }
}

// Generate music description using AI
async function generateMusicDescription(request: MusicRequest): Promise<string> {
  const systemPrompt = `You are an expert music producer and composer. Create detailed descriptions for AI music generation that will produce high-quality background music for social media content.

Focus on:
- Clear musical direction
- Specific instrument arrangements
- Mood and emotional tone
- Technical specifications
- Platform-appropriate style`;

  const userPrompt = `Create a music description for background music with these specifications:

Style: ${request.style}
Mood: ${request.mood}
Tempo: ${request.tempo}
Duration: ${request.duration} seconds
Instruments: ${request.instruments.join(', ')}
Platform: ${request.platform}
Genre: ${request.genre || 'electronic'}
Volume: ${request.volume}

Requirements:
- Must be royalty-free and copyright-safe
- Should loop seamlessly
- Appropriate for ${request.platform} content
- Match the ${request.mood} mood
- Use ${request.tempo} tempo
- Include fade-in and fade-out if specified

Provide a detailed musical description that an AI music generator can use to create this track.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    return response.choices?.[0]?.message?.content?.trim() || generateDefaultDescription(request);
  } catch (error) {
    console.error('Error generating music description:', error);
    return generateDefaultDescription(request);
  }
}

// Generate default music description as fallback
function generateDefaultDescription(request: MusicRequest): string {
  return `A ${request.tempo} tempo ${request.genre || 'electronic'} track with ${request.style} style, featuring ${request.instruments.join(', ')}. The mood should be ${request.mood} and last ${request.duration} seconds. Perfect for ${request.platform} content.`;
}

// Generate music from description (mock implementation)
async function generateMusicFromDescription(description: string, request: MusicRequest): Promise<{
  url: string;
  size: number;
  bpm: number;
  key: string;
  waveform?: string;
}> {
  // In a real implementation, integrate with music generation APIs like:
  // - Mubert API
  // - Soundful API
  // - AIVA API
  // - OpenAI's music generation (when available)
  
  const musicId = `music_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    url: `https://music.example.com/generated/${musicId}.mp3`,
    size: Math.floor(Math.random() * 2000000) + 500000, // 500KB - 2.5MB
    bpm: getBPMForTempo(request.tempo),
    key: getRandomKey(),
    waveform: generateMockWaveform(request.duration)
  };
}

// Generate music metadata
async function generateMusicMetadata(request: MusicRequest, description: string): Promise<MusicResponse['metadata']> {
  const title = generateMusicTitle(request);
  const artist = 'AI Content Scheduler';
  const tags = generateMusicTags(request);
  
  return {
    title,
    artist,
    description: `Generated background music for ${request.platform} content. ${description}`,
    tags,
    license: 'royalty-free'
  };
}

// Generate music title based on request
function generateMusicTitle(request: MusicRequest): string {
  const styleNames = {
    'upbeat': 'Upbeat Vibes',
    'calm': 'Peaceful Moments',
    'dramatic': 'Epic Drama',
    'funny': 'Playful Tune',
    'inspiring': 'Rising Spirit',
    'mysterious': 'Hidden Secrets',
    'romantic': 'Love Story',
    'energetic': 'Power Surge'
  };
  
  const platformNames = {
    'tiktok': 'TikTok',
    'youtube': 'YouTube',
    'instagram': 'Instagram',
    'twitter': 'Twitter'
  };
  
  return `${styleNames[request.style]} - ${platformNames[request.platform]} Background`;
}

// Generate music tags
function generateMusicTags(request: MusicRequest): string[] {
  const tags = [
    request.style,
    request.mood,
    request.tempo,
    request.platform,
    'background-music',
    'royalty-free',
    'ai-generated'
  ];
  
  if (request.genre) {
    tags.push(request.genre);
  }
  
  tags.push(...request.instruments);
  
  return tags;
}

// Get BPM for tempo
function getBPMForTempo(tempo: string): number {
  const bpmMap = {
    'slow': 60,
    'medium': 120,
    'fast': 140,
    'very-fast': 160
  };
  
  return bpmMap[tempo] || 120;
}

// Get random musical key
function getRandomKey(): string {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const modes = ['major', 'minor'];
  const key = keys[Math.floor(Math.random() * keys.length)];
  const mode = modes[Math.floor(Math.random() * modes.length)];
  return `${key} ${mode}`;
}

// Generate mock waveform data
function generateMockWaveform(duration: number): string {
  // Generate a simple sine wave pattern as base64
  const samples = Math.floor(duration * 10); // 10 samples per second
  const waveform = new Array(samples).fill(0).map((_, i) => 
    Math.sin(i * 0.1) * 0.5 + 0.5 // Normalize to 0-1
  );
  
  return Buffer.from(waveform).toString('base64');
}

// Generate music for specific content types
export const generateMusicForContentType = {
  hook: async (platform: string, duration: number = 15): Promise<MusicResponse> => {
    const preset = MUSIC_PRESETS[`${platform}_trending`] || MUSIC_PRESETS.tiktok_trending;
    return generateBackgroundMusic({
      ...preset,
      duration,
      platform: platform as any
    } as MusicRequest);
  },
  
  tutorial: async (platform: string, duration: number = 60): Promise<MusicResponse> => {
    return generateBackgroundMusic({
      ...MUSIC_PRESETS.tech_tutorial,
      duration,
      platform: platform as any
    } as MusicRequest);
  },
  
  story: async (platform: string, duration: number = 30): Promise<MusicResponse> => {
    return generateBackgroundMusic({
      ...MUSIC_PRESETS.lifestyle_vlog,
      duration,
      platform: platform as any
    } as MusicRequest);
  },
  
  motivational: async (platform: string, duration: number = 45): Promise<MusicResponse> => {
    return generateBackgroundMusic({
      ...MUSIC_PRESETS.fitness_workout,
      duration,
      platform: platform as any
    } as MusicRequest);
  }
};

// Generate music with specific mood and style
export async function generateCustomMusic(
  style: string,
  mood: string,
  platform: string,
  duration: number = 30
): Promise<MusicResponse> {
  const request: MusicRequest = {
    style: style as any,
    mood: mood as any,
    duration,
    tempo: 'medium',
    instruments: getInstrumentsForStyle(style),
    platform: platform as any,
    volume: 0.6
  };
  
  return generateBackgroundMusic(request);
}

// Get instruments for style
function getInstrumentsForStyle(style: string): string[] {
  const instrumentMap: Record<string, string[]> = {
    'upbeat': ['drums', 'bass', 'guitar', 'synth'],
    'calm': ['piano', 'strings', 'ambient-pad'],
    'dramatic': ['orchestra', 'piano', 'strings', 'brass'],
    'funny': ['ukulele', 'xylophone', 'bass', 'drums'],
    'inspiring': ['piano', 'strings', 'drums', 'brass'],
    'mysterious': ['strings', 'ambient-pad', 'bass', 'synth'],
    'romantic': ['piano', 'strings', 'guitar', 'flute'],
    'energetic': ['drums', 'bass', 'electric-guitar', 'synth']
  };
  
  return instrumentMap[style] || ['piano', 'strings'];
}

// Batch music generation
export async function generateBatchMusic(
  requests: Array<{ style: string; platform: string; duration: number }>
): Promise<MusicResponse[]> {
  const results: MusicResponse[] = [];
  
  // Process in parallel with rate limiting
  const batchSize = 2;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchPromises = batch.map(request => 
      generateCustomMusic(request.style, 'neutral', request.platform, request.duration)
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
