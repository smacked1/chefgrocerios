# OpenAI TTS Quota & Access Troubleshooting Guide

## Current Issue
Your TTS API is returning 429 quota exceeded errors. The system has proper fallback to browser speech, but you want to resolve the OpenAI TTS quota issue.

## Steps to Check Your OpenAI Account

### 1. Verify Project & API Key Access
1. Go to https://platform.openai.com/api-keys
2. Find your API key that starts with `sk-`
3. Check which project it belongs to
4. Verify the key has permissions for `/v1/audio/speech` endpoint

### 2. Check Billing & Usage
1. Go to https://platform.openai.com/account/billing
2. Verify you have an active payment method
3. Check your current usage limits and quotas
4. Look for any billing alerts or suspended services

### 3. Check TTS-Specific Quota
1. Go to https://platform.openai.com/account/limits
2. Look for "Text-to-speech" or "Audio" limits
3. Check current usage vs. available quota
4. Note the reset date for monthly quotas

### 4. Project Settings
1. Go to https://platform.openai.com/account/organization
2. Check if you're in the correct organization/project
3. Verify TTS is enabled for your tier
4. Check if there are project-specific rate limits

## Possible Solutions

### Option 1: Upgrade Your Plan
- Free tier has very limited TTS quota
- Upgrade to paid tier for higher limits
- Consider usage-based billing for variable needs

### Option 2: Switch Projects/Organizations
- Create new project with fresh quota
- Move API key to project with available quota
- Update your environment variable with new key

### Option 3: Rate Limiting (Implemented)
Your app already has smart fallback:
- OpenAI TTS when quota available
- Browser speech synthesis as backup
- Graceful error handling with user feedback

## Current TTS Integration Status
✅ **Working Features:**
- TTS service with quota management
- Smart fallback to browser speech
- Error handling and user notifications
- Multiple voice options (alloy, echo, fable, nova, onyx, shimmer)
- Configurable speed (0.25x to 4.0x)

✅ **API Endpoints Ready:**
- `GET /api/tts/status` - Check availability
- `POST /api/tts/synthesize` - Generate speech

## Environment Variables
Your current setup uses:
```
OPENAI_TTS_KEY=sk-your-key-here
```

Make sure this key:
1. Has active billing
2. Has TTS permissions
3. Belongs to project with quota
4. Is not the same as your main GPT key (for quota separation)

## Testing Commands
```bash
# Check API key validity
curl -X GET "https://api.openai.com/v1/models" \
  -H "Authorization: Bearer $OPENAI_TTS_KEY"

# Test TTS directly
curl -X POST "https://api.openai.com/v1/audio/speech" \
  -H "Authorization: Bearer $OPENAI_TTS_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "tts-1", "input": "Test", "voice": "alloy"}' \
  --output test.mp3
```

## Next Steps
1. Check your OpenAI dashboard using the steps above
2. If you need a new API key or project, create one
3. Update the OPENAI_TTS_KEY environment variable
4. The app will automatically use the new quota

Your TTS system is properly implemented with fallbacks - it just needs an API key with available quota.