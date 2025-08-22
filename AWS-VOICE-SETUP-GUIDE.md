# AWS Voice Services Setup Guide

## Overview
This guide helps you set up AWS Transcribe and Polly as backup voice services for your ChefGrocer app, providing reliable voice functionality even when OpenAI APIs have quotas or issues.

## AWS Account Setup

### 1. Create AWS Account
- Go to [AWS Console](https://aws.amazon.com/console/) and create a free tier account
- Use account region: **US East (Ohio) - us-east-2** (recommended for best performance)
- Free tier includes $100 in credits + 12 months of free services

### 2. Create IAM User
1. Go to AWS Console → IAM service
2. Click "Users" → "Create user"
3. Username: `chefgrocer-voice-service`
4. Access type: **Programmatic access**
5. Next: Permissions

### 3. Attach Policies
Attach these AWS managed policies to your user:
- `AmazonTranscribeFullAccess` - For speech-to-text conversion
- `AmazonPollyFullAccess` - For text-to-speech synthesis
- `AmazonS3FullAccess` - For temporary audio file storage

### 4. Generate Access Keys
1. Click "Create access key"
2. Use case: **Application running outside AWS**
3. Save both:
   - **Access Key ID** (starts with AKIA...)
   - **Secret Access Key** (long random string)

## S3 Bucket Setup

### 1. Create S3 Bucket
1. Go to AWS Console → S3 service
2. Click "Create bucket"
3. Bucket name: `chefgrocer-audio-2024` (or your preferred name)
4. Region: **US East (Ohio) us-east-2**
5. Keep default settings (Block all public access = ON)
6. Click "Create bucket"

### 2. Configure Bucket Policy (Optional)
For automatic cleanup of temporary files, you can set up a lifecycle rule:
1. Go to your bucket → Management tab
2. Create lifecycle rule to delete objects after 1 day

## Environment Variables Setup

Add these variables to your `.env` file:

```env
# AWS Voice Services Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-2
AWS_S3_BUCKET=chefgrocer-audio-2024

# Client-side AWS configuration (optional)
VITE_AWS_REGION=us-east-2
VITE_AWS_S3_BUCKET=chefgrocer-audio-2024
```

## Free Tier Limits

Your AWS Free Tier includes:

### Amazon Transcribe
- **60 minutes/month** of speech recognition
- Perfect for voice commands and recipe requests

### Amazon Polly
- **5 million characters/month** of text-to-speech
- Enough for thousands of recipe readings

### Amazon S3
- **5 GB storage** for temporary audio files
- **20,000 GET requests** and **2,000 PUT requests**

## Testing the Integration

1. **Health Check**: Visit `/api/aws/health` to verify configuration
2. **Voice Test**: Try the enhanced voice recipe reader
3. **Backup Verification**: Test when OpenAI TTS quota is reached

## Voice Features Enabled

### AWS Transcribe (Speech-to-Text)
- High-quality voice command recognition
- Works as backup when OpenAI Whisper quota exceeded
- Supports cooking terminology and ingredient names

### AWS Polly (Text-to-Speech)
- Natural-sounding voice for recipe reading
- Joanna voice (American English) optimized for cooking instructions
- Automatic text chunking for long recipes
- No character limits like browser TTS

## Usage in ChefGrocer

### Voice Recipe Reading
```typescript
// Automatically uses AWS Polly when available
const awsVoice = new AWSVoiceService();
await awsVoice.readRecipeAloud(recipe);
```

### Voice Commands
```typescript
// Falls back to AWS Transcribe when OpenAI quota exceeded
const transcript = await awsVoice.transcribeAudio(audioBlob);
```

## Cost Management

- **Free Tier**: Covers typical usage for months
- **$100 Credit**: Additional buffer for high usage
- **Auto-scaling**: Services scale down when not in use
- **Monitoring**: AWS billing alerts available

## Troubleshooting

### Common Issues:
1. **Invalid credentials**: Double-check Access Key ID and Secret
2. **Bucket access denied**: Verify S3 permissions and bucket name
3. **Region mismatch**: Ensure all services use us-east-2
4. **Rate limiting**: AWS has much higher limits than OpenAI

### Error Messages:
- `AWS credentials not configured` → Check environment variables
- `Bucket not found` → Verify bucket name and region
- `Access denied` → Check IAM permissions

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Enable CloudTrail** for audit logging (optional)
4. **Regular key rotation** every 90 days (recommended)

## Integration Status

✅ AWS SDK installed and configured  
✅ Transcribe routes implemented  
✅ Polly routes implemented  
✅ S3 upload/download handlers  
✅ Voice service fallback logic  
✅ Error handling and health checks  

## Next Steps

1. Create AWS account and get credentials
2. Add environment variables to your app
3. Test voice functionality
4. Deploy with confidence knowing you have reliable backup voice services

Your ChefGrocer app will now have enterprise-grade voice capabilities with automatic fallbacks!