# 🚀 START HERE - ViralFlow Quick Start Guide

**Welcome to ViralFlow!** This guide will get you up and running in minutes.

---

## ⚡ Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration (Optional for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Set Up Database
1. Go to your Supabase project dashboard
2. Click on "SQL Editor"
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Open Your Browser
Navigate to `http://localhost:3000`

**🎉 You're ready to go!**

---

## 📚 Next Steps

1. **Read the Documentation**
   - `CODEBASE_DOCUMENTATION.md` - Complete technical documentation
   - `SENIOR_ENGINEER_NOTES.md` - Architecture and engineering notes
   - `README.md` - Project overview

2. **Explore Features**
   - Simple Post workflow (default tab)
   - Content Generator
   - Analytics Dashboard
   - Team Workspace
   - And more!

3. **Set Up Production**
   - See `PRODUCTION_READINESS_CHECKLIST.md`
   - Configure deployment (Vercel recommended)
   - Set up cron jobs for automated posting

---

## 🆘 Need Help?

- Check `CODEBASE_DOCUMENTATION.md` for detailed information
- Review `SENIOR_ENGINEER_NOTES.md` for architecture decisions
- Open an issue on GitHub for bugs or questions

---

**Happy Creating! 🚀**

