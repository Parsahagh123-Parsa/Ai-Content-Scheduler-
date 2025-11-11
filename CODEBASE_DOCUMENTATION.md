# 📚 ViralFlow - Comprehensive Codebase Documentation

**Version:** 1.0.0  
**Last Updated:** 2024  
**Project Status:** Production Ready

---

## 🎯 Project Overview

**ViralFlow** (formerly AI Content Scheduler) is a comprehensive, AI-powered content creation and influencer platform designed to help anyone become a successful content creator. The platform combines advanced AI technology with an intuitive interface to make content creation, scheduling, and posting effortless.

### Core Mission
> "Make it simple for anyone to become an influencer through AI-powered content creation, smart scheduling, and automated posting workflows."

### Key Differentiators
- **Simplified Workflow**: Post to all platforms in 3 easy steps
- **AI-Powered**: Advanced content generation and optimization
- **Smart Notifications**: Real-time alerts for optimal posting times
- **Multi-Platform**: Support for Instagram, TikTok, YouTube Shorts, Twitter/X
- **Enterprise Ready**: Built for both individual creators and agencies

---

## 🏗️ Architecture Overview

### Tech Stack

#### Frontend
- **Framework**: Next.js 16.0.0 (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion 12.23.24
- **3D Graphics**: React Three Fiber 9.4.0, Three.js 0.180.0
- **UI Components**: Custom glassmorphic design system

#### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe 19.1.0

#### AI & Services
- **AI Provider**: OpenAI GPT-4o-mini
- **Content Generation**: Custom AI models
- **Trending Data**: Real-time API integrations

### Project Structure

```
viralflow/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── notifications/       # Notification system endpoints
│   │   ├── post-content/        # Posting workflow endpoints
│   │   ├── generate-content/    # Content generation
│   │   ├── analyze-viral-potential/ # Content optimization
│   │   └── ...                  # Other API endpoints
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main dashboard page
│
├── components/                   # React Components
│   ├── NotificationSystem.tsx   # Real-time notification system
│   ├── SimplePostingWorkflow.tsx # Simplified posting interface
│   ├── EnhancedContentForm.tsx  # Advanced content generation
│   ├── SmartPostOptimizer.tsx   # Content optimization
│   ├── AICoachingChat.tsx       # AI coaching interface
│   ├── 3DDashboard.tsx         # 3D visualization
│   ├── PricingPage.tsx         # Subscription management
│   ├── ComprehensiveContentCreator.tsx # All-in-one creator
│   ├── SponsorshipProposals.tsx # Brand collaboration tools
│   ├── CreatorFeed.tsx         # Community feed
│   ├── AISupportChatbot.tsx    # Support system
│   └── CreatorMarketplace.tsx  # Template marketplace
│
├── lib/                          # Core Libraries & Utilities
│   ├── openai.ts                # OpenAI integration
│   ├── supabase.ts              # Supabase client & helpers
│   ├── stripe.ts                # Stripe payment integration
│   ├── content-generator.ts     # Content generation logic
│   ├── enhanced-content-generator.ts # Advanced generation
│   ├── auto-schedule-pro.ts     # Smart scheduling
│   ├── autonomous-ai.ts        # Autonomous agents
│   ├── background-jobs.ts      # Background task processing
│   ├── trends.ts                # Trending topics
│   ├── viral-hook-generator.ts  # Hook generation
│   └── utils.ts                # Utility functions
│
├── supabase-schema.sql          # Database schema
├── package.json                # Dependencies
├── next.config.ts             # Next.js configuration
└── README.md                   # Project documentation
```

---

## 🔑 Core Features

### 1. Simple Posting Workflow ⭐ (Main Feature)

**Location**: `components/SimplePostingWorkflow.tsx`

The flagship feature that makes posting effortless for anyone.

**Workflow Steps:**
1. **Content Creation**: Write or paste your content
2. **Platform Selection**: Choose one or multiple platforms
3. **Smart Scheduling**: AI suggests optimal posting times
4. **Preview & Post**: Review and publish

**Key Features:**
- One-click multi-platform posting
- AI-powered content optimization
- Smart scheduling with optimal time suggestions
- Viral score prediction
- Auto-hashtag suggestions
- Visual preview before posting

**API Endpoints:**
- `POST /api/post-content` - Schedule or post content
- `GET /api/optimal-posting-time` - Get best posting times

**Database Tables:**
- `scheduled_posts` - Stores scheduled and posted content

### 2. Notification System 🔔

**Location**: `components/NotificationSystem.tsx`

Real-time notification system for posting reminders and alerts.

**Notification Types:**
- `post_reminder` - Reminders for scheduled posts
- `trending_alert` - Trending topic notifications
- `engagement_boost` - Engagement milestone alerts
- `schedule_ready` - Schedule completion notifications
- `achievement` - User achievement unlocks
- `system` - System updates and announcements

**Features:**
- Browser push notifications
- Sound alerts for urgent notifications
- Priority-based grouping (urgent, high, medium, low)
- Mark as read/unread
- Notification history
- Real-time updates via Supabase

**API Endpoints:**
- `GET /api/notifications` - Fetch notifications
- `POST /api/notifications` - Create notification
- `POST /api/notifications/[id]/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/[id]` - Delete notification

**Database Tables:**
- `notifications` - Stores all notifications

### 3. Content Generation 🚀

**Location**: `components/EnhancedContentForm.tsx`, `lib/content-generator.ts`

AI-powered content generation for 7-day content plans.

**Features:**
- Platform-specific content optimization
- Trending topic integration
- Hashtag suggestions
- Caption generation
- Video script creation
- Thumbnail concepts

**API Endpoints:**
- `POST /api/generate-content` - Generate content plan
- `POST /api/generate-video-script` - Generate video scripts
- `GET /api/user-plans` - Fetch user's content plans
- `POST /api/save-plan` - Save content plan
- `DELETE /api/delete-plan` - Delete content plan

### 4. Post Optimization 🎯

**Location**: `components/SmartPostOptimizer.tsx`

AI-powered content analysis and optimization.

**Analysis Factors:**
- Hook quality score
- Hashtag strategy
- Length optimization
- Emotional engagement
- Trending elements
- Viral potential score

**API Endpoints:**
- `POST /api/analyze-viral-potential` - Analyze content

### 5. AI Coaching 🤖

**Location**: `components/AICoachingChat.tsx`

Personalized AI coaching for content strategy.

**Features:**
- Strategy recommendations
- Trend analysis
- Content optimization tips
- Platform-specific advice
- Performance insights

### 6. 3D Dashboard 🌌

**Location**: `components/3DDashboard.tsx`

Interactive 3D visualization of content plans.

**Features:**
- 3D content card visualization
- Interactive navigation
- Neural pulse animations
- Content plan overview

### 7. Marketplace 🛒

**Location**: `components/CreatorMarketplace.tsx`

Template marketplace for buying and selling content.

**Features:**
- Template browsing
- Search and filters
- Purchase flow
- Creator statistics
- Revenue sharing

### 8. Sponsorship Proposals 🤝

**Location**: `components/SponsorshipProposals.tsx`

AI-powered sponsorship proposal generation.

**Features:**
- Proposal templates
- Brand matching
- Budget negotiation
- Performance tracking

### 9. Community Feed 🌟

**Location**: `components/CreatorFeed.tsx`

Social feed for creator community.

**Features:**
- Content sharing
- Likes and comments
- Follow system
- Trending content

### 10. Pricing & Subscriptions 💎

**Location**: `components/PricingPage.tsx`

Subscription management and billing.

**Tiers:**
- **Free**: 3 content plans/month
- **Pro**: 100 content plans/month, advanced features
- **Elite**: Unlimited, all features, priority support

**API Endpoints:**
- `POST /api/create-checkout-session` - Create Stripe checkout
- `POST /api/delete-plan` - Cancel subscription

---

## 🗄️ Database Schema

### Core Tables

#### `users`
User accounts and subscription information.

**Columns:**
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `subscription_tier` (VARCHAR: 'free', 'pro', 'elite')
- `subscription_status` (VARCHAR)
- `stripe_customer_id` (VARCHAR)
- `stripe_subscription_id` (VARCHAR)
- `credits_used` (INTEGER)
- `credits_limit` (INTEGER)
- `referral_code` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

#### `content_plans`
Generated content plans.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users)
- `creator_type` (VARCHAR)
- `platform` (VARCHAR)
- `content_goal` (VARCHAR)
- `target_audience` (TEXT)
- `content_plan` (JSONB) - 7-day plan structure
- `trending_topics` (TEXT[])
- `tone` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

