import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '../../../lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { priceId, interval } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession(
      priceId,
      undefined, // customerId
      `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
