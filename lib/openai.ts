import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ContentPlan {
  [key: string]: {
    title: string;
    caption: string;
    hashtags: string;
    time: string;
    thumbnail: string;
    videoIdea?: string;
    script?: string;
  };
}

export interface ContentRequest {
  creatorType: string;
  platform: string;
  contentGoal?: string;
  targetAudience?: string;
  trendingTopics?: string[];
}

export async function generateContentPlan(request: ContentRequest): Promise<ContentPlan> {
  try {
    const systemPrompt = `You are an expert social media content strategist and viral content creator. 
    Create engaging, platform-specific content plans that drive engagement and growth.
    
    Focus on:
    - Platform-specific best practices
    - Viral potential and trending formats
    - Clear, actionable content ideas
    - Optimal posting times
    - Relevant hashtags and captions
    - Creative thumbnail concepts`;

    const userPrompt = `Create a 7-day content plan for a ${request.creatorType} creator on ${request.platform}.
    
    ${request.contentGoal ? `Content Goal: ${request.contentGoal}` : ''}
    ${request.targetAudience ? `Target Audience: ${request.targetAudience}` : ''}
    ${request.trendingTopics ? `Trending Topics to incorporate: ${request.trendingTopics.join(', ')}` : ''}
    
    For each day, provide:
    - A catchy, click-worthy title
    - An engaging caption (2-3 sentences)
    - 5-8 relevant hashtags
    - Optimal posting time
    - A creative thumbnail concept (emoji representation)
    - A brief video idea/script outline
    
    Make the content:
    - Platform-optimized for ${request.platform}
    - Engaging and shareable
    - Authentic to the ${request.creatorType} niche
    - Varied in format and approach
    - Designed to build audience and drive engagement`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the AI response into structured data
    return parseContentPlan(content);
  } catch (error) {
    console.error('Error generating content plan:', error);
    throw new Error('Failed to generate content plan');
  }
}

function parseContentPlan(content: string): ContentPlan {
  // This is a simplified parser - in production, you'd want more robust parsing
  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const plan: ContentPlan = {};

  // Split content by day markers
  const daySections = content.split(/(?=Day \d+)/i);
  
  daySections.forEach((section, index) => {
    if (index < days.length) {
      const day = days[index];
      
      // Extract title (usually the first line after "Day X:")
      const titleMatch = section.match(/(?:title|idea)[:\s]*(.+?)(?:\n|$)/i);
      const title = titleMatch ? titleMatch[1].trim() : `Content for ${day}`;
      
      // Extract caption (look for caption or description)
      const captionMatch = section.match(/(?:caption|description)[:\s]*(.+?)(?:\n|$)/i);
      const caption = captionMatch ? captionMatch[1].trim() : `Engaging content for ${day}`;
      
      // Extract hashtags
      const hashtagMatch = section.match(/(?:hashtags|tags)[:\s]*(.+?)(?:\n|$)/i);
      const hashtags = hashtagMatch ? hashtagMatch[1].trim() : `#${day.toLowerCase().replace(' ', '')} #content #viral`;
      
      // Extract time
      const timeMatch = section.match(/(?:time|schedule)[:\s]*(.+?)(?:\n|$)/i);
      const time = timeMatch ? timeMatch[1].trim() : '2:00 PM';
      
      // Extract thumbnail concept
      const thumbnailMatch = section.match(/(?:thumbnail|visual)[:\s]*(.+?)(?:\n|$)/i);
      const thumbnail = thumbnailMatch ? thumbnailMatch[1].trim() : '📱';
      
      plan[day] = {
        title,
        caption,
        hashtags,
        time,
        thumbnail,
        videoIdea: `Video idea for ${title}`,
        script: `Brief script outline for ${title}`
      };
    }
  });

  return plan;
}

export async function generateTrendingTopics(platform: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a social media trends expert. Provide 5-7 trending topics for the given platform that are relevant for content creators."
        },
        {
          role: "user",
          content: `What are the current trending topics on ${platform} that content creators should know about?`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      return [];
    }

    // Parse trending topics from the response
    const topics = content
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter(topic => topic.length > 0)
      .slice(0, 7);

    return topics;
  } catch (error) {
    console.error('Error generating trending topics:', error);
    return [];
  }
}
