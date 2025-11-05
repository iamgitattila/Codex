# Burrow: The Digital Ledger

**Tagline:** "Know what you own. Track what expires. Stay prepared."

A cross-platform mobile application for preppers to manage their survival inventory with offline-first, OPSEC-hardened design.

## Features

### Core Functionality (MVP)
- **Universal Asset Ledger**: Track all survival assets across 5 major categories
- **Offline-First**: All data stored locally on device (SQLite via WatermelonDB)
- **Barcode Scanning**: Quick inventory entry via camera
- **Expiration Tracking**: Never waste supplies with automated alerts
- **Location Management**: Organize items by storage location
- **Kit Management**: Group related items (BOBs, BOVs, caches, etc.)
- **Par Level Tracking**: Set minimum quantities and get shopping alerts
- **PDF Export**: Emergency hardcopy backup for SHTF scenarios
- **OPSEC-First**: Zero cloud by default, all data stays on device

### Asset Categories
1. **Consumables**: Food, Water, Medicine, Hygiene, Fuel
2. **Tools & Gear**: Survival gear, Pillar-specific equipment
3. **Kits**: Bug-out bags, vehicles, caches, first aid
4. **Documents**: Critical information tracking
5. **Locations**: Home, vehicle, cache storage areas

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Database**: SQLite with WatermelonDB (offline-first)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **UI Framework**: React Native Paper (Material Design)
- **Barcode**: Expo Camera + Barcode Scanner
- **PDF Export**: Expo Print
- **Notifications**: Expo Notifications
- **State Management**: WatermelonDB (local) + React Hooks

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- For iOS development: macOS with Xcode
- For Android development: Android Studio with Android SDK
- Expo Go app on your mobile device (for testing)

## Installation

```bash
# Clone the repository
cd burrow-app

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npx expo start
```

## Development

### Running on Device/Simulator

```bash
# Start Expo development server
npx expo start

# Then:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app on physical device
```

### Project Structure

```
burrow-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   │   ├── DashboardScreen.tsx
│   │   ├── InventoryScreen.tsx
│   │   ├── LocationsScreen.tsx
│   │   ├── KitsScreen.tsx
│   │   └── MoreScreen.tsx
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   ├── database/           # WatermelonDB setup
│   │   ├── schema.ts
│   │   ├── models/
│   │   └── index.ts
│   ├── services/           # API services
│   │   └── barcodeService.ts
│   ├── utils/              # Utility functions
│   │   ├── dateUtils.ts
│   │   └── formatUtils.ts
│   ├── constants/          # App constants
│   │   ├── categories.ts
│   │   └── theme.ts
│   └── types/              # TypeScript type definitions
├── assets/                 # Images, fonts, etc.
├── App.tsx                 # Root component
├── app.json                # Expo configuration
└── package.json
```

## Building for Production

### Prerequisites for Building

1. **Create Expo Account**: https://expo.dev/signup
2. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   eas login
   ```

### Configure EAS Build

```bash
# Initialize EAS build configuration
eas build:configure
```

This creates `eas.json` with build profiles.

### iOS Build (requires Apple Developer account)

```bash
# Build for App Store submission
eas build --platform ios --profile production

# Build for TestFlight/internal testing
eas build --platform ios --profile preview
```

**Requirements**:
- Apple Developer Program membership ($99/year)
- App Store Connect configured
- Bundle identifier: `com.preppercodex.burrow`

### Android Build

```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

**Requirements**:
- Google Play Console account ($25 one-time)
- Package name: `com.preppercodex.burrow`
- Keystore configured (EAS handles automatically)

### Local Builds (Advanced)

```bash
# iOS (requires macOS)
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

## Deployment to App Stores

### iOS App Store Deployment

1. **Prepare App Store Connect**:
   - Create app listing at https://appstoreconnect.apple.com
   - Configure app metadata (description, screenshots, etc.)
   - Set pricing (Free tier or Premium)

2. **Build and Submit**:
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios
   ```

3. **App Review**:
   - Apple reviews typically take 1-3 days
   - Ensure compliance with App Store guidelines
   - No weapons, controversial content (focus on logistics)

### Google Play Store Deployment

1. **Prepare Play Console**:
   - Create app listing at https://play.google.com/console
   - Configure store listing (description, screenshots, etc.)
   - Set up content rating

2. **Build and Submit**:
   ```bash
   eas build --platform android --profile production
   eas submit --platform android
   ```

