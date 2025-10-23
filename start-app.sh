#!/bin/bash

echo "🚀 Starting AI Content Scheduler..."
echo "📁 Current directory: $(pwd)"
echo "🔍 Checking Node.js installation..."

# Check if Node.js is installed
if command -v node &> /dev/null; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js first."
    echo "Download from: https://nodejs.org"
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    echo "✅ npm found: $(npm --version)"
else
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🌐 Starting development server..."
echo "The app will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
