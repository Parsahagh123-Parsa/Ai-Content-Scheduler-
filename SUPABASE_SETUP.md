# Supabase Setup Guide

Follow these steps to set up Supabase for your AI Content Scheduler:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `ai-content-scheduler`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
6. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Click on "Settings" in the sidebar
3. Click on "API" in the settings menu
4. Copy the following values:
   - Project URL
   - Project API keys > anon/public key

## 3. Update Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Click "New Query"
4. Copy and paste the contents of `supabase-schema.sql`
5. Click "Run" to execute the SQL

This will create:
- `users` table for user management
- `content_plans` table for storing generated content plans
- Row Level Security (RLS) policies
- Indexes for better performance

## 5. Enable Authentication (Optional)

If you want to add user authentication:

1. Go to "Authentication" in your Supabase dashboard
2. Click "Settings"
3. Configure your preferred auth providers (Email, Google, etc.)
4. Update the RLS policies if needed

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Create a content plan
3. Click "Save Plan"
4. Check the "My Plans" tab to see your saved plans
5. Verify in Supabase dashboard that data is being stored

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**: Check that your environment variables are correct
2. **"Table doesn't exist" error**: Make sure you ran the SQL schema setup
3. **RLS policy errors**: Ensure your user is authenticated or using the demo user ID

### Demo Mode:

The app currently uses a demo user ID (`demo-user-123`). In production, you'll want to:
1. Implement proper authentication
2. Get the real user ID from the auth context
3. Update the RLS policies accordingly

## Next Steps

Once Supabase is set up, you can:
- Add user authentication
- Implement real user management
- Add more advanced features like sharing plans
- Set up real-time updates
- Add analytics and insights
