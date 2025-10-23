'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface OptimizationResult {
  score: number;
  factors: {
    hook: { score: number; feedback: string };
    hashtags: { score: number; feedback: string };
    length: { score: number; feedback: string };
    emotion: { score: number; feedback: string };
    trending: { score: number; feedback: string };
  };
  suggestions: string[];
  improvedVersion: string;
}

export default function SmartPostOptimizer() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePost = async (text: string): Promise<OptimizationResult> => {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const words = text.split(' ');
    const hashtags = text.match(/#\w+/g) || [];
    const questions = text.match(/\?/g) || [];
    const exclamations = text.match(/!/g) || [];

    // Calculate scores
    const hookScore = text.length > 0 && text.length < 50 ? 90 : 60;
    const hashtagScore = hashtags.length >= 3 && hashtags.length <= 8 ? 85 : 50;
    const lengthScore = words.length >= 10 && words.length <= 30 ? 80 : 60;
    const emotionScore = (questions.length + exclamations.length) > 0 ? 75 : 40;
    const trendingScore = hashtags.some(tag => 
      ['#viral', '#fyp', '#trending', '#explore'].includes(tag.toLowerCase())
    ) ? 90 : 60;

    const overallScore = Math.round(
      (hookScore + hashtagScore + lengthScore + emotionScore + trendingScore) / 5
    );

    return {
      score: overallScore,
      factors: {
        hook: {
          score: hookScore,
          feedback: hookScore > 80 ? 'Great hook! Short and engaging.' : 'Consider shortening your opening line for better impact.'
        },
        hashtags: {
          score: hashtagScore,
          feedback: hashtagScore > 80 ? 'Perfect hashtag count and relevance.' : 'Add 3-8 relevant hashtags for better discoverability.'
        },
        length: {
          score: lengthScore,
          feedback: lengthScore > 80 ? 'Ideal length for social media.' : 'Consider adjusting length for better engagement.'
        },
        emotion: {
          score: emotionScore,
          feedback: emotionScore > 70 ? 'Good emotional engagement.' : 'Add questions or exclamations to increase engagement.'
        },
        trending: {
          score: trendingScore,
          feedback: trendingScore > 80 ? 'Great use of trending hashtags!' : 'Include trending hashtags like #viral, #fyp for better reach.'
        }
      },
      suggestions: [
        'Add a compelling hook in the first line',
        'Include 3-5 trending hashtags',
        'Ask a question to encourage engagement',
        'Use emojis to add personality',
        'Keep it concise and scannable'
      ],
      improvedVersion: generateImprovedVersion(text, overallScore)
    };
  };

  const generateImprovedVersion = (text: string, score: number): string => {
    if (score > 80) return text; // Already good

    let improved = text;
    
    // Add hook if missing
    if (!improved.startsWith('Did you know') && !improved.startsWith('Here\'s') && !improved.startsWith('POV:')) {
      improved = `POV: ${improved}`;
    }

    // Add trending hashtags if missing
    const hashtags = improved.match(/#\w+/g) || [];
    if (hashtags.length < 3) {
      improved += ' #viral #fyp #trending';
    }

    // Add question if missing
    if (!improved.includes('?')) {
      improved += ' What do you think?';
    }

    return improved;
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzePost(inputText);
      setResult(analysis);
    } catch (error) {
      console.error('Error analyzing post:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🎯 Smart Post Optimizer
          </h1>
          <p className="text-xl text-blue-200">
            Analyze and optimize your content for maximum viral potential
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Analyze Your Post</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Your Content</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your caption, post, or content here..."
                  className="w-full h-32 p-4 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 resize-none"
                />
                <p className="text-sm text-blue-200 mt-1">
                  {inputText.length} characters
                </p>
              </div>

              <motion.button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isAnalyzing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-6 rounded-lg disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  'Analyze for Virality 🚀'
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Analysis Results</h2>
            
            {result ? (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(result.score)} border-4 border-white/30`}>
                    <span className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}
                    </span>
                  </div>
                  <p className="text-white mt-2 text-lg">Viral Score</p>
                  <p className="text-blue-200 text-sm">
                    {result.score >= 80 ? 'Excellent! This has high viral potential.' :
                     result.score >= 60 ? 'Good! Some optimizations could help.' :
                     'Needs improvement for better viral potential.'}
                  </p>
                </div>

                {/* Factor Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Factor Analysis</h3>
                  
                  {Object.entries(result.factors).map(([key, factor]) => (
                    <div key={key} className="bg-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white capitalize">{key}</span>
                        <span className={`font-bold ${getScoreColor(factor.score)}`}>
                          {factor.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full ${
                            factor.score >= 80 ? 'bg-green-500' :
                            factor.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${factor.score}%` }}
                        ></div>
                      </div>
                      <p className="text-blue-200 text-sm">{factor.feedback}</p>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-3">💡 Suggestions</h3>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-blue-200 text-sm flex items-start">
                        <span className="text-pink-400 mr-2">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improved Version */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-3">✨ Improved Version</h3>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-white text-sm">{result.improvedVersion}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-blue-200">
                <p>Enter your content and click "Analyze for Virality" to see detailed insights!</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