#### `scheduled_posts`
Scheduled and posted content.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users)
- `platform` (VARCHAR)
- `content` (TEXT)
- `hashtags` (TEXT[])
- `media` (TEXT[])
- `scheduled_time` (TIMESTAMP)
- `status` (VARCHAR: 'draft', 'scheduled', 'posted', 'failed')
- `viral_score` (INTEGER)
- `engagement_data` (JSONB)
- `posted_at` (TIMESTAMP)
- `created_at`, `updated_at` (TIMESTAMP)

#### `notifications`
User notifications.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users)
- `type` (VARCHAR)
- `title` (VARCHAR)
- `message` (TEXT)
- `priority` (VARCHAR: 'low', 'medium', 'high', 'urgent')
- `data` (JSONB)
- `is_read` (BOOLEAN)
- `created_at` (TIMESTAMP)

#### `user_profiles`
Extended user profile information.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users, Unique)
- `username` (VARCHAR, Unique)
- `display_name` (VARCHAR)
- `bio` (TEXT)
- `avatar_url` (TEXT)
- `followers_count` (INTEGER)
- `xp_points` (INTEGER)
- `level` (INTEGER)
- `streak_days` (INTEGER)
- `is_verified` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### Additional Tables

- `trending_topics` - Platform-specific trending data
- `analytics` - Usage analytics
- `subscriptions` - Stripe subscription records
- `billing_history` - Payment history
- `referral_tracking` - Referral program
- `promo_codes` - Discount codes
- `user_preferences` - User settings
- `creator_feed` - Community feed posts
- `feed_interactions` - Likes, comments, reposts
- `follows` - User follow relationships
- `direct_messages` - Private messaging
- `creator_teams` - Team collaboration
- `achievements` - User achievements
- `power_cards` - Boost cards
- `community_challenges` - Challenges
- `brand_collaborations` - Brand partnerships
- `sponsorship_proposals` - Proposal management
- `marketplace_templates` - Template marketplace
- And many more...

