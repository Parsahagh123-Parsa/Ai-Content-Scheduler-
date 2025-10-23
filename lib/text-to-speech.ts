import { openai } from './openai';

export interface VoiceSettings {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number; // 0.25 to 4.0
  pitch: number; // 0.0 to 2.0
  volume: number; // 0.0 to 1.0
  emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'energetic';
  accent: 'american' | 'british' | 'australian' | 'canadian' | 'irish';
}

export interface TTSRequest {
  text: string;
  settings: VoiceSettings;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'twitter';
  duration?: number; // in seconds
  includeBackgroundMusic?: boolean;
  musicStyle?: 'upbeat' | 'calm' | 'dramatic' | 'funny' | 'inspiring';
}

export interface TTSResponse {
  audioUrl: string;
  duration: number;
  format: 'mp3' | 'wav' | 'ogg';
  size: number; // in bytes
  settings: VoiceSettings;
  transcript: string;
  wordTimings?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
}

// Voice personality presets for different content types
export const VOICE_PRESETS: Record<string, VoiceSettings> = {
  // Content Type Presets
  'fitness_motivational': {
    voice: 'onyx',
    speed: 1.1,
    pitch: 1.1,
    volume: 0.9,
    emotion: 'energetic',
    accent: 'american'
  },
  'tech_tutorial': {
    voice: 'nova',
    speed: 0.9,
    pitch: 1.0,
    volume: 0.8,
    emotion: 'neutral',
    accent: 'american'
  },
  'comedy_skit': {
    voice: 'shimmer',
    speed: 1.2,
    pitch: 1.2,
    volume: 0.9,
    emotion: 'happy',
    accent: 'american'
  },
  'lifestyle_vlog': {
    voice: 'alloy',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    emotion: 'calm',
    accent: 'american'
  },
  'news_update': {
    voice: 'echo',
    speed: 0.95,
    pitch: 0.95,
    volume: 0.85,
    emotion: 'neutral',
    accent: 'american'
  },
  'storytelling': {
    voice: 'fable',
    speed: 0.8,
    pitch: 1.05,
    volume: 0.8,
    emotion: 'calm',
    accent: 'british'
  },
  
  // Platform-specific presets
  'tiktok_trending': {
    voice: 'shimmer',
    speed: 1.3,
    pitch: 1.1,
    volume: 0.9,
    emotion: 'excited',
    accent: 'american'
  },
  'youtube_educational': {
    voice: 'nova',
    speed: 0.9,
    pitch: 1.0,
    volume: 0.8,
    emotion: 'neutral',
    accent: 'american'
  },
  'instagram_story': {
    voice: 'alloy',
    speed: 1.1,
    pitch: 1.05,
    volume: 0.85,
    emotion: 'happy',
    accent: 'american'
  },
  'twitter_thread': {
    voice: 'echo',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    emotion: 'neutral',
    accent: 'american'
  }
};

// Generate TTS using OpenAI's TTS API
export async function generateTTS(request: TTSRequest): Promise<TTSResponse> {
  try {
    // Optimize text for TTS
    const optimizedText = await optimizeTextForTTS(request.text, request.platform, request.settings);
    
    // Generate audio using OpenAI TTS
    const audioResponse = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: request.settings.voice,
      input: optimizedText,
      speed: request.settings.speed,
      response_format: "mp3"
    });

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    const audioUrl = await uploadAudioToStorage(audioBuffer, 'mp3');
    
    // Calculate duration (approximate)
    const duration = calculateAudioDuration(optimizedText, request.settings.speed);
    
    // Generate word timings for subtitle sync
    const wordTimings = await generateWordTimings(optimizedText, request.settings);
    
    return {
      audioUrl,
      duration,
      format: 'mp3',
      size: audioBuffer.length,
      settings: request.settings,
      transcript: optimizedText,
      wordTimings
    };
  } catch (error) {
    console.error('Error generating TTS:', error);
    throw new Error('Failed to generate text-to-speech');
  }
}

