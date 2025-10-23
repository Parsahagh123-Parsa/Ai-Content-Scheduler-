'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SUBSCRIPTION_PLANS, formatPrice, calculateSavings } from '../lib/stripe';

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return;
    
    setIsLoading(planId);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: planId,
          interval: billingInterval
        })
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const getPlanPrice = (plan: any) => {
    if (plan.id === 'free') return 0;
    return billingInterval === 'year' ? plan.price * 10 : plan.price; // 2 months free for yearly
  };

  const getSavings = (plan: any) => {
    if (plan.id === 'free' || billingInterval === 'month') return 0;
    return calculateSavings(plan.price, plan.price * 10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-blue-200 mb-8">
            Unlock the full potential of AI-powered content creation
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-lg ${billingInterval === 'month' ? 'text-white' : 'text-blue-200'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingInterval === 'year' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${billingInterval === 'year' ? 'text-white' : 'text-blue-200'}`}>
              Yearly
            </span>
            {billingInterval === 'year' && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                Save 17%
              </span>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const price = getPlanPrice(plan);
            const savings = getSavings(plan);
            const isPopular = plan.id === 'pro';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border ${
                  isPopular 
                    ? 'border-pink-500/50 ring-2 ring-pink-500/20' 
                    : 'border-white/20'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                {savings > 0 && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      -{savings}%
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-white">
                      {formatPrice(price, billingInterval)}
                    </span>
                    {billingInterval === 'year' && plan.id !== 'free' && (
                      <span className="text-blue-200 text-lg ml-2">
                        (2 months free)
                      </span>
                    )}
                  </div>
                  <p className="text-blue-200">
                    {plan.id === 'free' ? 'Perfect for getting started' : 
                     plan.id === 'pro' ? 'Best for content creators' : 
                     'For agencies and enterprises'}
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-white">{feature}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading === plan.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                    plan.id === 'free'
                      ? 'bg-white/20 text-white border border-white/30'
                      : isPopular
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : plan.id === 'free' ? (
                    'Get Started Free'
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </motion.button>

                {plan.id !== 'free' && (
                  <p className="text-center text-blue-200 text-sm mt-4">
                    Cancel anytime • 30-day money-back guarantee
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-4">Features</th>
                  <th className="text-center py-4 px-4">Free</th>
                  <th className="text-center py-4 px-4">Pro</th>
                  <th className="text-center py-4 px-4">Elite</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Daily AI Generations</td>
                  <td className="text-center py-4 px-4">5</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Content Plans</td>
                  <td className="text-center py-4 px-4">3</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Video Generation</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">✅</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Analytics Dashboard</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">✅</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Priority Support</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">✅</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">API Access</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">White-label Options</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white/10 backdrop-blur-xl rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-3">
                Can I change my plan anytime?
              </h3>
              <p className="text-blue-200">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-3">
                Is there a free trial?
              </h3>
              <p className="text-blue-200">
                Yes! Start with our free plan and upgrade when you're ready. No credit card required.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-blue-200">
                We accept all major credit cards, PayPal, and bank transfers through Stripe.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-3">
                Can I cancel anytime?
              </h3>
              <p className="text-blue-200">
                Absolutely! Cancel your subscription anytime with no cancellation fees or penalties.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