**Full schema**: See `supabase-schema.sql`

---

## 🔌 API Reference

### Authentication
All API routes (except public endpoints) require authentication. In production, use Supabase Auth.

**Current Implementation**: Uses `userId` from request body or query params (demo mode)

### Content Generation

#### `POST /api/generate-content`
Generate a 7-day content plan.

**Request Body:**
```json
{
  "creatorType": "fitness",
  "platform": "instagram",
  "contentGoal": "grow followers",
  "targetAudience": "fitness enthusiasts",
  "tone": "engaging",
  "keyword": "workout"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contentPlan": { /* 7-day plan structure */ },
    "trendingTopics": ["topic1", "topic2"],
    "analytics": { /* analytics data */ },
    "metadata": { /* generation metadata */ }
  }
}
```

### Posting

#### `POST /api/post-content`
Schedule or post content to platforms.

**Request Body:**
```json
{
  "posts": [
    {
      "id": "post-123",
      "platform": "instagram",
      "content": "Your post content",
      "hashtags": ["#fitness", "#workout"],
      "media": ["url1", "url2"],
      "scheduledTime": "2024-01-15T14:00:00Z",
      "status": "scheduled",
      "viralScore": 85
    }
  ],
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "posts": [ /* saved posts */ ],
  "message": "3 post(s) scheduled successfully"
}
```

#### `GET /api/optimal-posting-time`
Get optimal posting time for a platform.

**Query Parameters:**
- `platform` (required): 'instagram' | 'tiktok' | 'youtube' | 'twitter'
- `timezone` (optional): User timezone

**Response:**
```json
{
  "optimalTime": "2024-01-15T14:00:00Z",
  "platform": "instagram",
  "timezone": "America/New_York",
  "recommendedHours": [9, 11, 14, 17, 20],
  "reason": "Best engagement times for instagram are typically at 9, 11, 14, 17, 20 o'clock"
}
```

### Notifications

#### `GET /api/notifications`
Fetch user notifications.

**Query Parameters:**
- `userId` (required)

**Response:**
```json
{
  "notifications": [ /* notification array */ ],
  "unreadCount": 5
}
```

#### `POST /api/notifications`
Create a notification.

**Request Body:**
```json
{
  "userId": "user-123",
  "type": "post_reminder",
  "title": "Post scheduled",
  "message": "Your post is scheduled for 2:00 PM",
  "priority": "medium",
  "data": { "postId": "post-123" }
}
```

### Optimization

#### `POST /api/analyze-viral-potential`
Analyze content for viral potential.

**Request Body:**
```json
{
  "content": "Your post content",
  "hashtags": ["#fitness"],
  "platforms": ["instagram"]
}
```

**Response:**
```json
{
  "viralScore": 85,
  "optimizedContent": "Optimized version...",
  "suggestedHashtags": ["#fitness", "#workout"],
  "analysis": { /* detailed analysis */ }
}
```

---

## 🎨 UI/UX Design System

