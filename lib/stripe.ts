import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    dailyAICalls: number;
    contentPlans: number;
    videoGeneration: boolean;
    analytics: boolean;
    prioritySupport: boolean;
  };
  stripePriceId: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '5 AI generations per day',
      'Basic content templates',
      'Standard hashtags',
      'Community support'
    ],
    limits: {
      dailyAICalls: 5,
      contentPlans: 3,
      videoGeneration: false,
      analytics: false,
      prioritySupport: false
    },
    stripePriceId: ''
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: [
      'Unlimited AI generations',
      'Advanced content templates',
      'Trend analysis',
      'Video generation',
      'Analytics dashboard',
      'Priority support'
    ],
    limits: {
      dailyAICalls: -1, // unlimited
      contentPlans: -1,
      videoGeneration: true,
      analytics: true,
      prioritySupport: true
    },
    stripePriceId: 'price_pro_monthly'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Custom AI models',
      'White-label options',
      'API access',
      'Dedicated support',
      'Custom integrations'
    ],
    limits: {
      dailyAICalls: -1,
      contentPlans: -1,
      videoGeneration: true,
      analytics: true,
      prioritySupport: true
    },
    stripePriceId: 'price_elite_monthly'
  }
];

export async function createCheckoutSession(
  priceId: string,
  customerId?: string,
  successUrl?: string,
  cancelUrl?: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customerId,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        source: 'ai_content_scheduler'
      }
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

export async function createCustomerPortalSession(customerId: string, returnUrl?: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return session;
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw new Error('Failed to create customer portal session');
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw new Error('Failed to retrieve subscription');
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

export async function updateSubscription(subscriptionId: string, newPriceId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription');
  }
}

export async function handleWebhook(payload: string, signature: string) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        // Handle successful subscription creation
        console.log('Checkout session completed:', session.id);
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        // Handle subscription updates
        console.log('Subscription updated:', subscription.id);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        // Handle subscription cancellation
        console.log('Subscription deleted:', deletedSubscription.id);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        // Handle successful payment
        console.log('Payment succeeded:', invoice.id);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        // Handle failed payment
        console.log('Payment failed:', failedInvoice.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  } catch (error) {
    console.error('Webhook error:', error);
    throw new Error('Webhook signature verification failed');
  }
}

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
}

export function getPlanByStripePriceId(priceId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.stripePriceId === priceId);
}

export function formatPrice(price: number, interval: string): string {
  if (price === 0) return 'Free';
  return `$${price}/${interval}`;
}

export function calculateSavings(monthlyPrice: number, yearlyPrice: number): number {
  const monthlyYearlyTotal = monthlyPrice * 12;
  const savings = monthlyYearlyTotal - yearlyPrice;
  return Math.round((savings / monthlyYearlyTotal) * 100);
}