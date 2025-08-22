# AI-Powered Smart Cooking Assistant

## Overview
This full-stack React application is an AI-powered cooking assistant designed to offer an intuitive, hands-free cooking experience. It leverages AI for personalized assistance, streamlines recipe management, meal planning, grocery lists, and pantry inventory, and integrates comprehensive payment processing for premium features. The platform now features complete AWS voice integration with professional-grade synthesis and transcription capabilities, subscription-based feature gating, and enterprise-level audio processing. The vision is to simplify home cooking and grocery shopping, saving users time and money, with ambitions for significant market potential and revenue generation through a robust business model.

## User Preferences
- Preferred communication style: Simple, everyday language
- Owner: Myles Barber (dxmylesx22@gmail.com)
- Business: ChefGrocer, 1619 Mound Street, Davenport, IA 52803

## System Architecture

The application follows a monorepo structure separating client and server code.

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with warm orange color scheme and CSS variables
- **Build Tool**: Vite
- **Navigation**: Tabbed navigation system to reduce scrolling and improve UX

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM (Neon Database for serverless) with RevenueCat integration fields
- **Authentication**: Replit Auth with OpenID Connect, session management with PostgreSQL storage
- **API Design**: RESTful APIs with JSON responses, protected routes with authentication middleware
- **AI Integration**: Google Gemini AI for voice processing and meal planning
- **Google APIs**: Google API key integrated for enhanced store location and mapping
- **Payment Processing**: Unified subscription system with Stripe (web) and Apple in-app purchases (iOS) via RevenueCat
- **Cross-Platform Subscriptions**: RevenueCat webhook integration ensures Apple purchases unlock web premium and vice versa

### Voice Integration
- **AWS Voice Services**: Complete integration with AWS Polly (TTS) and AWS Transcribe (STT) for enterprise-grade voice processing
- **Professional Voice Synthesis**: 8+ AWS Polly voices with studio-quality 22kHz MP3 output
- **Premium Voice Panel**: Subscription-gated professional voice features with usage tracking and AI command processing
- **Voice Usage Monitoring**: Real-time tracking with tier-based limits (Free: 60min, Premium: 200min, Pro: 500min)
- **Enhanced Speech Recognition**: OpenAI Whisper API for enterprise-grade audio transcription with multi-language support
- **Legacy Speech Recognition**: Web Speech API with real-time transcription as fallback
- **Speech Synthesis**: AWS Polly primary with OpenAI TTS and Web Speech Synthesis API fallbacks
- **Voice Processing**: Google Gemini AI + OpenAI GPT-4o for natural language understanding, ingredient analysis, and cooking command processing
- **Voice-Activated Search**: Hands-free ingredient search with detailed nutrition, allergen warnings, and price estimates
- **Smart Fallback System**: Tiered fallback system: AWS Polly → OpenAI TTS → Browser Speech based on subscription and quota availability
- **AI Command Processing**: Intelligent voice command understanding with contextual cooking assistance responses

### Store Location Integration
- **OpenStreetMap Integration**: Real-time nearby store discovery using Nominatim geocoding API
- **Overpass API**: Authentic grocery store, supermarket, and convenience store data with exact locations, addresses, and details
- **Distance Calculations**: Haversine formula for accurate distance measurements in kilometers
- **Store Filtering**: Dynamic search and filtering by store name or brand

### Key Features
- **Voice Commands**: Natural language processing for hands-free interaction with professional OpenAI TTS voice responses.
- **Recipe Management**: Create, search, and manage recipes with nutrition analysis through tabbed interface.
- **Meal Planning**: AI-assisted generation based on preferences.
- **Smart Shopping**: Enhanced grocery lists with real-time price comparison, savings, and authentic nearby store locations via OpenStreetMap and Google APIs.
- **Comprehensive Food Database**: Open Food Facts integration with 3.9M+ global products including nutrition grades, NOVA scores, and allergen information.
- **Premium Nutrition Analysis**: Enterprise-grade nutrition tracking with API Ninjas smart parsing, USDA official database, and Open Food Facts integration.
- **Payment Processing**: Secure Stripe integration for one-time purchases and monthly/yearly subscriptions, including a Lifetime Pass option.
- **Subscription Management**: Multiple tiers (Free, Premium, Pro, Lifetime) with feature differentiation.
- **Privacy Compliance System**: Complete privacy policy implementation with GDPR/CCPA compliance, user data control, and cookie consent management.
- **Business Scaling Features**: Restaurant partnership portal, affiliate revenue tracking, premium content marketplace, and usage analytics dashboard.
- **Enhanced Navigation**: 10-tab organized interface including Food Database for comprehensive product search and analysis.
- **Warm Orange Theme**: Professional warm orange color scheme with enhanced visual appeal and clickable elements.

## External Dependencies

### Core
- **@neondatabase/serverless**: Serverless PostgreSQL database connection.
- **drizzle-orm**: Type-safe database ORM.
- **@tanstack/react-query**: Server state management.
- **@google/genai**: Google Gemini AI integration for various AI functionalities.
- **OpenAI Whisper API**: Enterprise-grade speech-to-text transcription with multi-language support and cooking terminology recognition.
- **OpenAI GPT-4o**: Advanced natural language processing for voice command understanding and cooking assistance.
- **API Ninjas**: Smart ingredient parsing with natural language nutrition analysis (100K+ requests/month free).
- **USDA FoodData Central API**: Official US government nutrition database with 1.9M+ verified foods (3,600 requests/hour free).
- **Spoonacular API**: Premium recipe and nutrition API.
- **TheMealDB API**: Free recipe database.

### UI
- **@radix-ui/***: Accessible UI component primitives.
- **tailwindcss**: Utility-first CSS framework.
- **lucide-react**: Icon library.

### Voice
- **Web Speech API**: Browser-native speech recognition.
- **Web Speech Synthesis API**: Browser-native text-to-speech.

### Mobile Deployment
- **@capacitor/core**: Native mobile app wrapper for iOS and Android.
- **@capacitor/ios**: iOS platform integration for App Store deployment.
- **@capacitor/assets**: Automated app icon and splash screen generation.