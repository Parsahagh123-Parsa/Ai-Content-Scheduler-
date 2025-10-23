import { openai } from './openai';

export interface VideoGenerationRequest {
  caption: string;
  platform: 'tiktok' | 'youtube' | 'instagram';
  duration: number; // in seconds
  style: 'professional' | 'casual' | 'trendy' | 'educational';
  includeVoiceover: boolean;
  includeMusic: boolean;
  thumbnailStyle: 'bold' | 'minimal' | 'vibrant' | 'elegant';
}

export interface VideoGenerationResponse {
  videoId: string;
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  platform: string;
  metadata: {
    resolution: string;
    aspectRatio: string;
    fileSize?: number;
    processingTime?: number;
  };
  error?: string;
}

export interface VideoScript {
  hook: string;
  mainContent: string[];
  callToAction: string;
  duration: number;
  cameraAngles: string[];
  transitions: string[];
  musicCues: string[];
}

// Generate video script using OpenAI
export async function generateVideoScript(request: VideoGenerationRequest): Promise<VideoScript> {
  try {
    const systemPrompt = `You are an expert video script writer for social media platforms. 
    Create engaging, platform-optimized video scripts that maximize engagement and virality.
    
    Platform-specific guidelines:
    - TikTok: Hook in first 3 seconds, trending sounds, quick cuts
    - YouTube Shorts: Educational value, clear structure, retention hooks
    - Instagram Reels: Visual appeal, story-driven, brand-friendly
    
    Style guidelines:
    - Professional: Clear, authoritative, informative
    - Casual: Conversational, relatable, friendly
    - Trendy: Current slang, viral formats, pop culture references
    - Educational: Step-by-step, clear explanations, actionable tips`;

    const userPrompt = `Create a ${request.duration}-second video script for ${request.platform} based on this caption:
    
    "${request.caption}"
    
    Style: ${request.style}
    Include voiceover: ${request.includeVoiceover}
    Include music: ${request.includeMusic}
    
    Provide:
    1. Hook (3-5 seconds)
    2. Main content (structured for ${request.duration} seconds)
    3. Call to action
    4. Camera angles and shots
    5. Transition suggestions
    6. Music cues and timing`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No script generated');
    }

    return parseVideoScript(content, request.duration);
  } catch (error) {
    console.error('Error generating video script:', error);
    throw new Error('Failed to generate video script');
  }
}

// Parse AI-generated script into structured format
function parseVideoScript(content: string, duration: number): VideoScript {
  const lines = content.split('\n').filter(line => line.trim());
  
  let hook = '';
  let mainContent: string[] = [];
  let callToAction = '';
  let cameraAngles: string[] = [];
  let transitions: string[] = [];
  let musicCues: string[] = [];

  let currentSection = '';
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('hook') || lowerLine.includes('opening')) {
      currentSection = 'hook';
    } else if (lowerLine.includes('main') || lowerLine.includes('content') || lowerLine.includes('body')) {
      currentSection = 'main';
    } else if (lowerLine.includes('call to action') || lowerLine.includes('cta') || lowerLine.includes('conclusion')) {
      currentSection = 'cta';
    } else if (lowerLine.includes('camera') || lowerLine.includes('shot') || lowerLine.includes('angle')) {
      currentSection = 'camera';
    } else if (lowerLine.includes('transition') || lowerLine.includes('cut')) {
      currentSection = 'transition';
    } else if (lowerLine.includes('music') || lowerLine.includes('audio') || lowerLine.includes('sound')) {
      currentSection = 'music';
    } else if (line.trim() && !line.match(/^\d+\./)) {
      switch (currentSection) {
        case 'hook':
          hook = line.trim();
          break;
        case 'main':
          mainContent.push(line.trim());
          break;
        case 'cta':
          callToAction = line.trim();
          break;
        case 'camera':
          cameraAngles.push(line.trim());
          break;
        case 'transition':
          transitions.push(line.trim());
          break;
        case 'music':
          musicCues.push(line.trim());
          break;
      }
    }
  }

  // Fallback if parsing fails
  if (!hook && mainContent.length === 0) {
    const sentences = content.split('.').filter(s => s.trim());
    hook = sentences[0]?.trim() || 'Welcome to this amazing content!';
    mainContent = sentences.slice(1, -1).map(s => s.trim()).filter(s => s);
    callToAction = sentences[sentences.length - 1]?.trim() || 'Follow for more!';
  }

  return {
    hook,
    mainContent,
    callToAction,
    duration,
    cameraAngles: cameraAngles.length > 0 ? cameraAngles : ['Wide shot', 'Close-up', 'Medium shot'],
    transitions: transitions.length > 0 ? transitions : ['Quick cut', 'Fade', 'Zoom'],
    musicCues: musicCues.length > 0 ? musicCues : ['Upbeat intro', 'Background music', 'Outro music']
  };
}

