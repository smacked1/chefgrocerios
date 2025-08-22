# Apple Developer Setup - Troubleshooting Checklist
## Quick Reference for Common Certificate & Provisioning Issues

### Pre-Setup Verification ✅

**Before Starting Certificate Process:**
- [ ] Apple Developer Program membership is active ($99/year)
- [ ] Apple ID has two-factor authentication enabled
- [ ] Xcode is installed and up to date
- [ ] You have admin access to your Mac
- [ ] You can access Keychain Access application

---

### Certificate Creation Issues 🛠️

**Problem: "Certificate Signing Request failed"**
- [ ] Check CSR was created with 2048-bit RSA key
- [ ] Verify email in CSR matches your Apple ID exactly
- [ ] Try creating new CSR if first one fails
- [ ] Ensure Keychain Access has proper permissions

**Problem: "Certificate won't install"**
- [ ] Double-click the .cer file (don't drag to Keychain)
- [ ] Check you're installing to "login" keychain
- [ ] Verify certificate isn't expired
- [ ] Try restarting Keychain Access

**Problem: "No private key with certificate"**
- [ ] Certificate and CSR must be created on same Mac
- [ ] Private key should appear under certificate in Keychain
- [ ] If missing, delete certificate and start over
- [ ] Check you haven't switched user accounts

---

### App ID Configuration Issues 🆔

**Problem: "Bundle ID already exists"**
- [ ] Try adding a unique suffix: `com.yourname.voicechefassistant.v2`
- [ ] Check if you previously created this App ID
- [ ] Use reverse-domain notation correctly
- [ ] Avoid special characters or spaces

**Problem: "Capabilities not available"**
- [ ] Ensure you have paid Apple Developer membership
- [ ] Some capabilities require additional approval
- [ ] Check capability is supported for your account type
- [ ] SiriKit requires specific approval process

**Problem: "Cannot enable SiriKit"**
- [ ] SiriKit requires manual review by Apple
- [ ] Submit capability request through developer portal
- [ ] Provide clear description of how you'll use SiriKit
- [ ] Allow 1-2 business days for approval

---

### Provisioning Profile Issues 📋

**Problem: "No matching provisioning profile"**
- [ ] Bundle ID in Xcode matches App ID exactly
- [ ] Profile includes your development certificate
- [ ] Profile includes your test device UDID
- [ ] Profile hasn't expired (check date)

**Problem: "Device not included in profile"**
- [ ] Register device in Devices section first
- [ ] Get device UDID from Xcode or iTunes
- [ ] Regenerate provisioning profile after adding device
- [ ] Download and install updated profile

**Problem: "Certificate not valid for profile"**
- [ ] Development profile needs development certificate
- [ ] Distribution profile needs distribution certificate
- [ ] Certificate must be installed in Keychain
- [ ] Check certificate expiration date

---

### Xcode Configuration Issues ⚙️

**Problem: "No code signing identity found"**
- [ ] Certificates properly installed in Keychain Access
- [ ] Xcode is using correct Apple ID account
- [ ] Team selection matches certificate team
- [ ] Try refreshing profiles in Xcode preferences

**Problem: "Bundle identifier cannot be used"**
- [ ] Bundle ID matches App ID exactly (case sensitive)
- [ ] No extra characters or typos
- [ ] Check for trailing spaces
- [ ] Verify in both Xcode and capacitor.config.ts

**Problem: "Entitlement not allowed"**
- [ ] Capability is enabled in App ID
- [ ] Provisioning profile includes the capability
- [ ] Info.plist has required usage descriptions
- [ ] Entitlements file is correctly configured

---

### Voice & Speech Issues 🎤

**Problem: "Speech recognition not working"**
- [ ] Speech capability enabled in App ID
- [ ] NSMicrophoneUsageDescription in Info.plist
- [ ] NSSpeechRecognitionUsageDescription in Info.plist
- [ ] User granted microphone permission
- [ ] Test on physical device (not simulator)

**Problem: "Siri integration failing"**
- [ ] SiriKit capability approved by Apple
- [ ] NSSiriUsageDescription in Info.plist
- [ ] SiriKit intent definitions configured
- [ ] Test with "Hey Siri" on device
- [ ] Check Siri is enabled in device settings

---

### Testing & Deployment Issues 🚀

**Problem: "Cannot install on device"**
- [ ] Device is registered in provisioning profile
- [ ] Device trusts your developer certificate
- [ ] iOS version is compatible with deployment target
- [ ] Try cleaning build folder (⌘⇧K) and rebuilding

**Problem: "App crashes on launch"**
- [ ] Check device console logs in Xcode
- [ ] Verify all required frameworks are linked
- [ ] Test with Release configuration
- [ ] Check for missing Info.plist entries

**Problem: "Push notifications not working"**
- [ ] Push Notifications capability enabled
- [ ] APNs certificates configured
- [ ] User granted notification permission
- [ ] Test with both development and production certificates

---

### App Store Submission Issues 📱

**Problem: "Invalid binary"**
- [ ] Use distribution provisioning profile
- [ ] Archive with Generic iOS Device selected
- [ ] All required capabilities properly configured
- [ ] Info.plist has all usage descriptions

**Problem: "Missing compliance information"**
- [ ] Declare if app uses encryption
- [ ] Provide export compliance documentation
- [ ] Answer security questions accurately
- [ ] Include privacy policy URL if required

---

### Emergency Recovery Steps 🆘

**If Everything Breaks:**
1. **Reset Certificates:**
   - Revoke all existing certificates
   - Delete from Keychain Access
   - Create fresh CSR and certificates

2. **Reset Provisioning:**
   - Delete all provisioning profiles
   - Recreate with new certificates
   - Download and install fresh profiles

3. **Reset Xcode:**
   - Delete derived data folder
   - Sign out and back into Apple ID
   - Clean build folder
   - Restart Xcode

4. **Reset Device:**
   - Delete app from device
   - Restart device
   - Trust developer certificate again
   - Reinstall app

---

### Getting Help 💬

**When to Contact Apple:**
- SiriKit capability approval delays (>3 days)
- Account billing or membership issues
- Technical capability restrictions
- App Review rejections

**When to Contact Me:**
- Specific certificate installation errors
- Xcode configuration problems
- Capacitor iOS build issues
- General setup guidance

**Self-Help Resources:**
- Apple Developer Documentation
- Xcode Build Settings Reference
- iOS App Distribution Guide
- Apple Developer Forums

---

**Remember:** Certificate and provisioning setup is often the most complex part of iOS development. Take your time, follow each step carefully, and don't hesitate to ask for help when you encounter issues.