import { openai } from './openai';
import { getTrendingTopics, getLiveHashtags } from './trends';
import { supabase } from './supabase';

// Generate base content plan using OpenAI
async function generateContentPlan(request: {
  creatorType: string;
  platform: string;
  contentGoal?: string;
  targetAudience?: string;
  trendingTopics: string[];
}): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert content creator specializing in ${request.platform} content for ${request.creatorType} creators. Generate a 7-day content plan with engaging, viral-worthy posts.`
        },
        {
          role: "user",
          content: `Create a 7-day content plan for:
          - Creator Type: ${request.creatorType}
          - Platform: ${request.platform}
          - Content Goal: ${request.contentGoal || 'Grow followers and engagement'}
          - Target Audience: ${request.targetAudience || 'General audience'}
          - Trending Topics: ${request.trendingTopics.join(', ')}
          
          For each day, include:
          - Day name (Monday, Tuesday, etc.)
          - Title (catchy and engaging)
          - Caption (platform-optimized)
          - Hashtags (5-10 relevant hashtags)
          - Time (best posting time)
          - Thumbnail (emoji representing the content)
          - Video Idea (brief description)
          - Script (30-second script outline)
          
          Format as JSON with days as keys.`
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = response.choices?.[0]?.message?.content || '{}';
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing content plan:', parseError);
      // Return fallback plan if JSON parsing fails
      return {
        "Monday": {
          title: "Welcome to Your Content Journey",
          caption: "Starting strong this week! What's your biggest goal?",
          hashtags: "#motivation #goals #monday #inspiration",
          time: "9:00 AM",
          thumbnail: "🚀",
          videoIdea: "Introduction video sharing your goals",
          script: "Hook: 'This week is going to be different...'"
        },
        "Tuesday": {
          title: "Behind the Scenes",
          caption: "Sharing the real process behind the scenes",
          hashtags: "#behindthescenes #process #authentic #tuesday",
          time: "2:00 PM",
          thumbnail: "🎬",
          videoIdea: "Show your workspace or process",
          script: "Hook: 'You asked, so here's how I...'"
        },
        "Wednesday": {
          title: "Midweek Motivation",
          caption: "Wednesday wisdom to keep you going!",
          hashtags: "#wednesday #wisdom #motivation #midweek",
          time: "11:00 AM",
          thumbnail: "💡",
          videoIdea: "Share a tip or lesson learned",
          script: "Hook: 'Here's what I wish I knew...'"
        },
        "Thursday": {
          title: "Throwback Thursday",
          caption: "Looking back at how far we've come",
          hashtags: "#tbt #throwback #progress #thursday",
          time: "3:00 PM",
          thumbnail: "📸",
          videoIdea: "Share old photos or progress",
          script: "Hook: 'Remember when...'"
        },
        "Friday": {
          title: "Friday Favorites",
          caption: "Sharing my top picks for this week",
          hashtags: "#friday #favorites #recommendations #weekend",
          time: "5:00 PM",
          thumbnail: "⭐",
          videoIdea: "Share recommendations or favorites",
          script: "Hook: 'These are my top 3...'"
        },
        "Saturday": {
          title: "Weekend Vibes",
          caption: "Taking time to recharge and reflect",
          hashtags: "#weekend #selfcare #reflection #saturday",
          time: "10:00 AM",
          thumbnail: "☕",
          videoIdea: "Relaxed, personal content",
          script: "Hook: 'Weekend thoughts...'"
        },
        "Sunday": {
          title: "Sunday Planning",
          caption: "Setting intentions for the week ahead",
          hashtags: "#sunday #planning #intentions #newweek",
          time: "7:00 PM",
          thumbnail: "📝",
          videoIdea: "Plan and prep for next week",
          script: "Hook: 'Next week I'm focusing on...'"
        }
      };
    }
  } catch (error) {
    console.error('Error generating content plan:', error);
    // Return a fallback plan
    return {
      "Monday": {
        title: "Welcome to Your Content Journey",
        caption: "Starting strong this week! What's your biggest goal?",
        hashtags: "#motivation #goals #monday #inspiration",
        time: "9:00 AM",
        thumbnail: "🚀",
        videoIdea: "Introduction video sharing your goals",
        script: "Hook: 'This week is going to be different...'"
      },
      "Tuesday": {
        title: "Behind the Scenes",
        caption: "Sharing the real process behind the scenes",
        hashtags: "#behindthescenes #process #authentic #tuesday",
        time: "2:00 PM",
        thumbnail: "🎬",
        videoIdea: "Show your workspace or process",
        script: "Hook: 'You asked, so here's how I...'"
      },
      "Wednesday": {
        title: "Midweek Motivation",
        caption: "Wednesday wisdom to keep you going!",
        hashtags: "#wednesday #wisdom #motivation #midweek",
        time: "11:00 AM",
        thumbnail: "💡",
        videoIdea: "Share a tip or lesson learned",
        script: "Hook: 'Here's what I wish I knew...'"
      },
      "Thursday": {
        title: "Throwback Thursday",
        caption: "Looking back at how far we've come",
        hashtags: "#tbt #throwback #progress #thursday",
        time: "3:00 PM",
        thumbnail: "📸",
        videoIdea: "Share old photos or progress",
        script: "Hook: 'Remember when...'"
      },
      "Friday": {
        title: "Friday Favorites",
        caption: "Sharing my top picks for this week",
        hashtags: "#friday #favorites #recommendations #weekend",
        time: "5:00 PM",
        thumbnail: "⭐",
        videoIdea: "Share recommendations or favorites",
        script: "Hook: 'These are my top 3...'"
      },
      "Saturday": {
        title: "Weekend Vibes",
        caption: "Taking time to recharge and reflect",
        hashtags: "#weekend #selfcare #reflection #saturday",
        time: "10:00 AM",
        thumbnail: "☕",
        videoIdea: "Relaxed, personal content",
        script: "Hook: 'Weekend thoughts...'"
      },
      "Sunday": {
        title: "Sunday Planning",
        caption: "Setting intentions for the week ahead",
        hashtags: "#sunday #planning #intentions #newweek",
        time: "7:00 PM",
        thumbnail: "📝",
        videoIdea: "Plan and prep for next week",
        script: "Hook: 'Next week I'm focusing on...'"
      }
    };
  }
}

export interface ContentRequest {
  creatorType: string;
  platform: string;
  contentGoal?: string;
  targetAudience?: string;
  tone?: 'funny' | 'motivational' | 'educational' | 'engaging' | 'professional';
  keyword?: string;
  regenerate?: boolean;
}

export interface EnhancedContentPlan {
  [key: string]: {
    title: string;
    caption: string;
    viralCaption: string; // Rewritten using viral TikTok references
    hashtags: string[];
    liveHashtags: string[]; // Live hashtags based on keyword
    time: string;
    thumbnail: string;
    videoIdea: string;
    script: string;
    trendingTopics: string[];
  };
}

export async function generateEnhancedContentPlan(request: ContentRequest): Promise<{
  contentPlan: EnhancedContentPlan;
  trendingTopics: string[];
  analytics: any;
}> {
  try {
    // Get trending topics for the platform
    const trendingTopics = await getTrendingTopics(request.platform, request.keyword);
    
    // Get live hashtags if keyword is provided
    const liveHashtags = request.keyword ? await getLiveHashtags(request.keyword) : [];
    
    // Generate base content plan
    const basePlan = await generateContentPlan({
      creatorType: request.creatorType,
      platform: request.platform,
      contentGoal: request.contentGoal,
      targetAudience: request.targetAudience,
      trendingTopics: trendingTopics.map(t => t.topic),
    });

    // Enhance each day with viral captions and live hashtags
    const enhancedPlan: EnhancedContentPlan = {};
    
    for (const [day, content] of Object.entries(basePlan)) {
      // Rewrite caption using viral TikTok references
      const viralCaption = await rewriteCaptionViral(
        content.caption,
        request.platform,
        request.tone || 'engaging'
      );

      // Generate live hashtags for this specific content
      const contentKeywords = extractKeywords(content.title + ' ' + content.caption);
      const contentLiveHashtags = await Promise.all(
        contentKeywords.map(keyword => getLiveHashtags(keyword))
      );
      const flatLiveHashtags = contentLiveHashtags.flat().slice(0, 5);

      enhancedPlan[day] = {
        ...content,
        viralCaption,
        hashtags: content.hashtags.split(' ').filter(h => h.trim()),
        liveHashtags: flatLiveHashtags,
        trendingTopics: trendingTopics.map(t => t.topic),
      };
    }

    // Log analytics
    const analytics = await logContentGeneration(request, enhancedPlan);

    return {
      contentPlan: enhancedPlan,
      trendingTopics: trendingTopics.map(t => t.topic),
      analytics,
    };
  } catch (error) {
    console.error('Error generating enhanced content plan:', error);
    throw error;
  }
}

async function rewriteCaptionViral(
  originalCaption: string,
  platform: string,
  tone: string
): Promise<string> {
  try {
    
    const systemPrompt = `You are a viral content expert who specializes in ${platform} captions. 
    Rewrite the given caption to make it more viral and engaging, using proven techniques from top-performing ${platform} content.
    
    Tone: ${tone}
    Platform: ${platform}
    
    Techniques to use:
    - Hook the viewer in the first 3 words
    - Use emotional triggers (curiosity, FOMO, excitement)
    - Include a clear call-to-action
    - Use platform-specific language and trends
    - Keep it concise but impactful
    - Add urgency or scarcity when appropriate`;

    const userPrompt = `Rewrite this caption to be more viral for ${platform}:
    
    Original: "${originalCaption}"
    
    Make it ${tone} and highly engaging. Focus on maximizing views, likes, and shares.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    return response.choices?.[0]?.message?.content || originalCaption;
  } catch (error) {
    console.error('Error rewriting caption:', error);
    return originalCaption;
  }
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - in production, you'd use a more sophisticated NLP library
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !isStopWord(word));
  
  // Get unique words and return top 3
  const uniqueWords = [...new Set(words)];
  return uniqueWords.slice(0, 3);
}

