# 🚀 AI Content Scheduler

A comprehensive AI-powered content creation platform that helps creators generate viral content plans, optimize posts, and grow their social media presence.

## ✨ Features

### 🤖 AI-Powered Content Generation
- **Enhanced Content Form**: Generate 7-day content plans with AI-powered captions, hashtags, and trending topics
- **Smart Post Optimizer**: Analyze and optimize content for maximum viral potential with detailed scoring
- **AI Coaching Chat**: Get personalized advice and strategy recommendations from your AI content coach
- **Voice Commands**: Use Web Speech API to control the app with voice commands

### 🎨 Modern UI/UX
- **Liquid Glass Interface**: Vision-OS inspired glassmorphic design with backdrop blur effects
- **3D Dashboard**: Interactive 3D dashboard built with React Three Fiber
- **Neural Pulse Animations**: Beautiful animations that respond to AI generation
- **Dynamic Ambient Lighting**: Color-shifting backgrounds based on content type
- **Responsive Design**: Optimized for all screen sizes

### 💰 Monetization & Subscriptions
- **Stripe Integration**: Complete subscription system with Free, Pro, and Elite tiers
- **Pricing Page**: Beautiful pricing interface with feature comparisons
- **Creator XP System**: Gamified experience with levels, badges, and achievements
- **Usage Tracking**: Monitor AI calls and feature usage per subscription tier

### 📈 Analytics & Trends
- **Real-Time Trends**: Live trending topics and hashtags from multiple platforms
- **Viral Potential Analysis**: AI-powered scoring and recommendations
- **Performance Tracking**: Monitor content performance and engagement
- **Trend Analysis**: Deep insights into what's trending in your niche

### 🎥 Video & Media
- **Video Script Generation**: AI-generated scripts for TikTok, YouTube Shorts, and more
- **Thumbnail Optimization**: AI-powered thumbnail suggestions for better CTR
- **B-roll Recommendations**: Smart suggestions for video content
- **Platform Optimization**: Content tailored for each social media platform

### 🤝 Community & Collaboration
- **Creator Marketplace**: Share and sell content templates
- **Revenue Sharing**: Split earnings from collaborative content
- **Community Challenges**: Engage with other creators through challenges
- **Leaderboards**: Compete with other creators globally

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **3D Graphics**: React Three Fiber, Three.js
- **AI**: OpenAI GPT-4, Custom AI models
- **Backend**: Next.js API Routes, Supabase
- **Payments**: Stripe
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel (recommended)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-content-scheduler.git
   cd ai-content-scheduler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key_here

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   Run the SQL schema from `supabase-schema.sql` in your Supabase dashboard

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage

### Content Generation
1. Navigate to the **Content Generator** tab
2. Fill in your creator type, niche, and target audience
3. Select platforms and set your goals
4. Click "Generate Content Plan" to create your AI-powered content strategy

### Post Optimization
1. Go to the **Post Optimizer** tab
2. Paste your content in the text area
3. Click "Analyze for Virality" to get detailed insights
4. Review the suggestions and improved version

### AI Coaching
1. Switch to the **AI Coach** tab
2. Ask questions about content strategy, trends, or optimization
3. Get personalized advice based on your content and goals

### 3D Dashboard
1. Visit the **3D Dashboard** tab
2. Navigate the 3D space with your mouse
3. Interact with floating content cards
4. Experience the neural pulse animation during AI generation

## 🎯 Key Features Explained

### Smart Post Optimizer
The Smart Post Optimizer analyzes your content across multiple factors:
- **Hook Quality**: How engaging your opening is
- **Hashtag Strategy**: Relevance and trending potential
- **Length Optimization**: Platform-specific length recommendations
- **Emotional Engagement**: Questions, exclamations, and emotional triggers
- **Trending Elements**: Use of current viral hashtags and topics

### Creator XP System
Earn experience points and level up by:
- Creating content plans (+25 XP)
- Generating viral posts (+50 XP)
- Maintaining daily streaks (+5 XP per day)
- Using trending hashtags (+2 XP each)
- Completing achievements (+25-200 XP)

### Voice Commands
Control the app with voice commands:
- "Generate content" - Start content generation
- "Save content" - Save current plan
- "Show trends" - Display trending topics
- "Clear form" - Reset the form

## 🔧 API Endpoints

### Content Generation
- `POST /api/generate-content` - Generate AI content plans
- `POST /api/save-plan` - Save content plans to database
- `GET /api/user-plans` - Retrieve user's content plans
- `DELETE /api/delete-plan` - Delete a content plan

### Optimization
- `POST /api/analyze-viral-potential` - Analyze content for viral potential
- `POST /api/generate-video-script` - Generate video scripts

### Payments
- `POST /api/create-checkout-session` - Create Stripe checkout session
- `POST /api/webhook` - Handle Stripe webhooks

## 🎨 Customization

### Themes
The app supports dynamic theming based on:
- Creator type (fitness = green, tech = blue, fashion = pink)
- User preferences
- Time of day
- Subscription tier

### Components
All components are modular and customizable:
- `EnhancedContentForm` - Main content generation interface
- `SmartPostOptimizer` - Post analysis and optimization
- `AICoachingChat` - AI assistant interface
- `Dashboard3D` - 3D interactive dashboard
- `PricingPage` - Subscription pricing interface

## 📊 Database Schema

The app uses a comprehensive Supabase schema with tables for:
- Users and authentication
- Content plans and templates
- Trending topics and hashtags
- Analytics and performance data
- Subscriptions and payments
- Community features
- AI operations and automation

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Supabase for backend services
- Stripe for payment processing
- React Three Fiber for 3D graphics
- Framer Motion for animations
- Tailwind CSS for styling

## 📞 Support

For support, email support@aicontentscheduler.com or join our Discord community.

---

**Built with ❤️ for content creators worldwide**