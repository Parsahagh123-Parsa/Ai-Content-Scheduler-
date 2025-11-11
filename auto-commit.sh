#!/bin/bash
# Auto-commit script for ViralFlow
# Usage: ./auto-commit.sh "commit message"

COMMIT_MSG="${1:-Auto-commit: Update files}"

echo "🔄 Staging all changes..."
git add .

echo "📝 Committing changes..."
git commit -m "$COMMIT_MSG"

echo "🚀 Pushing to remote..."
git push origin main

echo "✅ Done! Changes committed and pushed."