// Optimize text for better TTS output
async function optimizeTextForTTS(text: string, platform: string, settings: VoiceSettings): Promise<string> {
  const systemPrompt = `You are an expert at optimizing text for text-to-speech generation. 
  Make the text sound natural when spoken aloud while maintaining the original meaning and impact.
  
  Platform-specific optimizations:
  - TikTok: Short, punchy, trending language
  - YouTube: Clear, educational, engaging
  - Instagram: Conversational, story-driven
  - Twitter: Concise, impactful
  
  Voice characteristics:
  - Emotion: ${settings.emotion}
  - Speed: ${settings.speed}x
  - Platform: ${platform}
  
  Optimize for:
  - Natural pronunciation
  - Proper pacing
  - Emotional delivery
  - Platform-appropriate tone
  - Clear enunciation`;

  const userPrompt = `Optimize this text for TTS generation:
  
  "${text}"
  
  Make it sound natural and engaging when spoken, while keeping the original meaning and impact.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices?.[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error('Error optimizing text for TTS:', error);
    return text; // Return original text if optimization fails
  }
}

// Generate word timings for subtitle synchronization
async function generateWordTimings(text: string, settings: VoiceSettings): Promise<Array<{ word: string; start: number; end: number }>> {
  const words = text.split(/\s+/);
  const wordTimings: Array<{ word: string; start: number; end: number }> = [];
  
  // Calculate approximate timing based on word length and speed
  const baseTimePerWord = 0.5 / settings.speed; // Base time per word in seconds
  let currentTime = 0;
  
  for (const word of words) {
    const wordDuration = Math.max(0.2, baseTimePerWord * (word.length / 5)); // Adjust based on word length
    wordTimings.push({
      word,
      start: currentTime,
      end: currentTime + wordDuration
    });
    currentTime += wordDuration + 0.1; // Small pause between words
  }
  
  return wordTimings;
}

// Calculate approximate audio duration
function calculateAudioDuration(text: string, speed: number): number {
  const wordsPerMinute = 150 * speed; // Average speaking rate
  const wordCount = text.split(/\s+/).length;
  return (wordCount / wordsPerMinute) * 60;
}

// Upload audio to storage (mock implementation)
async function uploadAudioToStorage(audioBuffer: Buffer, format: string): Promise<string> {
  // In a real implementation, upload to cloud storage (AWS S3, Google Cloud, etc.)
  const audioId = `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return `https://storage.example.com/audio/${audioId}.${format}`;
}

// Generate TTS with background music
export async function generateTTSWithMusic(request: TTSRequest): Promise<TTSResponse & { musicUrl?: string }> {
  const ttsResponse = await generateTTS(request);
  
  if (request.includeBackgroundMusic && request.musicStyle) {
    const musicUrl = await generateBackgroundMusic({
      duration: ttsResponse.duration,
      style: request.musicStyle,
      volume: 0.3 // Lower volume for background
    });
    
    return {
      ...ttsResponse,
      musicUrl
    };
  }
  
  return ttsResponse;
}

// Generate background music (mock implementation)
async function generateBackgroundMusic(params: {
  duration: number;
  style: string;
  volume: number;
}): Promise<string> {
  // In a real implementation, integrate with music generation APIs
  const musicId = `music_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return `https://music.example.com/generated/${musicId}.mp3`;
}

// Create voice clone using ElevenLabs (mock implementation)
export async function createVoiceClone(
  name: string,
  description: string,
  sampleAudioUrl: string
): Promise<{ voiceId: string; name: string }> {
  try {
    // In a real implementation, integrate with ElevenLabs API
    const voiceId = `clone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      voiceId,
      name
    };
  } catch (error) {
    console.error('Error creating voice clone:', error);
    throw new Error('Failed to create voice clone');
  }
}

// Get available voices
export function getAvailableVoices(): Array<{ id: string; name: string; description: string; gender: string; accent: string }> {
  return [
    { id: 'alloy', name: 'Alloy', description: 'Neutral, clear voice', gender: 'neutral', accent: 'american' },
    { id: 'echo', name: 'Echo', description: 'Deep, authoritative voice', gender: 'male', accent: 'american' },
    { id: 'fable', name: 'Fable', description: 'Warm, storytelling voice', gender: 'female', accent: 'british' },
    { id: 'onyx', name: 'Onyx', description: 'Strong, confident voice', gender: 'male', accent: 'american' },
    { id: 'nova', name: 'Nova', description: 'Bright, energetic voice', gender: 'female', accent: 'american' },
    { id: 'shimmer', name: 'Shimmer', description: 'Playful, expressive voice', gender: 'female', accent: 'american' }
  ];
}

// Batch TTS generation for multiple texts
export async function generateBatchTTS(
  requests: Array<{ text: string; settings: VoiceSettings; platform: string }>
): Promise<TTSResponse[]> {
  const results: TTSResponse[] = [];
  
  // Process in parallel with rate limiting
  const batchSize = 3;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchPromises = batch.map(request => 
      generateTTS({
        text: request.text,
        settings: request.settings,
        platform: request.platform as any
      })
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Rate limiting delay
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

// TTS for different content types
export const generateTTSForContentType = {
  hook: async (text: string, platform: string): Promise<TTSResponse> => {
    return generateTTS({
      text,
      settings: VOICE_PRESETS[`${platform}_trending`] || VOICE_PRESETS.tiktok_trending,
      platform: platform as any
    });
  },
  
  tutorial: async (text: string, platform: string): Promise<TTSResponse> => {
    return generateTTS({
      text,
      settings: VOICE_PRESETS.tech_tutorial,
      platform: platform as any
    });
  },
  
  story: async (text: string, platform: string): Promise<TTSResponse> => {
    return generateTTS({
      text,
      settings: VOICE_PRESETS.storytelling,
      platform: platform as any
    });
  },
  
  motivational: async (text: string, platform: string): Promise<TTSResponse> => {
    return generateTTS({
      text,
      settings: VOICE_PRESETS.fitness_motivational,
      platform: platform as any
    });
  }
};