### Design Philosophy
- **Glassmorphic**: Modern glass-effect UI with backdrop blur
- **Gradient Backgrounds**: Dynamic color gradients based on context
- **Smooth Animations**: Framer Motion for fluid transitions
- **Responsive**: Mobile-first design approach
- **Accessible**: WCAG 2.1 AA compliance

### Color Palette
- **Primary**: Purple (#667eea) to Indigo (#764ba2)
- **Accent**: Pink (#ec4899) to Purple (#8b5cf6)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)

### Component Patterns
- **Cards**: Glassmorphic with backdrop blur
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with focus states
- **Notifications**: Priority-based styling
- **3D Elements**: React Three Fiber integration

---

## 🔐 Security & Best Practices

### Authentication
- Supabase Auth for user management
- Row Level Security (RLS) policies
- JWT token validation
- Session management

### Data Protection
- Environment variables for secrets
- API key encryption
- Secure database connections
- Input validation and sanitization

### API Security
- Rate limiting (to be implemented)
- CORS configuration
- Request validation
- Error handling without exposing internals

---

## 🚀 Deployment

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key
- Stripe account (for payments)

### Environment Variables

Create `.env.local`:

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Database**
   - Run `supabase-schema.sql` in Supabase SQL Editor
   - Configure RLS policies
   - Set up authentication

3. **Configure Environment**
   - Copy `.env.example` to `.env.local`
   - Fill in all required values

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

### Deployment Platforms
- **Vercel** (Recommended): Automatic deployments
- **Netlify**: Static site hosting
- **Railway**: Full-stack hosting
- **AWS**: Enterprise deployment

---

## 📊 Performance Optimization

### Frontend
- Code splitting with Next.js
- Image optimization
- Lazy loading components
- Memoization for expensive computations
- Virtual scrolling for long lists

### Backend
- Database query optimization
- Indexed database columns
- Caching strategies
- Background job processing
- API response compression

### Monitoring
- Error tracking (to be implemented)
- Performance metrics
- User analytics
- API usage monitoring

---

## 🧪 Testing

### Testing Strategy
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows
- Component tests for UI

### Test Files
- `__tests__/` - Test files
- `*.test.ts` - Unit tests
- `*.spec.ts` - Component tests

---

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Implement changes
3. Write tests
4. Update documentation
5. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

---

## 📝 Senior Lead Engineer Notes

> **See `SENIOR_ENGINEER_NOTES.md` for comprehensive engineering notes, architecture decisions, security considerations, and development guidelines.**

### Quick Summary

**Architecture Decisions:**
1. **Next.js App Router**: Modern React patterns and better performance
2. **Supabase**: Database, auth, and real-time capabilities in one platform
3. **TypeScript**: Type safety for large codebase
4. **Component-Based**: Modular architecture for maintainability
5. **API Routes**: Serverless functions for scalability

**Key Design Patterns:**
1. **Component Composition**: Reusable, composable components
2. **Custom Hooks**: Shared logic extraction
3. **Context API**: Global state management
4. **Server Actions**: Form handling (where applicable)
5. **Background Jobs**: Async task processing

**Scalability Considerations:**
1. **Database Indexing**: All foreign keys and frequently queried columns indexed
2. **Caching Strategy**: Implement Redis for frequently accessed data
3. **CDN**: Static assets served via CDN
4. **Load Balancing**: Horizontal scaling ready
5. **Background Processing**: Queue-based job system

**Production Readiness:**
- ✅ Core features implemented
- ✅ Database schema complete
- ✅ API routes functional
- ⚠️ Authentication needs implementation (currently demo mode)
- ⚠️ Testing coverage needed
- ⚠️ Monitoring & observability to be added

**Future Enhancements:**
1. **Real-time Collaboration**: WebSocket integration
2. **Mobile App**: React Native version
3. **Advanced Analytics**: Detailed performance metrics
4. **AI Model Fine-tuning**: Custom models for better results
5. **Multi-language Support**: i18n implementation
6. **Platform Integrations**: Direct API connections to social platforms
7. **Automated Posting**: Background jobs for scheduled posts (✅ Implemented)
8. **Advanced Scheduling**: Recurring posts, bulk scheduling

---

## 📞 Support & Resources

### Documentation
- This file: Comprehensive codebase documentation
- `README.md`: Quick start guide
- `SUPABASE_SETUP.md`: Database setup instructions

### Community
- GitHub Issues: Bug reports and feature requests
- Discord: Community support (to be created)
- Email: support@viralflow.com (to be configured)

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ by the ViralFlow Team**

*Last Updated: 2024*

