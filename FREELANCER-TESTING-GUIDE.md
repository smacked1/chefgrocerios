# ChefGrocer - Complete Testing Guide for Freelancer

## Project Overview
ChefGrocer is an AI-powered cooking assistant with voice commands, meal planning, and payment processing. Built with React, Express.js, PostgreSQL, and Google Gemini AI integration.

## Quick Start Instructions

### 1. Environment Setup
```bash
# Clone/download the project files
npm install

# Required Environment Variables (create .env file):
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
GEMINI_API_KEY=...
DATABASE_URL=postgresql://...
SESSION_SECRET=...
```

### 2. Start Development Server
```bash
npm run dev
# App runs on http://localhost:5000
```

### 3. Test Database (if needed)
```bash
npm run db:push
```

## Key Features to Test

### Core Functionality ✅
- [ ] App loads at http://localhost:5000
- [ ] Authentication system (login/logout)
- [ ] Voice commands work ("Find me pasta recipes")
- [ ] Recipe search and display
- [ ] Meal planning interface
- [ ] Grocery list generation
- [ ] Pantry inventory management

### AI Integration ✅
- [ ] Voice recognition responds to commands
- [ ] Gemini AI provides recipe suggestions
- [ ] Nutrition analysis displays correctly
- [ ] Meal planning generates realistic plans

### Payment Processing ✅
- [ ] Subscription plans display at /subscribe
- [ ] Promotional codes work (LAUNCH50, APPSTORE25)
- [ ] Stripe checkout process functional
- [ ] Revenue dashboard at /revenue-optimization

### Voice Commands to Test
- "Find me chicken recipes"
- "Plan meals for this week"
- "Add tomatoes to grocery list"
- "What's the nutrition in pasta?"
- "Show me 30-minute dinner ideas"

## File Structure Overview

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities
├── server/                # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database operations
│   ├── replitAuth.ts      # Authentication
│   └── index.ts           # Server entry
├── shared/
│   └── schema.ts          # Database schema
├── package.json           # Dependencies
└── vite.config.ts         # Build configuration
```

## Testing Checklist

### Basic Functionality
- [ ] Home page loads with promotional banner
- [ ] User can register/login
- [ ] Voice button activates microphone
- [ ] Recipe search returns results
- [ ] Meal plans generate properly
- [ ] Grocery lists save items

### Advanced Features
- [ ] Voice commands process correctly
- [ ] AI responses are relevant
- [ ] Payment flow works end-to-end
- [ ] Revenue tracking displays data
- [ ] PWA features function (install prompt)

### Error Handling
- [ ] Network errors display gracefully
- [ ] Invalid voice commands handled
- [ ] Payment failures show error messages
- [ ] Loading states display correctly

## Common Issues & Solutions

### Voice Not Working
- Check microphone permissions in browser
- Ensure HTTPS or localhost for Web Speech API
- Verify Gemini API key is set

### Payment Issues
- Confirm Stripe keys are test keys (pk_test_, sk_test_)
- Check network tab for API errors
- Verify promotional codes in database

### Database Connection
- Ensure DATABASE_URL is properly formatted
- Run `npm run db:push` to sync schema
- Check PostgreSQL service is running

## Expected Performance
- Page load: <3 seconds
- Voice response: <2 seconds
- API calls: <500ms average
- Payment processing: <5 seconds

## Revenue Features Active
- LAUNCH50: 50% off lifetime passes
- APPSTORE25: 25% off monthly plans  
- Limited time offers with countdown timers
- Conversion tracking dashboard

## Deployment Notes
- Production-ready code
- All dependencies included
- Environment variables documented
- Multi-platform deployment ready

## Contact Information
- Test all major user flows
- Document any bugs with screenshots
- Check responsive design on mobile
- Verify voice commands work across browsers

## Success Criteria
✅ App loads and runs without crashes
✅ Core cooking features functional
✅ Voice AI integration working
✅ Payment processing operational
✅ Revenue optimization active
✅ Mobile-responsive design

The app is designed to generate $2,500-10,000+ monthly revenue through subscriptions, affiliate partnerships, and premium content while providing an intuitive AI cooking experience.