// Generate video using RunwayML API (mock implementation)
export async function generateVideoWithRunwayML(script: VideoScript, request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
  try {
    // Mock implementation - in real app, integrate with RunwayML API
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return {
      videoId,
      status: 'completed',
      videoUrl: `https://runwayml.com/videos/${videoId}.mp4`,
      thumbnailUrl: `https://runwayml.com/thumbnails/${videoId}.jpg`,
      duration: request.duration,
      platform: request.platform,
      metadata: {
        resolution: getResolutionForPlatform(request.platform),
        aspectRatio: getAspectRatioForPlatform(request.platform),
        fileSize: Math.floor(Math.random() * 50000000) + 10000000, // 10-60MB
        processingTime: 5000
      }
    };
  } catch (error) {
    console.error('Error generating video with RunwayML:', error);
    return {
      videoId: '',
      status: 'failed',
      duration: request.duration,
      platform: request.platform,
      metadata: {
        resolution: '0x0',
        aspectRatio: '0:0'
      },
      error: 'Failed to generate video'
    };
  }
}

// Generate video using Pika API (mock implementation)
export async function generateVideoWithPika(script: VideoScript, request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
  try {
    const videoId = `pika_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      videoId,
      status: 'completed',
      videoUrl: `https://pika.art/videos/${videoId}.mp4`,
      thumbnailUrl: `https://pika.art/thumbnails/${videoId}.jpg`,
      duration: request.duration,
      platform: request.platform,
      metadata: {
        resolution: getResolutionForPlatform(request.platform),
        aspectRatio: getAspectRatioForPlatform(request.platform),
        fileSize: Math.floor(Math.random() * 30000000) + 5000000, // 5-35MB
        processingTime: 3000
      }
    };
  } catch (error) {
    console.error('Error generating video with Pika:', error);
    return {
      videoId: '',
      status: 'failed',
      duration: request.duration,
      platform: request.platform,
      metadata: {
        resolution: '0x0',
        aspectRatio: '0:0'
      },
      error: 'Failed to generate video'
    };
  }
}

// Generate thumbnail using AI
export async function generateThumbnail(
  title: string, 
  platform: string, 
  style: string
): Promise<string> {
  try {
    const prompt = `Create a ${style} thumbnail for a ${platform} video titled "${title}". 
    Make it eye-catching, high-contrast, and optimized for mobile viewing. 
    Include text overlay that's readable at small sizes.`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: getThumbnailSizeForPlatform(platform),
      quality: "standard",
      n: 1,
    });

    return response.data[0]?.url || '';
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return '';
  }
}

// Generate voiceover using ElevenLabs (mock implementation)
export async function generateVoiceover(
  script: string, 
  voice: string = 'default'
): Promise<string> {
  try {
    // Mock implementation - in real app, integrate with ElevenLabs API
    const audioId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return `https://elevenlabs.io/audio/${audioId}.mp3`;
  } catch (error) {
    console.error('Error generating voiceover:', error);
    return '';
  }
}

// Generate background music using Mubert (mock implementation)
export async function generateBackgroundMusic(
  mood: string, 
  duration: number
): Promise<string> {
  try {
    // Mock implementation - in real app, integrate with Mubert API
    const musicId = `music_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return `https://mubert.com/tracks/${musicId}.mp3`;
  } catch (error) {
    console.error('Error generating background music:', error);
    return '';
  }
}

// Helper functions
function getResolutionForPlatform(platform: string): string {
  switch (platform) {
    case 'tiktok':
    case 'instagram':
      return '1080x1920'; // 9:16 vertical
    case 'youtube':
      return '1920x1080'; // 16:9 horizontal
    default:
      return '1080x1920';
  }
}

function getAspectRatioForPlatform(platform: string): string {
  switch (platform) {
    case 'tiktok':
    case 'instagram':
      return '9:16';
    case 'youtube':
      return '16:9';
    default:
      return '9:16';
  }
}

function getThumbnailSizeForPlatform(platform: string): "256x256" | "512x512" | "1024x1024" {
  switch (platform) {
    case 'tiktok':
    case 'instagram':
      return '512x512';
    case 'youtube':
      return '1024x1024';
    default:
      return '512x512';
  }
}

// Main video generation function
export async function generateCompleteVideo(request: VideoGenerationRequest): Promise<{
  script: VideoScript;
  video: VideoGenerationResponse;
  thumbnail: string;
  voiceover?: string;
  music?: string;
}> {
  try {
    // Generate script
    const script = await generateVideoScript(request);
    
    // Generate video (choose provider based on platform or user preference)
    const video = request.platform === 'youtube' 
      ? await generateVideoWithRunwayML(script, request)
      : await generateVideoWithPika(script, request);
    
    // Generate thumbnail
    const thumbnail = await generateThumbnail(
      script.hook, 
      request.platform, 
      request.thumbnailStyle
    );
    
    // Generate voiceover if requested
    let voiceover: string | undefined;
    if (request.includeVoiceover) {
      const scriptText = `${script.hook} ${script.mainContent.join(' ')} ${script.callToAction}`;
      voiceover = await generateVoiceover(scriptText);
    }
    
    // Generate background music if requested
    let music: string | undefined;
    if (request.includeMusic) {
      music = await generateBackgroundMusic('upbeat', request.duration);
    }
    
    return {
      script,
      video,
      thumbnail,
      voiceover,
      music
    };
  } catch (error) {
    console.error('Error generating complete video:', error);
    throw new Error('Failed to generate complete video');
  }
}
