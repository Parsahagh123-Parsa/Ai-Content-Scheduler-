import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SponsorshipProposals } from '../../../lib/sponsorship-proposals';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const sponsorshipProposals = new SponsorshipProposals(supabase);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'generate':
        const proposal = await sponsorshipProposals.generateAIProposal(
          params.creatorId,
          params.brandId,
          params.requirements
        );
        return NextResponse.json({ proposal });

      case 'submit':
        await sponsorshipProposals.submitProposal(params.proposalId);
        return NextResponse.json({ success: true });

      case 'update_status':
        await sponsorshipProposals.updateProposalStatus(
          params.proposalId,
          params.status,
          params.notes
        );
        return NextResponse.json({ success: true });

      case 'create_template':
        const templateId = await sponsorshipProposals.createProposalTemplate(params.template);
        return NextResponse.json({ templateId });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in sponsorship proposals API:', error);
    return NextResponse.json(
      { error: 'Failed to process sponsorship proposal request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const proposalId = searchParams.get('proposalId');
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType') as 'creator' | 'brand';
    const category = searchParams.get('category');

    switch (action) {
      case 'get_proposal':
        if (!proposalId) {
          return NextResponse.json({ error: 'Proposal ID required' }, { status: 400 });
        }
        const proposal = await sponsorshipProposals.getProposal(proposalId);
        return NextResponse.json({ proposal });

      case 'get_user_proposals':
        if (!userId || !userType) {
          return NextResponse.json({ error: 'User ID and type required' }, { status: 400 });
        }
        const proposals = await sponsorshipProposals.getUserProposals(userId, userType);
        return NextResponse.json({ proposals });

      case 'get_templates':
        const templates = await sponsorshipProposals.getProposalTemplates(category || undefined);
        return NextResponse.json({ templates });

      case 'get_analytics':
        if (!proposalId) {
          return NextResponse.json({ error: 'Proposal ID required' }, { status: 400 });
        }
        const analytics = await sponsorshipProposals.getProposalAnalytics(proposalId);
        return NextResponse.json({ analytics });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in sponsorship proposals API:', error);
    return NextResponse.json(
      { error: 'Failed to process sponsorship proposal request' },
      { status: 500 }
    );
  }
}
