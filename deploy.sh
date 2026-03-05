#!/bin/bash
# ============================================
# DEPLOY SCRIPT — Billiard Booking System
# ============================================
# Usage: bash deploy.sh
# ============================================

set -e

echo "🎱 Billiard Booking System — Deploy"
echo "======================================"
echo ""

# Check git status
if [ ! -d ".git" ]; then
  echo "❌ Git not initialized. Run: git init && git add -A && git commit -m 'init'"
  exit 1
fi

echo "✅ Git repo found"

# Check if build works
echo "📦 Building project..."
rm -rf .next
npx next build

if [ ! -d ".next" ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ Build successful"
echo ""

# Check for Vercel CLI
if command -v vercel &> /dev/null; then
  echo "🚀 Deploying to Vercel..."
  vercel --prod
  echo ""
  echo "✅ Deployed! Check the URL above."
else
  echo "============================================"
  echo "  Choose a deployment method:"
  echo "============================================"
  echo ""
  echo "📌 OPTION 1: Vercel (Recommended, Free)"
  echo "  1. npm i -g vercel"
  echo "  2. vercel login"
  echo "  3. vercel --prod"
  echo ""
  echo "📌 OPTION 2: Vercel via GitHub"
  echo "  1. Push to GitHub:"
  echo "     git remote add origin https://github.com/YOUR_USER/billiard-booking.git"
  echo "     git push -u origin master"
  echo "  2. Go to https://vercel.com/new"
  echo "  3. Import your GitHub repo"
  echo "  4. Click Deploy"
  echo ""
  echo "📌 OPTION 3: Railway (Free tier)"
  echo "  1. Go to https://railway.app"
  echo "  2. New Project → Deploy from GitHub repo"
  echo "  3. Auto-detects Next.js"
  echo ""
  echo "📌 OPTION 4: Netlify"
  echo "  1. npm i -g netlify-cli"
  echo "  2. netlify login"
  echo "  3. netlify deploy --prod"
  echo ""
fi

