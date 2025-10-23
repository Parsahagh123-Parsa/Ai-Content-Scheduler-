# 🚀 Day 1 Walkthrough: Setup & Hello World

Welcome to Day 1 of your 21-day React + Node journey! Let's get everything running and make your first changes.

## 📋 Today's Goals
- [ ] Run the React app
- [ ] Explore the code structure
- [ ] Make your first edit (change text to "Hello Parsa")
- [ ] Understand the basic project structure

---

## 🛠️ Step 1: Start the React App

Open your terminal and run these commands:

```bash
# Navigate to the client directory
cd "/Users/parsahaghnazari/Desktop/AI MVP/ai-creator-scheduler/public/React + Node/client"

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## 🌐 Step 2: Open Your App

1. Open your browser
2. Go to [http://localhost:5173](http://localhost:5173)
3. You should see a beautiful welcome screen with:
   - "Hello Parsa! 👋" heading
   - A counter that starts at 0
   - A blue "Click me! (+1)" button
   - Welcome message

## 🔍 Step 3: Explore the Code Structure

Let's look at the key files:

### `client/src/App.tsx` - Main Component
```tsx
import { useState } from 'react'
import Button from './components/Button'
import './App.css'

function App() {
  const [count, setCount] = useState(0)  // ← State hook

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Hello Parsa! 👋  {/* ← This is what you'll change */}
        </h1>
        {/* ... rest of component */}
      </div>
    </div>
  )
}
```

### `client/src/components/Button.tsx` - Reusable Component
```tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary' }) => {
  // Component implementation
};
```

## ✏️ Step 4: Make Your First Edit

**Task:** Change "Hello Parsa!" to "Hello [Your Name]!"

1. Open `client/src/App.tsx` in Cursor
2. Find line 12: `Hello Parsa! 👋`
3. Change it to: `Hello [Your Name]! 👋`
4. Save the file (Cmd+S)
5. Watch your browser automatically update! 🔄

**What's happening?**
- Vite's hot module replacement (HMR) detects the change
- The browser automatically refreshes with your new text
- No page reload needed!

## 🎯 Step 5: Test the Counter

1. Click the "Click me! (+1)" button several times
2. Watch the counter increase
3. Notice how the UI updates instantly

**Understanding the Code:**
```tsx
const [count, setCount] = useState(0)  // State: current value + setter function

<Button onClick={() => setCount(count + 1)}>  // When clicked, increment count
  Click me! (+1)
</Button>

<p className="text-blue-800 font-medium">Counter: {count}</p>  // Display current count
```

## 🏗️ Project Structure Overview

```
React + Node/
├── README.md                    # Your 21-day roadmap
├── DAY-1-WALKTHROUGH.md         # This file
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Button.tsx       # Reusable button component
│   │   ├── App.tsx              # Main app component
│   │   ├── main.tsx             # App entry point
│   │   └── index.css            # Global styles (Tailwind)
│   ├── package.json             # Frontend dependencies
│   └── vite.config.ts           # Vite configuration
└── server/                      # Node.js backend
    ├── src/
    │   ├── routes/
    │   │   └── notes.ts         # API routes
    │   ├── types/
    │   │   └── Note.ts          # TypeScript interfaces
    │   └── server.ts            # Express server
    └── package.json             # Backend dependencies
```

## 🎉 Congratulations!

You've successfully:
- ✅ Set up a React TypeScript project
- ✅ Started the development server
- ✅ Made your first code change
- ✅ Understood basic React concepts (components, state, props)
- ✅ Seen hot module replacement in action

## 🚀 Next Steps

Tomorrow (Day 2), you'll learn about:
- Creating new components
- Component composition
- File organization

**Ready for Day 2?** Check the main README.md for tomorrow's tasks!

---

## 💡 Pro Tips

1. **Keep the dev server running** - It will automatically reload when you make changes
2. **Use Cursor's IntelliSense** - It will help you with autocomplete and error detection
3. **Check the browser console** - If something breaks, errors will appear there
4. **Experiment!** - Try changing colors, text, or adding new elements

Happy coding! 🎯
