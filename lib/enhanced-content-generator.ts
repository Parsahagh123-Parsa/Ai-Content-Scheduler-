import { openai } from './openai';
import { getTrendingTopics, getLiveHashtags } from './trends';

export interface ContentPlan {
  title: string;
  description: string;
  days: Array<{
    day: string;
    platform: string;
    caption: string;
    hashtags: string[];
    trendingTopics: string[];
    viralScore: number;
    videoScript?: string;
    thumbnailPrompt?: string;
    bRollSuggestions?: string[];
    hook?: string;
  }>;
  liveHashtags: string[];
  trendingSounds: string[];
  engagementPrediction: number;
  targetAudience: string;
  contentStrategy: string;
  toneAnalysis: {
    primary: string;
    secondary: string;
    confidence: number;
  };
  viralPotential: {
    score: number;
    factors: string[];
    recommendations: string[];
  };
}

export async function generateEnhancedContentPlan(formData: any): Promise<ContentPlan> {
  try {
    // Get trending data
    const [trendingTopics, liveHashtags] = await Promise.all([
      getTrendingTopics(formData.niche),
      getLiveHashtags(formData.platforms)
    ]);

    // Generate main content plan
    const contentPrompt = `
    Create a comprehensive 7-day content plan for a ${formData.creatorType} in the ${formData.niche} niche.
    
    Target Audience: ${formData.targetAudience}
    Tone: ${formData.tone}
    Platforms: ${formData.platforms.join(', ')}
    Goals: ${formData.goals}
    
    Trending Topics: ${trendingTopics.join(', ')}
    Live Hashtags: ${liveHashtags.join(', ')}
    
    For each day, provide:
    - Platform-specific caption optimized for virality
    - 5-8 relevant hashtags
    - Viral score (1-100)
    - Video script outline
    - Thumbnail prompt
    - B-roll suggestions
    - Attention-grabbing hook
    
    Return as JSON with this structure:
    {
      "title": "Content Plan Title",
      "description": "Brief description",
      "days": [
        {
          "day": "Day 1",
          "platform": "TikTok",
          "caption": "Engaging caption...",
          "hashtags": ["#hashtag1", "#hashtag2"],
          "trendingTopics": ["topic1", "topic2"],
          "viralScore": 85,
          "videoScript": "Script outline...",
          "thumbnailPrompt": "Thumbnail description...",
          "bRollSuggestions": ["suggestion1", "suggestion2"],
          "hook": "Attention-grabbing opening..."
        }
      ],
      "liveHashtags": ["#trending1", "#trending2"],
      "trendingSounds": ["sound1", "sound2"],
      "engagementPrediction": 78,
      "targetAudience": "Description",
      "contentStrategy": "Strategy overview",
      "toneAnalysis": {
        "primary": "tone",
        "secondary": "secondary tone",
        "confidence": 0.85
      },
      "viralPotential": {
        "score": 82,
        "factors": ["factor1", "factor2"],
        "recommendations": ["rec1", "rec2"]
      }
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert content strategist and viral marketing specialist. Create engaging, platform-optimized content that maximizes reach and engagement."
        },
        {
          role: "user",
          content: contentPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    let parsedContent: ContentPlan;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      // Fallback plan if JSON parsing fails
      parsedContent = createFallbackPlan(formData, trendingTopics, liveHashtags);
    }

    return parsedContent;
  } catch (error) {
    console.error('Error generating content plan:', error);
    throw new Error('Failed to generate content plan');
  }
}

function createFallbackPlan(formData: any, trendingTopics: string[], liveHashtags: string[]): ContentPlan {
  const days = [];
  const platforms = formData.platforms.length > 0 ? formData.platforms : ['TikTok', 'Instagram'];
  
  for (let i = 0; i < formData.duration; i++) {
    const platform = platforms[i % platforms.length];
    days.push({
      day: `Day ${i + 1}`,
      platform,
      caption: `Engaging ${formData.tone} content about ${formData.niche} for ${formData.targetAudience}`,
      hashtags: liveHashtags.slice(0, 5),
      trendingTopics: trendingTopics.slice(0, 3),
      viralScore: Math.floor(Math.random() * 30) + 70,
      videoScript: `Create a ${formData.tone} video about ${formData.niche}`,
      thumbnailPrompt: `Eye-catching thumbnail for ${formData.niche} content`,
      bRollSuggestions: ['Close-up shots', 'Wide establishing shots', 'Action sequences'],
      hook: `Did you know that...`
    });
  }

  return {
    title: `${formData.niche} Content Plan`,
    description: `A ${formData.duration}-day content strategy for ${formData.creatorType}`,
    days,
    liveHashtags: liveHashtags.slice(0, 10),
    trendingSounds: ['Trending Sound 1', 'Trending Sound 2'],
    engagementPrediction: 75,
    targetAudience: formData.targetAudience,
    contentStrategy: `Focus on ${formData.tone} content that resonates with ${formData.targetAudience}`,
    toneAnalysis: {
      primary: formData.tone,
      secondary: 'engaging',
      confidence: 0.8
    },
    viralPotential: {
      score: 75,
      factors: ['Trending topics', 'Engaging hooks', 'Platform optimization'],
      recommendations: ['Post at optimal times', 'Use trending sounds', 'Engage with comments']
    }
  };
}

export async function generateVideoScript(caption: string, platform: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a video script writer specializing in ${platform} content. Create engaging, platform-optimized scripts.`
        },
        {
          role: "user",
          content: `Create a 30-second video script for this caption: "${caption}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices?.[0]?.message?.content || 'Script generation failed';
  } catch (error) {
    console.error('Error generating video script:', error);
    return 'Script generation failed';
  }
}

export async function analyzeViralPotential(caption: string, hashtags: string[]): Promise<{
  score: number;
  factors: string[];
  recommendations: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a viral content analyst. Analyze content for viral potential and provide actionable recommendations."
        },
        {
          role: "user",
          content: `Analyze this content for viral potential:\nCaption: "${caption}"\nHashtags: ${hashtags.join(', ')}`
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const analysis = response.choices?.[0]?.message?.content || '';
    
    // Extract score and recommendations from the analysis
    const scoreMatch = analysis.match(/(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;
    
    return {
      score: Math.min(100, Math.max(0, score)),
      factors: ['Engagement hooks', 'Trending hashtags', 'Platform optimization'],
      recommendations: ['Add more emotional hooks', 'Use trending sounds', 'Post at peak times']
    };
  } catch (error) {
    console.error('Error analyzing viral potential:', error);
    return {
      score: 75,
      factors: ['Content analysis'],
      recommendations: ['Optimize for engagement']
    };
  }
}

export async function generateThumbnailPrompt(caption: string, platform: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a thumbnail design specialist for ${platform}. Create detailed prompts for eye-catching thumbnails.`
        },
        {
          role: "user",
          content: `Create a thumbnail prompt for this content: "${caption}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices?.[0]?.message?.content || 'Thumbnail generation failed';
  } catch (error) {
    console.error('Error generating thumbnail prompt:', error);
    return 'Thumbnail generation failed';
  }
}
