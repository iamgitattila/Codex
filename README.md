# Codex Mobile App

A cross-platform mobile application built with React Native that runs on both iOS and Android.

## Features

- ✅ Cross-platform support (iOS & Android)
- ✅ TypeScript for type safety
- ✅ Dark mode support
- ✅ Modern React hooks
- ✅ Beautiful, responsive UI
- ✅ Ready for App Store & Google Play Store deployment

## Prerequisites

Before you begin, ensure you have the following installed:

### For Both Platforms
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [Watchman](https://facebook.github.io/watchman/) (recommended for macOS/Linux)

### For iOS Development
- macOS (required)
- [Xcode](https://developer.apple.com/xcode/) (latest version)
- [CocoaPods](https://cocoapods.org/) - Install with: `sudo gem install cocoapods`
- iOS Simulator (comes with Xcode)

### For Android Development
- [Android Studio](https://developer.android.com/studio)
- Android SDK (install via Android Studio)
- Android Emulator or physical Android device
- Java Development Kit (JDK 17 or higher)

## Setup Instructions

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Or if you prefer Yarn
yarn install
```

### 2. iOS Setup (macOS only)

```bash
# Navigate to iOS directory and install pods
cd ios
pod install
cd ..
```

### 3. Android Setup

Ensure you have Android Studio installed with:
- Android SDK Platform 34
- Android SDK Build-Tools 34.0.0
- Android Emulator

Set up environment variables in `~/.bash_profile` or `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Running the App

### Start Metro Bundler

First, start the Metro development server:

```bash
npm start
# or
yarn start
```

### Run on iOS

In a new terminal window:

```bash
npm run ios
# or
yarn ios

# To run on a specific simulator
npm run ios -- --simulator="iPhone 15 Pro"
```

### Run on Android

Make sure you have an Android emulator running or a device connected, then:

```bash
npm run android
# or
yarn android
```

## Building for Production

### iOS (App Store)

1. Open `ios/CodexMobile.xcworkspace` in Xcode
2. Select your development team in Signing & Capabilities
3. Choose "Generic iOS Device" or your connected device
4. Product → Archive
5. Follow the App Store upload process

### Android (Google Play Store)

1. Generate a signing key:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore codex-release-key.keystore -alias codex-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Place the keystore file in `android/app/`

3. Create `android/gradle.properties` with:
```properties
MYAPP_RELEASE_STORE_FILE=codex-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=codex-key-alias
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****
```

4. Build the release APK/AAB:
```bash
cd android
./gradlew assembleRelease  # For APK
./gradlew bundleRelease    # For AAB (recommended for Play Store)
```

5. Find your build at:
   - APK: `android/app/build/outputs/apk/release/app-release.apk`
   - AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## Project Structure

```
codex-mobile-app/
├── android/              # Android native code
├── ios/                  # iOS native code
├── App.tsx              # Main application component
├── index.js             # Entry point
├── app.json             # App configuration
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── babel.config.js      # Babel configuration
└── metro.config.js      # Metro bundler config
```

## Troubleshooting

### iOS Issues

**Pod install fails:**
```bash
cd ios
pod deintegrate
pod install
```

**Build fails:**
- Clean build folder: Xcode → Product → Clean Build Folder
- Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`

### Android Issues

**Gradle build fails:**
```bash
cd android
./gradlew clean
cd ..
```

**Metro bundler cache issues:**
```bash
npm start -- --reset-cache
```

**Port 8081 already in use:**
```bash
lsof -ti:8081 | xargs kill
```

## Customization

### Change App Name
1. Update `displayName` in `app.json`
2. iOS: Update in `ios/CodexMobile/Info.plist`
3. Android: Update in `android/app/src/main/res/values/strings.xml`

### Change Package/Bundle ID
1. iOS: Update in Xcode project settings
2. Android: Update `applicationId` in `android/app/build.gradle`

### Add App Icon
- Use a tool like [App Icon Generator](https://www.appicon.co/)
- Replace icons in `ios/CodexMobile/Images.xcassets/` and `android/app/src/main/res/mipmap-*/`

## Learn More

- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [iOS Developer Guide](https://developer.apple.com/)
- [Android Developer Guide](https://developer.android.com/)

## License

MIT License - feel free to use this project for your own applications!

## Support

For issues and questions:
- Check the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting)
- Visit [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- Join the [React Native Community](https://reactnative.dev/community/overview)