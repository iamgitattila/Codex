# Burrow App - Setup Guide

## Quick Start

This guide will help you get the Burrow app running on your development machine.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```

2. **npm or yarn**
   ```bash
   npm --version
   # or
   yarn --version
   ```

3. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

4. **iOS Simulator** (macOS only) or **Android Studio** (for Android development)

## Installation Steps

### 1. Install Dependencies

```bash
cd burrow-app
npm install
# or
yarn install
```

This will install all necessary packages including:
- React Native and Expo
- React Navigation
- React Native Paper
- SQLite
- Redux Toolkit
- And all other dependencies

### 2. Start the Development Server

```bash
npm start
# or
yarn start
# or
expo start
```

This will start the Expo development server and open a browser window with the Expo Developer Tools.

### 3. Run on iOS Simulator (macOS only)

```bash
# Press 'i' in the terminal
# or
npm run ios
```

### 4. Run on Android Emulator

```bash
# Press 'a' in the terminal
# or
npm run android
```

Note: Make sure you have Android Studio installed and an Android emulator configured.

### 5. Run on Physical Device

1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in the terminal or browser
3. The app will load on your device

## Common Issues & Solutions

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
expo start --clear
```

### Issue: iOS simulator not launching

**Solution:**
```bash
# Ensure Xcode Command Line Tools are installed
xcode-select --install

# Reset Expo cache
expo start --clear
```

### Issue: Android emulator not detected

**Solution:**
1. Open Android Studio
2. Go to AVD Manager (Tools > AVD Manager)
3. Create a new virtual device if none exists
4. Start the emulator
5. Run `expo start` again

### Issue: SQLite errors

**Solution:**
```bash
# Reinstall expo-sqlite
npm uninstall expo-sqlite
npm install expo-sqlite@~13.0.0
```

## Development Workflow

### Hot Reload

- Changes to JavaScript/TypeScript files will automatically reload
- Press `r` in the terminal to manually reload
- Press `Shift + r` to reload and clear cache

### Debugging

1. **React Native Debugger**
   - Press `Cmd + D` (iOS) or `Cmd + M` (Android) in the app
   - Select "Debug JS Remotely"

2. **Console Logs**
   - View logs in the terminal where `expo start` is running
   - Or use Expo Developer Tools in the browser

### Testing the App

1. **Sample Data**
   - The app automatically seeds sample data on first launch
   - Includes sample assets, locations, and kits

2. **Barcode Scanning**
   - Requires physical device (camera not available in simulators)
   - Test with any product barcode

3. **Database**
   - SQLite database stored locally
   - Location: App's Documents directory
   - Can reset by clearing app data

## Building for Production

### iOS (requires macOS & Apple Developer account)

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Project Configuration

### Key Configuration Files

- **app.json** - Expo configuration (app name, version, permissions)
- **package.json** - Dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **babel.config.js** - Babel configuration for path aliases

### Environment Variables

Currently, no environment variables are required for local development. All data is stored locally.

## Database Management

### Viewing SQLite Database

1. **iOS Simulator:**
   ```bash
   # Find the database file
   xcrun simctl get_app_container booted com.preppercodex.burrow data
   # Navigate to Documents/SQLite directory
   ```

2. **Android Emulator:**
   ```bash
   # Pull database from emulator
   adb pull /data/data/com.preppercodex.burrow/databases/burrow_inventory.db
   ```

3. **Use SQLite Browser**
   - Download: https://sqlitebrowser.org/
   - Open the pulled database file

### Resetting Database

- On iOS Simulator: Delete app and reinstall
- On Android Emulator: Clear app data in Settings
- On Physical Device: Uninstall and reinstall

## Code Structure

```
src/
├── database/          # SQLite setup, schema, services
├── navigation/        # React Navigation configuration
├── screens/           # All app screens
├── store/             # Redux state management
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Key Features to Test

1. ✅ **Dashboard** - View inventory stats
2. ✅ **Add Item** - Add new inventory items
3. ✅ **Search** - Search and filter items
4. ✅ **Locations** - View items by location
5. ✅ **Kits** - Manage BOBs, BOVs, Caches
6. ✅ **Expiration Alerts** - Track expiring items
7. ✅ **Shopping List** - Items below par level
8. ✅ **Settings** - App preferences

## Getting Help

- **Issues:** Open an issue on GitHub
- **Documentation:** See README.md
- **Community:** Reddit /r/preppers

## Next Steps

After setup is complete:

1. Explore the sample data loaded automatically
2. Add your own inventory items
3. Try barcode scanning (on physical device)
4. Test expiration alerts
5. Generate shopping lists

---

**Ready to track your preps!** 🎒

Burrow: The Digital Ledger | PrepperCodex Pillar 4
