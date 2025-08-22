# Apple Developer Certificates & Provisioning Setup Guide
## ChefAI Assistant - iOS App Store Deployment

### App Configuration Details
- **App Name**: ChefAI Assistant (AI Voice Chef Assistant)
- **Bundle ID**: `com.[yourcompany].voicechefassistant`
- **Target Platform**: iOS 14.0+
- **Distribution**: App Store

### Required Capabilities & Entitlements
Your AI voice chef assistant requires these special permissions:

1. **SiriKit Integration** - Voice commands and shortcuts
2. **Speech Recognition** - Voice-to-text conversion
3. **Microphone Access** - Voice input capture
4. **Push Notifications** - Meal reminders and grocery alerts
5. **Background Processing** - Meal planning and API calls
6. **Network Access** - Recipe APIs and grocery store integration

---

## Step 1: Create Certificate Signing Request (CSR)

### On Your Mac:
1. Open **Keychain Access** (Applications > Utilities)
2. Go to **Keychain Access** menu > **Certificate Assistant** > **Request a Certificate From a Certificate Authority**
3. Fill in the form:
   - **User Email Address**: Your Apple ID email
   - **Common Name**: Your full name or company name
   - **CA Email Address**: Leave blank
   - **Request is**: Select "Saved to disk"
   - **Let me specify key pair information**: Check this box
4. Click **Continue**
5. Save the CSR file to your Desktop as `CertificateSigningRequest.certSigningRequest`
6. In the next screen:
   - **Key Size**: 2048 bits
   - **Algorithm**: RSA
7. Click **Continue** and **Done**

---

## Step 2: Create iOS Development Certificate