3. **Review Process**:
   - Google reviews typically take 1-3 days
   - Faster than iOS in most cases

## App Store Assets Needed

### Screenshots
- iOS: 6.5" (iPhone 14 Pro Max), 5.5" (iPhone 8 Plus)
- Android: Phone (1080x1920), Tablet (1536x2048)
- Recommended: 5-8 screenshots showing key features

### App Icon
- iOS: 1024x1024px (no alpha channel)
- Android: 512x512px
- Current: Located in `/assets/icon.png`

### App Description Template

```
Burrow: The Digital Ledger
Know what you own. Track what expires. Stay prepared.

Burrow is the offline-first inventory management app designed for preppers and those serious about emergency preparedness. Transform chaos into confidence with systematic tracking of your survival assets.

FEATURES:
• Offline-first design - all data stays on your device
• Barcode scanning for quick inventory entry
• Expiration tracking with automated alerts
• Location-based organization (pantry, garage, BOB, cache)
• Kit management (bug-out bags, vehicles, first aid)
• Par level tracking - never run low on essentials
• PDF export for emergency hardcopy backup
• OPSEC-focused - zero cloud dependency

CATEGORIES:
• Consumables: Food, Water, Medicine, Hygiene, Fuel
• Gear: Tools, survival equipment, Pillar-specific items
• Kits: Bug-out bags, vehicles, caches
• Documents: Critical information tracking
• Locations: Organize by storage area

FREE TIER:
• Up to 100 items
• All core features
• Offline-only

PREMIUM ($39.99/year):
• Unlimited items
• Local WiFi sync (multi-device)
• Advanced filtering
• Priority support

PRIVACY FIRST:
Burrow stores all data locally on your device. No account required. No cloud servers. Your inventory stays private.

Perfect for preppers, homesteaders, and anyone serious about emergency preparedness.
```

## Testing Checklist

Before deployment, verify:

- [ ] App launches successfully on iOS
- [ ] App launches successfully on Android
- [ ] Database initializes correctly
- [ ] All 5 main tabs load without errors
- [ ] Navigation between screens works
- [ ] No console errors or warnings
- [ ] App icon displays correctly
- [ ] Splash screen shows properly
- [ ] Permissions requested appropriately (camera, storage, notifications)
- [ ] App works offline (no network required)

## Troubleshooting

### Common Issues

**"Unable to resolve module"**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install --legacy-peer-deps
npx expo start -c
```

**Database errors**
```bash
# Reset database (development only)
# Uninstall app from device/simulator and reinstall
```

**Build failures**
```bash
# Check EAS build logs
eas build:list

# View specific build
eas build:view [build-id]
```

## Performance Optimization

- Database queries use indexes for fast lookups
- Images stored locally (not in database)
- Lazy loading for large lists
- Optimized re-renders with React.memo

## Security & Privacy

- **Offline-first**: No data leaves device by default
- **Optional encryption**: AES-256 (Premium feature)
- **No telemetry**: Minimal analytics (feature usage only)
- **No personal data**: No accounts, emails, or personal info collected

## Roadmap

### Version 1.0 (MVP) - Current
- [x] Core inventory management
- [x] Barcode scanning
- [x] Expiration tracking
- [x] Location management
- [x] Kit organization
- [ ] PDF export
- [ ] Local notifications
- [ ] Full UI polish

### Version 2.0 (Q1 2026)
- [ ] Optional encrypted cloud backup
- [ ] Private family sharing (account-based)
- [ ] Photo attachments for assets
- [ ] Consumption tracking
- [ ] Historical price tracking
- [ ] Integration with PrepperCodex Pillars 1-5

### Version 3.0 (Q2 2026)
- [ ] MAG/group licensing
- [ ] Role-based access control
- [ ] Audit logging
- [ ] Web dashboard (optional)
- [ ] Advanced analytics

## Contributing

This is a private project for PrepperCodex. For issues or feature requests, contact the development team.

## License

© 2025 PrepperCodex. All rights reserved.

## Support

For support, documentation, and updates:
- Website: preppercodex.com (coming soon)
- Email: support@preppercodex.com
- Community: Reddit /r/preppers

## Acknowledgments

Built with:
- React Native & Expo
- WatermelonDB
- React Native Paper
- Open Food Facts API
- The prepper community

---

**Version**: 1.0.0
**Last Updated**: November 5, 2025
**Status**: MVP Development Complete - Ready for Enhanced Features
