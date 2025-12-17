# Burrow - Quick Start Guide

Get up and running with Burrow in 5 minutes.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd burrow-app
npm install --legacy-peer-deps
```

### 2. Start Development Server

```bash
npx expo start
```

### 3. Run on Device

Choose one:
- **iOS Simulator**: Press `i` in terminal
- **Android Emulator**: Press `a` in terminal
- **Physical Device**: Scan QR code with Expo Go app

## 📱 First Time Setup

### Install Expo Go (for testing on physical device)

**iOS**: https://apps.apple.com/app/expo-go/id982107779
**Android**: https://play.google.com/store/apps/details?id=host.exp.exponent

### Testing the App

Once running, you should see:
1. **Dashboard** - Empty stats (no items yet)
2. **Inventory** - Empty list with "Add Item" button
3. **Locations** - 5 default locations (Pantry, Garage, Basement, Vehicle, Cache)
4. **Kits** - Empty (ready to create BOBs, BOVs, etc.)
5. **More** - Settings and export options

## 🔧 Common Commands

```bash
# Start development server
npm start
# or
npx expo start

# Start with cache clear
npx expo start -c

# Run on specific platform
npx expo start --ios
npx expo start --android

# Install new package
npm install --legacy-peer-deps [package-name]

# Type checking
npx tsc --noEmit

# Format code (if using prettier)
npm run format
```

## 🏗️ Project Structure

```
burrow-app/
├── src/
│   ├── screens/       # 5 main screens (Dashboard, Inventory, Locations, Kits, More)
│   ├── navigation/    # Bottom tabs + stack navigation
│   ├── database/      # SQLite schema & models (WatermelonDB)
│   ├── services/      # API services (barcode lookup, etc.)
│   ├── utils/         # Date formatting, data formatting
│   ├── constants/     # Categories, theme, types
│   └── components/    # Reusable UI components (coming soon)
├── assets/           # App icon, splash screen, images
├── App.tsx           # Root component
├── app.json          # Expo configuration
└── package.json      # Dependencies
```

## 🎨 Customization

### Change App Name

Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### Change Theme Colors

Edit `src/constants/theme.ts`:
```typescript
export const theme = {
  colors: {
    primary: '#2C5530',  // Change this
    // ...
  }
};
```

### Change Bundle Identifier

Edit `app.json`:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

## 🐛 Troubleshooting

### "Unable to resolve module"

```bash
rm -rf node_modules
npm install --legacy-peer-deps
npx expo start -c
```

### "Invariant Violation: ViewPropTypes"

This is normal with newer React Native. The app should still work.

### Database not initializing

```bash
# Uninstall app from device/simulator
# Clear Expo cache
npx expo start -c
# Reinstall
```

### Build errors

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for ESLint errors (if configured)
npm run lint
```

## 📦 Adding Features

### Next Steps for Development

1. **Add Item Form**: Build the full form with all fields
2. **Barcode Scanning**: Integrate camera + Open Food Facts API
3. **Dashboard Stats**: Connect to database for real counts
4. **Inventory List**: Show actual items with search/filter
5. **PDF Export**: Generate printable inventory
6. **Notifications**: Alert for expiring items

### Recommended Development Order

1. ✅ Core navigation (done)
2. ✅ Database setup (done)
3. 🔲 Add/Edit Item screen
4. 🔲 Display items in Inventory
5. 🔲 Barcode scanning
6. 🔲 Dashboard with real data
7. 🔲 Expiration alerts
8. 🔲 PDF export
9. 🔲 Polish UI
10. 🔲 Testing & deployment

## 🧪 Testing

### Test on Multiple Devices

- iPhone (iOS 14+)
- iPad (iOS 14+)
- Android Phone (Android 10+)
- Android Tablet (Android 10+)

### Key Areas to Test

- [ ] App launches
- [ ] Navigation between tabs
- [ ] Database initializes
- [ ] Items can be added (when form is complete)
- [ ] Items appear in inventory
- [ ] Search/filter works
- [ ] Locations load
- [ ] Kits can be created
- [ ] App works offline
- [ ] Barcode scanning (camera permissions)
- [ ] PDF export generates correctly

## 📚 Learning Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **WatermelonDB**: https://nozbe.github.io/WatermelonDB/
- **React Navigation**: https://reactnavigation.org/docs/getting-started
- **React Native Paper**: https://callstack.github.io/react-native-paper/

## 🤝 Getting Help

1. Check the README.md for full documentation
2. Check DEPLOYMENT.md for build/deploy issues
3. Check Expo documentation
4. Ask in Expo Discord: https://chat.expo.dev

## 🎯 Current Status

**Completed**:
- ✅ Project setup with TypeScript
- ✅ Database schema (SQLite + WatermelonDB)
- ✅ 7 data models (Asset, Location, Kit, etc.)
- ✅ Navigation structure (5 main tabs)
- ✅ Basic UI screens (placeholder state)
- ✅ Theme and constants
- ✅ Utility functions (date, format)
- ✅ Barcode service (Open Food Facts API)
- ✅ App configuration (app.json)

**To Do**:
- 🔲 Complete Add/Edit Item form
- 🔲 Implement barcode scanning
- 🔲 Connect Dashboard to database
- 🔲 Build Inventory list with real data
- 🔲 Location detail screen
- 🔲 Kit detail screen
- 🔲 Expiration alerts with notifications
- 🔲 Shopping list generation
- 🔲 PDF export functionality
- 🔲 Settings screen
- 🔲 UI polish and loading states
- 🔲 Testing on both platforms
- 🔲 App store assets (icons, screenshots)
- 🔲 Build for production

## 💡 Tips

1. **Use Hot Reload**: Edit code and see changes instantly
2. **Check Console**: Watch for errors/warnings
3. **Test Offline**: Disable WiFi to verify offline-first design
4. **Clear Cache**: If weird behavior, clear Expo cache
5. **Version Control**: Commit often during development

## 🚢 Ready to Deploy?

See DEPLOYMENT.md for complete step-by-step guide to:
- Build with EAS
- Submit to App Store
- Submit to Play Store
- Monitor and maintain

---

**Happy coding! 🎉**

For questions: Check README.md or Expo documentation.
