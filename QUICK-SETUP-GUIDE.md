# ChefGrocer Quick Setup Guide

## Deployment Options

### Option 1: Replit Deploy (Recommended)
1. Click the **Deploy** button in Replit
2. Your app will be live instantly at `your-app.replit.app`
3. All environment variables are already configured

### Option 2: Download & Deploy Elsewhere
1. Download `ChefGrocer-Voice-Enhanced-Production-v4.tar.gz`
2. Extract: `tar -xzf ChefGrocer-Voice-Enhanced-Production-v4.tar.gz`
3. Install dependencies: `npm install`
4. Set environment variables (see below)
5. Deploy to your platform

## Required Environment Variables
```bash
# Required for all deployments
GEMINI_API_KEY=your_gemini_api_key
SPOONACULAR_API_KEY=your_spoonacular_key

# Required for payments
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public

# Database (auto-configured on Replit)
DATABASE_URL=your_postgresql_url
```

## Voice Commands Users Can Try
- "How to make chicken parmesan"
- "Walk me through pasta carbonara"
- "Cook me some pancakes"
- "Guide me through making pizza"
- "Step by step beef stir fry"

## Revenue Features Ready
- Premium subscriptions ($4.99/month)
- Pro subscriptions ($9.99/month)
- Lifetime pass ($99.99)
- Promotional codes: LAUNCH50, EARLYBIRD, ANNUAL25

## Mobile App (iOS)
1. Run: `npm run build && npx cap sync ios`
2. Open in Xcode: `npx cap open ios`
3. Archive and submit to App Store

Your ChefGrocer app is production-ready with advanced voice cooking instructions!