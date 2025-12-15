# 💧 Water Boil Logger

**"Every boil counts. Track your water."**

A hyper-focused hydration tracking app designed for preppers and off-grid enthusiasts in scenarios where tap water is unsafe and must be boiled before drinking. Track your boiled water intake, maintain streaks, and ensure your family stays properly hydrated when it matters most.

## 🎯 Features

### Core Functionality
- **⏱ One-Button Boil Timer**: Start a 60-second (customizable) countdown timer for boiling water
- **💧 Volume Logger**: Quick-log common volumes (8/16/32/64 oz) or enter custom amounts
- **📊 Daily Progress**: Visual progress bar showing intake vs. daily goal
- **🔥 Streak Tracking**: Gamified consecutive day tracking to build hydration habits
- **📈 Weekly Charts**: Bar graph visualization of 7-day hydration trends
- **📜 History**: View all past logs with filtering (last 30 days / all time)
- **⚙️ Settings**: Customize boil duration, volume units, and daily goals

### Key Benefits
- **Offline-First**: Works completely without internet connection
- **No Account Required**: All data stored locally on device
- **Family Tracking**: Log intake for different family members
- **SHTF-Focused**: Designed for scenarios where water safety is critical
- **CDC/WHO Standards**: Boil duration options based on altitude guidelines

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iamgitattila/Codex.git
   cd Codex/water-boil-logger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device**
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` to open in browser (limited functionality)

### Build Commands

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator (Mac only)
- `npm run web` - Run in web browser

## 📱 App Structure

```
water-boil-logger/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── LogEntry.tsx
│   │   ├── ProgressBar.tsx
│   │   └── StatCard.tsx
│   ├── constants/          # App-wide constants
│   │   └── index.ts
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/            # Main app screens
│   │   ├── HomeScreen.tsx
│   │   ├── TimerScreen.tsx
│   │   ├── VolumeLoggerScreen.tsx
│   │   ├── WeeklyScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # Business logic services
│   │   ├── StorageService.ts
│   │   └── NotificationService.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   └── utils/              # Utility functions
│       └── calculations.ts
├── App.tsx                 # App entry point
├── app.json                # Expo configuration
└── package.json
```

## 🔧 Technical Details

### Tech Stack
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack)
- **Storage**: AsyncStorage (local, offline)
- **Charts**: react-native-chart-kit
- **Notifications**: expo-notifications
- **State Management**: React Hooks (useState, useEffect)

### Data Structure

All data is stored locally using AsyncStorage:

```typescript
// Boil Log Entry
{
  log_id: string;
  timestamp: string;        // ISO 8601
  volume_oz: number;
  volume_liters: number;
  boil_duration_seconds: number;
  person: string;
  notes: string;
}

// Settings
{
  boil_duration_seconds: 60 | 180 | 300 | 600;
  volume_unit: 'oz' | 'liters';
  daily_goal_oz: number;
  notification_enabled: boolean;
  streak_enabled: boolean;
}

// Streaks
{
  current_streak: number;
  longest_streak: number;
  last_logged_date: string;
  streak_started_date: string;
}
```

## 🏔 Boiling Standards (CDC/WHO)

| Altitude | Boil Duration | Why |
|----------|---------------|-----|
| 0-2,000 ft (Sea level) | 1 minute | Standard pathogen kill time |
| 2,000-6,500 ft | 3 minutes | Lower oxygen, slower heating |
| 6,500-10,000 ft | 5 minutes | Reduced boiling point |
| >10,000 ft | 10 minutes | Significantly lower temps |

**App Default**: 1 minute (conservative, safe for most users)

## 🎮 Usage Guide

### First Time Setup
1. Open app → Grant notification permissions
2. Go to Settings → Set your daily goal (default: 64 oz)
3. Adjust boil duration based on your altitude

### Daily Workflow
1. **Start Boil**: Tap large red "START BOIL" button
2. **Wait**: Timer counts down (screen stays on)
3. **Log Volume**: When complete, select amount drunk (quick buttons or custom)
4. **Track Progress**: View daily progress and weekly charts

### Family Tracking
- When logging volume, select who drank (Me, Spouse, Child 1, Child 2, Other)
- Each log is tracked individually
- Daily totals combine all family member logs

## 📊 Metrics & Gamification

### Streaks
- **1 Day**: Start tracking
- **3 Days**: Building habit
- **7 Days**: 🎖 Weekly Hydrator badge
- **14 Days**: 💪 Two-Week Warrior
- **30 Days**: 🌟 Hydration Champion

### Weekly Goals
- Daily goal: 64 oz (2 liters) per adult
- Weekly goal: 448 oz (7 days × 64 oz)
- Chart shows visual progress bars

## 🔐 Privacy & Data

- **100% Offline**: No internet connection required
- **Local Storage**: All data stays on your device
- **No Tracking**: Zero analytics or third-party services
- **No Account**: No signup, login, or cloud sync

## 🛠 Development

### Running Tests
```bash
# TypeScript type checking
npx tsc --noEmit

# Run linter
npm run lint
```

### Building for Production

**Android APK**
```bash
eas build --platform android --profile production
```

**iOS IPA**
```bash
eas build --platform ios --profile production
```

*Note: Requires Expo Application Services (EAS) account*

## 🚧 Roadmap (V2.0+)

- [ ] Multi-user accounts (individual device profiles)
- [ ] Cloud backup (optional, encrypted)
- [ ] Smart reminders (time-based hydration alerts)
- [ ] Advanced analytics (trends, predictions)
- [ ] Apple Health / Google Fit integration
- [ ] Temperature tracking (cooled vs. hot water)
- [ ] Water source logging (well, rain, tap)
- [ ] PDF export (audit trail documentation)

## 🤝 Contributing

This is an MVP built for the PrepperCodex ecosystem. Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built following CDC/WHO water boiling guidelines
- Designed for the prepper/off-grid community
- Part of the PrepperCodex app ecosystem

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/iamgitattila/Codex/issues)
- **Documentation**: This README
- **Community**: PrepperCodex forums

---

**Water Boil Logger** - Making water safety trackable, one boil at a time.

*Version 1.0.0 | Built with ❤️ for the PrepperCodex community*