### In Apple Developer Portal:
1. Go to [developer.apple.com](https://developer.apple.com)
2. Sign in with your Apple ID
3. Navigate to **Account** > **Certificates, Identifiers & Profiles**
4. Click **Certificates** in the sidebar
5. Click the **+** button to create a new certificate
6. Select **iOS Development** under Development section
7. Click **Continue**
8. Upload your CSR file from Step 1
9. Click **Continue**
10. Download the certificate file (.cer)
11. Double-click the downloaded certificate to install it in Keychain Access

---

## Step 3: Create iOS Distribution Certificate

### For App Store Distribution:
1. In the same Certificates section, click **+** again
2. Select **iOS Distribution (App Store and Ad Hoc)** under Production section
3. Click **Continue**
4. Upload the same CSR file
5. Click **Continue**
6. Download the distribution certificate (.cer)
7. Double-click to install in Keychain Access

---

## Step 4: Create App ID with Required Capabilities

### Register Your App ID:
1. In Apple Developer Portal, go to **Identifiers** in the sidebar
2. Click the **+** button
3. Select **App IDs** and click **Continue**
4. Select **App** and click **Continue**
5. Fill in the details:
   - **Description**: ChefAI Assistant - AI Voice Chef App
   - **Bundle ID**: Explicit - `com.[yourcompany].voicechefassistant`
     - Replace `[yourcompany]` with your actual company/developer name
6. **Enable Required Capabilities**:
   - ✅ **SiriKit** (for voice commands)
   - ✅ **Speech** (for voice recognition)
   - ✅ **Push Notifications** (for meal reminders)
   - ✅ **Background Modes** (for background processing)
   - ✅ **Network Extensions** (if needed for advanced networking)
7. Click **Continue** and **Register**

---

## Step 5: Create Development Provisioning Profile

### For Testing on Devices:
1. Go to **Profiles** in the sidebar
2. Click the **+** button
3. Select **iOS App Development** under Development
4. Click **Continue**
5. Select your App ID created in Step 4
6. Click **Continue**
7. Select your iOS Development Certificate
8. Click **Continue**
9. Select your test devices (you must register them first in Devices section)
10. Click **Continue**
11. Name the profile: `ChefAI Assistant Development`
12. Click **Generate**
13. Download the provisioning profile (.mobileprovision)
14. Double-click to install it

---

## Step 6: Create Distribution Provisioning Profile

### For App Store Submission:
1. In Profiles section, click **+** again
2. Select **App Store** under Distribution
3. Click **Continue**
4. Select your App ID
5. Click **Continue**
6. Select your iOS Distribution Certificate
7. Click **Continue**
8. Name the profile: `ChefAI Assistant App Store`
9. Click **Generate**
10. Download and install the distribution provisioning profile

---

## Step 7: Configure Xcode Project

### Update Your Capacitor iOS Project:
1. Open your project in Xcode: `ios/App/App.xcworkspace`
2. Select your project in the navigator
3. Select the **App** target
4. Go to **Signing & Capabilities** tab
5. **Team**: Select your Apple Developer Team
6. **Bundle Identifier**: `com.[yourcompany].voicechefassistant`
7. **Provisioning Profile**: 
   - Development: Select your development profile
   - Release: Select your distribution profile

### Add Required Capabilities:
1. Click **+ Capability** and add:
   - **SiriKit**
   - **Speech**
   - **Push Notifications**
   - **Background Modes**
     - Enable: Background processing, Voice over IP
2. Update `Info.plist` with usage descriptions:

```xml
<key>NSSpeechRecognitionUsageDescription</key>
<string>This app uses speech recognition to process voice commands for cooking assistance.</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to listen to your voice commands and cooking questions.</string>
<key>NSSiriUsageDescription</key>
<string>This app integrates with Siri to provide hands-free cooking assistance.</string>
```

---

## Step 8: Test Your Setup

### Development Testing:
1. Connect your iPhone to your Mac
2. In Xcode, select your device as the target
3. Build and run the project (⌘R)
4. The app should install and launch on your device

### Verify Certificates in Keychain:
- Open Keychain Access
- Look for your certificates under "My Certificates"
- You should see both development and distribution certificates
- Each should have a private key underneath it

---

## Step 9: Prepare for App Store Submission

### Archive Your App:
1. In Xcode, select **Generic iOS Device** (not a specific device)
2. Go to **Product** > **Archive**
3. When the archive completes, the Organizer will open
4. Select your archive and click **Distribute App**
5. Choose **App Store Connect**
6. Follow the prompts to upload to App Store Connect

---

## Troubleshooting Common Issues

### Certificate Issues:
- **"No signing certificate found"**: Ensure certificates are installed in Keychain Access
- **"Provisioning profile doesn't match"**: Check bundle ID matches exactly
- **"Invalid certificate"**: Regenerate CSR and create new certificates

### Capability Issues:
- **SiriKit not working**: Ensure App ID has SiriKit enabled and Info.plist has usage description
- **Speech recognition failing**: Check microphone permissions and Speech capability

### Profile Issues:
- **"Profile doesn't include device"**: Add your device to the provisioning profile
- **"Expired profile"**: Renew in Apple Developer Portal and download/install new one

---

## Alternative Setup Options

### Option 1: Screen Sharing (Recommended)
- You maintain full control of your Apple Developer account
- I guide you through each step in real-time
- Most secure approach
- You learn the process for future updates

### Option 2: Temporary Team Access
- You add me as a temporary team member with limited access
- I can configure certificates and profiles directly
- Remove access immediately after setup
- Faster but requires more trust

### Option 3: Self-Guided with Support
- Use this guide to set up independently
- Contact me if you encounter specific issues
- Most educational approach
- Takes longer but you gain complete understanding

---

## Security Best Practices

1. **Never share your private keys** - They should stay in your Keychain
2. **Remove temporary team members** immediately after setup
3. **Regularly review team access** in Apple Developer Portal
4. **Use strong passwords** for your Apple ID
5. **Enable two-factor authentication** on your Apple ID

---

## Next Steps After Certificate Setup

1. **Test all app features** on physical devices
2. **Verify voice recognition** and Siri integration work
3. **Test push notifications** with production certificates
4. **Create App Store Connect listing**
5. **Prepare app screenshots** and metadata
6. **Submit for App Review**

---

**Need Help?** If you encounter any issues during this process, let me know exactly where you're stuck and I can provide specific guidance for that step.