# Burrow Deployment Guide

Complete step-by-step guide to deploy Burrow to iOS App Store and Google Play Store.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Expo Account Setup](#expo-account-setup)
3. [App Store Preparation](#app-store-preparation)
4. [Play Store Preparation](#play-store-preparation)
5. [Building with EAS](#building-with-eas)
6. [iOS Deployment](#ios-deployment)
7. [Android Deployment](#android-deployment)
8. [Post-Launch](#post-launch)

---

## Prerequisites

### Required Accounts

- **Expo Account**: Free at https://expo.dev/signup
- **Apple Developer Account**: $99/year at https://developer.apple.com
- **Google Play Console**: $25 one-time at https://play.google.com/console

### Required Tools

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Verify installation
eas whoami
```

---

## Expo Account Setup

1. **Create Expo Account**:
   ```bash
   # If you don't have an account
   expo register

   # Login
   eas login
   ```

2. **Link Project**:
   ```bash
   cd burrow-app
   eas init
   ```

3. **Configure EAS Build**:
   ```bash
   eas build:configure
   ```

   This creates `eas.json`:
   ```json
   {
     "cli": {
       "version": ">= 5.0.0"
     },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "android": {
           "buildType": "apk"
         },
         "ios": {
           "simulator": false
         }
       },
       "production": {
         "android": {
           "buildType": "app-bundle"
         },
         "ios": {
           "simulator": false
         }
       }
     },
     "submit": {
       "production": {}
     }
   }
   ```

---

## App Store Preparation (iOS)

### Step 1: Apple Developer Account

1. **Enroll in Apple Developer Program**:
   - Visit https://developer.apple.com/programs/
   - Cost: $99/year
   - Complete enrollment (can take 24-48 hours)

2. **Create App ID**:
   - Go to https://developer.apple.com/account/resources/identifiers
   - Click "+" to create new identifier
   - Select "App IDs"
   - Bundle ID: `com.preppercodex.burrow`
   - Description: "Burrow: The Digital Ledger"
   - Capabilities: Enable as needed (Push Notifications if using)

### Step 2: App Store Connect

1. **Create New App**:
   - Visit https://appstoreconnect.apple.com
   - Go to "My Apps" → "+" → "New App"
   - Platform: iOS
   - Name: "Burrow: The Digital Ledger"
   - Primary Language: English (U.S.)
   - Bundle ID: Select `com.preppercodex.burrow`
   - SKU: `burrow-app-001`
   - User Access: Full Access

2. **App Information**:
   - **Category**:
     - Primary: Productivity
     - Secondary: Lifestyle
   - **Privacy Policy URL**: Required (create one)
   - **Subtitle**: "Know what you own. Track what expires."
   - **Keywords**: prepper, inventory, survival, emergency, preparedness, stockpile, expiration, tracker, offline, OPSEC

3. **Prepare Screenshots**:

   Required sizes:
   - 6.7" (iPhone 14 Pro Max): 1290 x 2796 px
   - 6.5" (iPhone 11 Pro Max): 1242 x 2688 px
   - 5.5" (iPhone 8 Plus): 1242 x 2208 px

   Tools:
   - Use iPhone simulator + `⌘ + S` to screenshot
   - Use Figma/Sketch for mockups
   - Or use https://www.screely.com for browser-based

4. **App Description** (see README.md for template)

5. **App Icon**:
   - 1024 x 1024 px
   - No transparency
   - PNG format
   - Located: `/assets/icon.png`

### Step 3: Certificates & Provisioning

EAS handles this automatically! When you run:
```bash
eas build --platform ios
```

EAS will:
- Generate certificates
- Create provisioning profiles
- Store them securely in Expo's servers

**Manual Alternative** (not recommended):
- Use https://developer.apple.com/account/resources/certificates
- Create Distribution Certificate
- Create Provisioning Profile for App Store

---

## Play Store Preparation (Android)

### Step 1: Google Play Console Account

1. **Create Account**:
   - Visit https://play.google.com/console/signup
   - Pay $25 one-time registration fee
   - Complete verification (can take 24-48 hours)

2. **Create New App**:
   - Go to "All apps" → "Create app"
   - App name: "Burrow: The Digital Ledger"
   - Default language: English (United States)
   - App/Game: App
   - Free/Paid: Free (or Paid if Premium-only)
   - Declarations: Complete required declarations

### Step 2: Store Listing

1. **App Details**:
   - **Short description** (80 chars max):
     "Offline inventory tracker for preppers. Know what you own, track expirations."

   - **Full description** (4000 chars max): See README.md

   - **Category**: Productivity

   - **Contact details**:
     - Email: support@preppercodex.com
     - Website: preppercodex.com (optional)

2. **Graphics**:

   Required:
   - **App icon**: 512 x 512 px (PNG, 32-bit, no transparency)
   - **Feature graphic**: 1024 x 500 px (JPG or PNG)
   - **Phone screenshots**:
     - Min 2, max 8
     - 1080 x 1920 px (16:9 portrait)
   - **7-inch tablet screenshots** (optional but recommended):
     - 1536 x 2048 px
   - **10-inch tablet screenshots** (optional):
     - 1920 x 2560 px

3. **Content Rating**:
   - Fill out questionnaire at "Content rating" section
   - Answer questions honestly
   - Burrow should receive: "Everyone" or "Everyone 10+"

4. **App Content**:
   - Privacy policy URL (required)
   - Ads: No (unless implementing ads)
   - Target audience: Adults (18+)
   - Store presence: Publicly available

### Step 3: App Signing

EAS handles automatically! When you run:
```bash
eas build --platform android
```

EAS will:
- Generate keystore
- Sign APK/AAB
- Store keystore securely

**Manual Alternative** (not recommended):
- Generate keystore with Android Studio
- Upload to Play Console

---

## Building with EAS

### Test Build (Preview)

Before production, test with internal build:

```bash
# Android APK (can install directly)
eas build --platform android --profile preview

# iOS (TestFlight)
eas build --platform ios --profile preview
```

Download and test on device:
```bash
# View builds
eas build:list

# Download specific build
eas build:download [build-id]
```

### Production Build

When ready for stores:

```bash
# Build both platforms
eas build --platform all --profile production

# Or individually:
eas build --platform ios --profile production
eas build --platform android --profile production
```

**Build Process**:
- Takes 15-30 minutes
- Monitor at https://expo.dev/accounts/[your-account]/projects/burrow-app/builds
- Receive email when complete
- iOS produces `.ipa` file
- Android produces `.aab` (App Bundle)

### Troubleshooting Builds

**Build fails?**
```bash
# View logs
eas build:view [build-id]

# Common issues:
# 1. Missing credentials → Run: eas credentials
# 2. Dependency conflicts → Check package.json
# 3. Native module errors → Verify expo-modules-core is installed
```

---

## iOS Deployment

### Step 1: Submit to App Store

```bash
# Automated submission (recommended)
eas submit --platform ios

# Follow prompts:
# - Select build ID (from recent builds)
# - Enter Apple ID
# - Enter app-specific password (create at appleid.apple.com)
```

**Manual Alternative**:
1. Download `.ipa` from EAS
2. Open Xcode → Window → Organizer
3. Drag `.ipa` to Organizer
4. Click "Distribute App" → "App Store Connect"

### Step 2: Complete App Store Connect

1. **Go to App Store Connect**:
   - https://appstoreconnect.apple.com
   - Select "Burrow: The Digital Ledger"

2. **Complete Metadata** (if not done):
   - App Information
   - Pricing and Availability
   - App Privacy
   - Age Rating

3. **Create Version**:
   - Version Number: 1.0.0
   - Build: Select uploaded build (may take 10-20 min to appear)
   - What's New in This Version: "Initial release"

4. **Submit for Review**:
   - Click "Submit for Review"
   - Answer additional questions
   - Export compliance: "No" (no encryption unless implemented)
   - Advertising identifier: "No" (unless using ads)

### Step 3: App Review

- **Timeline**: 1-3 business days (sometimes faster)
- **Common Rejection Reasons**:
  - Incomplete metadata
  - Missing privacy policy
  - App crashes on launch
  - Misleading screenshots
  - Weapons/controversial content (avoid in description)

**If Rejected**:
- Read rejection reason carefully
- Fix issues
- Re-submit (no limit on re-submissions)

### Step 4: Release

Once approved:
- **Manual Release**: You control when to publish
- **Automatic Release**: Goes live immediately upon approval

Set in "Version Release" section.

---

## Android Deployment

### Step 1: Submit to Play Console

```bash
# Automated submission
eas submit --platform android

# Select build ID and follow prompts
```

**Manual Alternative**:
1. Download `.aab` from EAS
2. Go to Play Console
3. Select app → "Production" (or "Testing" first)
4. Click "Create new release"
5. Upload `.aab` file

### Step 2: Complete Play Console

1. **Internal Testing** (Optional but Recommended):
   - Create "Internal testing" release
   - Add test users (email addresses)
   - Test thoroughly before production

2. **Production Release**:
   - Go to "Production" → "Create new release"
   - Upload signed AAB
   - Release name: "1.0.0"
   - Release notes: "Initial release of Burrow inventory tracker"
   - Review and roll out

### Step 3: Review Process

- **Timeline**: 1-3 days (usually faster than iOS)
- **Common Rejection Reasons**:
  - Policy violations
  - Sensitive permissions without justification
  - Incomplete store listing
  - Malware/security issues

### Step 4: Staged Rollout (Optional)

Play Console allows staged rollout:
- Start with 5% of users
- Monitor crash reports
- Increase to 10%, 25%, 50%, 100%

Set in "Release" section.

---

## Post-Launch

### Monitoring

1. **Analytics**:
   - App Store Connect: Downloads, crashes, reviews
   - Play Console: Installs, crashes, ratings
   - Expo Dashboard: Build status

2. **Crash Reporting**:
   ```bash
   # Add Sentry (optional)
   npx expo install sentry-expo
   ```

3. **User Feedback**:
   - Monitor app reviews
   - Respond to reviews (especially negative ones)
   - Track feature requests

### Updates

1. **Increment Version**:
   ```json
   // app.json
   {
     "expo": {
       "version": "1.0.1",  // User-facing version
       "ios": {
         "buildNumber": "1.0.1"  // iOS build number
       },
       "android": {
         "versionCode": 2  // Android version code (integer)
       }
     }
   }
   ```

2. **Build and Submit**:
   ```bash
   eas build --platform all --profile production
   eas submit --platform all
   ```

3. **Release Notes**: Always include what's new

### Pricing Strategy

**Free Tier**:
- Up to 100 items
- All core features

**Premium Tier** ($39.99/year):
- Unlimited items
- Advanced features

**Implementation**:
- Use Expo In-App Purchases
- Or external subscription management (Stripe, RevenueCat)

**In App.json**:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "SKAdNetworkItems": []  // For ads if needed
      }
    }
  }
}
```

---

## Maintenance Schedule

**Weekly**:
- Monitor crash reports
- Review user feedback
- Check analytics

**Monthly**:
- Bug fix releases if needed
- Performance optimizations

**Quarterly**:
- Feature updates
- Major improvements
- Security patches

---

## Emergency Procedures

### Critical Bug Found

1. **Pull from stores** (if severe):
   - App Store: Can't remove, but can stop sales
   - Play Store: Can unpublish immediately

2. **Fix and redeploy**:
   ```bash
   # Increment patch version
   # 1.0.0 → 1.0.1

   eas build --platform all --profile production
   eas submit --platform all
   ```

3. **Request expedited review** (iOS):
   - Available for critical bugs
   - Explain severity in review notes

---

## Checklist Before Production

### Code
- [ ] All features tested on iOS
- [ ] All features tested on Android
- [ ] No console errors or warnings
- [ ] Database migrations work
- [ ] Offline functionality verified
- [ ] Barcode scanning works
- [ ] PDF export functional

### Assets
- [ ] App icon finalized (1024x1024 iOS, 512x512 Android)
- [ ] Splash screen designed
- [ ] Screenshots captured (5+ per platform)
- [ ] Feature graphic created (Android)
- [ ] Privacy policy published

### Store Listings
- [ ] App descriptions written
- [ ] Keywords researched
- [ ] Categories selected
- [ ] Contact info provided
- [ ] Age ratings completed

### Legal
- [ ] Privacy policy URL
- [ ] Terms of service (if applicable)
- [ ] GDPR compliance (if EU users)
- [ ] COPPA compliance (if under 13 users)

### Marketing
- [ ] Landing page ready (optional)
- [ ] Social media accounts created
- [ ] Press kit prepared
- [ ] Launch announcement ready

---

## Resources

- **Expo Documentation**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **App Store Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Play Store Policies**: https://play.google.com/about/developer-content-policy/
- **Expo Discord**: https://chat.expo.dev (for support)

---

## Cost Summary

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Account | $99 | Annual |
| Google Play Console | $25 | One-time |
| Expo EAS Build (free tier) | $0 | Monthly (limited builds) |
| Expo EAS Build (production) | $29/month | Monthly (optional, unlimited builds) |
| Domain (optional) | $12/year | Annual |
| **Total Year 1** | **~$136** | (without EAS paid) |
| **Total Year 1 (with EAS)** | **~$484** | (with EAS production) |

---

**Last Updated**: November 5, 2025
**Version**: 1.0
**Status**: Ready for Deployment

For questions or issues during deployment, refer to the main README.md or Expo documentation.
