# 📘 Implementation Guides - ViralFlow

**Step-by-step guides for implementing key features**

---

## 🚀 Quick Implementation Guides

### 1. Setting Up Authentication

**File:** `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Steps:**
1. Get Supabase credentials from dashboard
2. Add to `.env.local`
3. Import `supabase` client in components
4. Use `supabase.auth` for authentication

**Example:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

---

### 2. Creating API Routes

**Location:** `app/api/[route-name]/route.ts`

**Template:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ data: 'success' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed' },
      { status: 500 }
    );
  }
}
```

**Best Practices:**
- Always use try/catch
- Validate input
- Return proper status codes
- Log errors
- Use TypeScript types

---

### 3. Adding New Components

**Location:** `components/[ComponentName].tsx`

**Template:**
```typescript
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ComponentName() {
  const [state, setState] = useState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Component content */}
    </div>
  );
}
```

**Best Practices:**
- Use 'use client' for client components
- Add TypeScript types
- Use Framer Motion for animations
- Follow glassmorphic design
- Make responsive

---

### 4. Database Operations

**Using Supabase Client:**

```typescript
// Insert
const { data, error } = await supabase
  .from('table_name')
  .insert([{ column: 'value' }])
  .select();

// Select
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', 'value');

// Update
const { data, error } = await supabase
  .from('table_name')
  .update({ column: 'new_value' })
  .eq('id', 'id_value');

// Delete
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', 'id_value');
```

---

### 5. Adding Notifications

**Create Notification:**
```typescript
await supabase.from('notifications').insert([{
  user_id: userId,
  type: 'post_reminder',
  title: 'Post scheduled',
  message: 'Your post is scheduled for 2:00 PM',
  priority: 'medium',
  is_read: false,
}]);
```

**Fetch Notifications:**
```typescript
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

---

### 6. Scheduling Posts

**Create Scheduled Post:**
```typescript
await supabase.from('scheduled_posts').insert([{
  user_id: userId,
  platform: 'instagram',
  content: 'Post content',
  hashtags: ['#fitness', '#workout'],
  scheduled_time: new Date('2024-01-15T14:00:00Z'),
  status: 'scheduled',
}]);
```

**Process Scheduled Posts:**
- Set up cron job to call `/api/scheduled-posts/process`
- Runs every minute
- Processes posts that are due

---

### 7. Analytics Implementation

**Fetch Analytics:**
```typescript
const response = await fetch('/api/analytics?range=30d');
const data = await response.json();
```

**Calculate Metrics:**
- Total views: Sum of all post views
- Engagement rate: (Likes + Comments + Shares) / Views * 100
- Growth rate: Compare current period to previous

---

### 8. Team Workspace Setup

**Create Team:**
```typescript
await supabase.from('creator_teams').insert([{
  name: 'Team Name',
  owner_id: userId,
  is_public: false,
}]);
```

**Add Member:**
```typescript
await supabase.from('team_members').insert([{
  team_id: teamId,
  user_id: memberId,
  role: 'member',
}]);
```

---

### 9. Error Handling

**API Routes:**
```typescript
try {
  // Operation
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'User-friendly message' },
    { status: 500 }
  );
}
```

**Components:**
```typescript
try {
  // Operation
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly error message
  setError('Something went wrong. Please try again.');
}
```

---

### 10. Testing

**Unit Tests:**
```typescript
import { describe, it, expect } from '@jest/globals';

describe('FunctionName', () => {
  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

**API Tests:**
```typescript
const response = await fetch('/api/endpoint');
expect(response.status).toBe(200);
const data = await response.json();
expect(data).toHaveProperty('success');
```

---

## 🎨 UI Component Patterns

### Glassmorphic Card
```typescript
<div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
  {/* Content */}
</div>
```

### Gradient Button
```typescript
<button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-bold hover:scale-105 transition-all">
  Button Text
</button>
```

### Animated Container
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="..."
>
  {/* Content */}
</motion.div>
```

---

## 🔧 Configuration

### Environment Variables
See `.env.example` for all required variables

### Database Setup
Run `supabase-schema.sql` in Supabase SQL Editor

### Deployment
See `PRODUCTION_READINESS_CHECKLIST.md`

---

## 📚 Additional Resources

- `CODEBASE_DOCUMENTATION.md` - Complete technical docs
- `SENIOR_ENGINEER_NOTES.md` - Architecture decisions
- `README.md` - Project overview

---

**Last Updated:** 2024

