import { NextRequest, NextResponse } from 'next/server';
import { generateViralHooks } from '@/lib/viral-hook-generator';
import { generateBrollRecommendations } from '@/lib/b-roll-recommendations';
import { generateThumbnailSuggestions } from '@/lib/ai-thumbnail-composer';
import { generateTTS } from '@/lib/text-to-speech';
import { generateBackgroundMusic } from '@/lib/background-music';
import { generateAutoEdit } from '@/lib/auto-edit-mode';
import { generateSubtitles } from '@/lib/subtitle-generation';
import { generateEnhancedContentPlan } from '@/lib/enhanced-content-generator';
import { analyzeAndOptimizePost } from '@/lib/smart-optimizer-enhanced';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      content,
      platform,
      contentType,
      targetAudience,
      duration,
      style,
      mood,
      includeAllFeatures = false
    } = body;

    // Validate required fields
    if (!type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: type and content' },
        { status: 400 }
      );
    }

    let result: any = {};

    switch (type) {
      case 'viral-hooks':
        result = await generateViralHooks({
          topic: content,
          platform: platform || 'tiktok',
          targetAudience: targetAudience || 'general',
          contentType: contentType || 'entertainment',
          tone: 'casual',
          duration: duration || 15,
          includeTrendingElements: true,
          includeEmojis: true,
          includeQuestions: true
        });
        break;

      case 'b-roll':
        result = await generateBrollRecommendations({
          caption: content,
          platform: platform || 'tiktok',
          contentType: contentType || 'entertainment',
          duration: duration || 30,
          style: style || 'cinematic',
          mood: mood || 'energetic',
          targetAudience: targetAudience || 'general',
          budget: 'medium',
          equipment: ['camera', 'tripod'],
          location: 'studio'
        });
        break;

      case 'thumbnails':
        result = await generateThumbnailSuggestions({
          title: content,
          caption: content,
          platform: platform || 'youtube',
          contentType: contentType || 'entertainment',
          style: style || 'bold',
          mood: mood || 'energetic',
          targetAudience: targetAudience || 'general',
          includeText: true,
          textStyle: 'bold',
          dimensions: { width: 1280, height: 720 },
          budget: 'medium'
        });
        break;

      case 'text-to-speech':
        result = await generateTTS({
          text: content,
          settings: {
            voice: 'alloy',
            speed: 1.0,
            pitch: 1.0,
            volume: 0.8,
            emotion: mood || 'neutral',
            accent: 'american'
          },
          platform: platform || 'tiktok',
          duration: duration || 30,
          includeBackgroundMusic: true,
          musicStyle: 'upbeat'
        });
        break;

      case 'background-music':
        result = await generateBackgroundMusic({
          style: style || 'upbeat',
          duration: duration || 30,
          mood: mood || 'energetic',
          tempo: 'medium',
          instruments: ['drums', 'bass', 'synth'],
          platform: platform || 'tiktok',
          genre: 'electronic',
          volume: 0.6
        });
        break;

      case 'auto-edit':
        result = await generateAutoEdit({
          videoUrl: content, // Assuming content is video URL
          caption: content,
          platform: platform || 'tiktok',
          contentType: contentType || 'entertainment',
          targetDuration: duration || 60,
          style: style || 'fast-paced',
          mood: mood || 'energetic',
          includeTransitions: true,
          includeEffects: true,
          includeMusic: true,
          includeSubtitles: true,
          quality: 'high',
          aspectRatio: '16:9'
        });
        break;

      case 'subtitles':
        result = await generateSubtitles({
          text: content,
          platform: platform || 'tiktok',
          contentType: contentType || 'entertainment',
          duration: duration || 30,
          style: style || 'bold',
          mood: mood || 'energetic',
          language: 'en',
          includeEmojis: true,
          includeHashtags: true,
          maxLength: 50,
          timing: 'auto',
          targetAudience: targetAudience || 'general'
        });
        break;

      case 'content-plan':
        result = await generateEnhancedContentPlan({
          creatorType: content,
          platform: platform || 'tiktok',
          contentGoal: 'increase engagement',
          targetAudience: targetAudience || 'general',
          tone: mood || 'motivational',
          duration: duration || 7
        });
        break;

      case 'post-optimization':
        result = await analyzeAndOptimizePost({
          caption: content,
          niche: contentType || 'general',
          targetAudience: targetAudience || 'general',
          platform: platform || 'tiktok',
          existingTrends: []
        });
        break;

      case 'comprehensive':
        // Generate all features for comprehensive content creation
        const [
          viralHooks,
          brollSuggestions,
          thumbnailSuggestions,
          ttsResult,
          musicResult,
          autoEditResult,
          subtitleResult,
          contentPlan,
          optimizationResult
        ] = await Promise.all([
          generateViralHooks({
            topic: content,
            platform: platform || 'tiktok',
            targetAudience: targetAudience || 'general',
            contentType: contentType || 'entertainment',
            tone: 'casual',
            duration: duration || 15,
            includeTrendingElements: true,
            includeEmojis: true,
            includeQuestions: true
          }),
          generateBrollRecommendations({
            caption: content,
            platform: platform || 'tiktok',
            contentType: contentType || 'entertainment',
            duration: duration || 30,
            style: style || 'cinematic',
            mood: mood || 'energetic',
            targetAudience: targetAudience || 'general',
            budget: 'medium',
            equipment: ['camera', 'tripod'],
            location: 'studio'
          }),
          generateThumbnailSuggestions({
            title: content,
            caption: content,
            platform: platform || 'youtube',
            contentType: contentType || 'entertainment',
            style: style || 'bold',
            mood: mood || 'energetic',
            targetAudience: targetAudience || 'general',
            includeText: true,
            textStyle: 'bold',
            dimensions: { width: 1280, height: 720 },
            budget: 'medium'
          }),
          generateTTS({
            text: content,
            settings: {
              voice: 'alloy',
              speed: 1.0,
              pitch: 1.0,
              volume: 0.8,
              emotion: mood || 'neutral',
              accent: 'american'
            },
            platform: platform || 'tiktok',
            duration: duration || 30,
            includeBackgroundMusic: true,
            musicStyle: 'upbeat'
          }),
          generateBackgroundMusic({
            style: style || 'upbeat',
            duration: duration || 30,
            mood: mood || 'energetic',
            tempo: 'medium',
            instruments: ['drums', 'bass', 'synth'],
            platform: platform || 'tiktok',
            genre: 'electronic',
            volume: 0.6
          }),
          generateAutoEdit({
            videoUrl: content,
            caption: content,
            platform: platform || 'tiktok',
            contentType: contentType || 'entertainment',
            targetDuration: duration || 60,
            style: style || 'fast-paced',
            mood: mood || 'energetic',
            includeTransitions: true,
            includeEffects: true,
            includeMusic: true,
            includeSubtitles: true,
            quality: 'high',
            aspectRatio: '16:9'
          }),
          generateSubtitles({
            text: content,
            platform: platform || 'tiktok',
            contentType: contentType || 'entertainment',
            duration: duration || 30,
            style: style || 'bold',
            mood: mood || 'energetic',
            language: 'en',
            includeEmojis: true,
            includeHashtags: true,
            maxLength: 50,
            timing: 'auto',
            targetAudience: targetAudience || 'general'
          }),
          generateEnhancedContentPlan({
            creatorType: content,
            platform: platform || 'tiktok',
            contentGoal: 'increase engagement',
            targetAudience: targetAudience || 'general',
            tone: mood || 'motivational',
            duration: duration || 7
          }),
          analyzeAndOptimizePost({
            caption: content,
            niche: contentType || 'general',
            targetAudience: targetAudience || 'general',
            platform: platform || 'tiktok',
            existingTrends: []
          })
        ]);

        result = {
          viralHooks,
          brollSuggestions,
          thumbnailSuggestions,
          ttsResult,
          musicResult,
          autoEditResult,
          subtitleResult,
          contentPlan,
          optimizationResult,
          summary: {
            totalFeatures: 9,
            platform: platform || 'tiktok',
            contentType: contentType || 'entertainment',
            estimatedEngagement: calculateEstimatedEngagement(viralHooks, optimizationResult),
            recommendedActions: generateRecommendedActions(viralHooks, optimizationResult)
          }
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type. Supported types: viral-hooks, b-roll, thumbnails, text-to-speech, background-music, auto-edit, subtitles, content-plan, post-optimization, comprehensive' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      result,
      timestamp: new Date().toISOString(),
      metadata: {
        platform: platform || 'tiktok',
        contentType: contentType || 'entertainment',
        duration: duration || 30,
        style: style || 'default',
        mood: mood || 'neutral'
      }
    });

  } catch (error) {
    console.error('Error in comprehensive content API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate estimated engagement
function calculateEstimatedEngagement(viralHooks: any, optimizationResult: any): number {
  const hookScore = viralHooks?.metadata?.averageViralityScore || 50;
  const optimizationScore = optimizationResult?.viralityScore || 50;
  return Math.round((hookScore + optimizationScore) / 2);
}

// Helper function to generate recommended actions
function generateRecommendedActions(viralHooks: any, optimizationResult: any): string[] {
  const actions = [];
  
  if (viralHooks?.metadata?.averageViralityScore > 80) {
    actions.push('Use the high-scoring viral hooks for maximum engagement');
  }
  
  if (optimizationResult?.viralityScore > 70) {
    actions.push('Content is well-optimized for virality');
  }
  
  if (viralHooks?.suggestions?.length > 0) {
    actions.push('Test multiple hook variations to find the best performer');
  }
  
  actions.push('Monitor performance and adjust strategy based on results');
  actions.push('A/B test different content formats and styles');
  
  return actions;
}

// GET endpoint for API documentation
export async function GET() {
  return NextResponse.json({
    name: 'Comprehensive Content API',
    version: '1.0.0',
    description: 'AI-powered content creation and optimization API',
    endpoints: {
      POST: {
        description: 'Generate comprehensive content using AI',
        body: {
          type: 'string (required) - Type of content to generate',
          content: 'string (required) - Content input',
          platform: 'string (optional) - Target platform',
          contentType: 'string (optional) - Type of content',
          targetAudience: 'string (optional) - Target audience',
          duration: 'number (optional) - Duration in seconds',
          style: 'string (optional) - Content style',
          mood: 'string (optional) - Content mood',
          includeAllFeatures: 'boolean (optional) - Include all features'
        },
        supportedTypes: [
          'viral-hooks',
          'b-roll',
          'thumbnails',
          'text-to-speech',
          'background-music',
          'auto-edit',
          'subtitles',
          'content-plan',
          'post-optimization',
          'comprehensive'
        ]
      }
    },
    examples: {
      viralHooks: {
        type: 'viral-hooks',
        content: 'fitness tips',
        platform: 'tiktok',
        contentType: 'educational'
      },
      comprehensive: {
        type: 'comprehensive',
        content: 'motivational content',
        platform: 'youtube',
        contentType: 'motivational',
        includeAllFeatures: true
      }
    }
  });
}