function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'man', 'men', 'put', 'say', 'she', 'too', 'use'
  ]);
  return stopWords.has(word);
}

async function logContentGeneration(request: ContentRequest, plan: EnhancedContentPlan) {
  try {
    const analytics = {
      event_type: 'content_generation',
      event_data: {
        creator_type: request.creatorType,
        platform: request.platform,
        tone: request.tone,
        has_keyword: !!request.keyword,
        plan_days: Object.keys(plan).length,
        generated_at: new Date().toISOString(),
      }
    };

    await supabase
      .from('analytics')
      .insert([analytics]);

    return analytics;
  } catch (error) {
    console.error('Error logging analytics:', error);
    return null;
  }
}

// Function to regenerate plan with different tone
export async function regeneratePlanWithTone(
  originalRequest: ContentRequest,
  newTone: string
): Promise<{
  contentPlan: EnhancedContentPlan;
  trendingTopics: string[];
  analytics: any;
}> {
  const newRequest = { ...originalRequest, tone: newTone as any, regenerate: true };
  return generateEnhancedContentPlan(newRequest);
}

// Function to generate video scripts
export async function generateVideoScript(
  title: string,
  platform: string,
  duration: number = 60
): Promise<string> {
  try {
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional video script writer specializing in ${platform} content. Create engaging, viral video scripts that hook viewers and keep them watching until the end.`
        },
        {
          role: "user",
          content: `Create a ${duration}-second video script for: "${title}"
          
          Platform: ${platform}
          
          Include:
          - Hook (first 3 seconds)
          - Main content (middle section)
          - Call-to-action (last 5 seconds)
          - Visual cues and timing
          - Engaging transitions
          
          Format as a detailed script with timestamps.`
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    return response.choices?.[0]?.message?.content || 'Script generation failed';
  } catch (error) {
    console.error('Error generating video script:', error);
    return 'Script generation failed';
  }
}

// Function to analyze video tone/style from sample
export async function analyzeVideoTone(videoDescription: string): Promise<{
  tone: string;
  style: string;
  characteristics: string[];
}> {
  try {
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a video content analyst. Analyze the tone, style, and characteristics of video content to help creators maintain consistency."
        },
        {
          role: "user",
          content: `Analyze this video description and determine the tone, style, and key characteristics:
          
          "${videoDescription}"
          
          Return as JSON with: tone, style, characteristics (array of strings)`
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const analysis = response.choices?.[0]?.message?.content;
    try {
      return JSON.parse(analysis || '{}');
    } catch {
      return {
        tone: 'engaging',
        style: 'casual',
        characteristics: ['energetic', 'informative']
      };
    }
  } catch (error) {
    console.error('Error analyzing video tone:', error);
    return {
      tone: 'engaging',
      style: 'casual',
      characteristics: ['energetic', 'informative']
    };
  }
}
