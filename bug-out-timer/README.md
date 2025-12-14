# Bug-Out Timer MVP

**Evacuation Drill Timer for Preppers**

A one-tap evacuation drill timer app designed for preppers to practice emergency evacuation scenarios. Combines countdown timers (5/15/30/60 minutes) with pre-loaded task checklists, auto-advancing task management, and optional SMS notifications.

---

## 🎯 Features

### Core Functionality
- **5 Pre-loaded Scenarios**: Immediate Threat (5 min), Routine Drill (15 min), Planned Evacuation (30 min), Family Bug-Out (60 min), Group/MAG Bug-Out (60 min)
- **Accurate Countdown Timer**: Uses Date.now() for drift-free timing (±100ms accuracy)
- **Auto-Advancing Task Checklist**: Tasks appear one at a time as you complete them
- **Progress Tracking**: Visual progress bar and task completion stats
- **Screen Wake Lock**: Prevents device from sleeping during drills
- **Haptic Feedback**: Vibration on task completion
- **Pause/Resume/Abort**: Full drill control options

### Additional Features
- **Drill History**: View all past drills with detailed results
- **SMS Emergency Contacts**: Manage up to 3 emergency contacts
- **SMS Alerts**: Send evacuation alerts (user-initiated, not auto-send)
- **Offline-First**: 100% functional without internet connection
- **No Account Required**: Anonymous usage, all data stored locally
- **Dark Theme**: Easy on the eyes during stressful situations

---

## 📱 Tech Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation (Stack Navigator)
- **Storage**: AsyncStorage (local, offline-first)
- **Haptics**: expo-haptics
- **SMS**: expo-sms
- **Audio**: expo-av
- **Wake Lock**: expo-keep-awake

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Studio (for Android emulator)
- For physical device testing: Expo Go app

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd bug-out-timer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on a device/emulator**:
   - **iOS Simulator** (macOS only):
     ```bash
     npm run ios
     ```
   - **Android Emulator**:
     ```bash
     npm run android
     ```
   - **Physical Device**: Scan the QR code in Expo Go app

---

## 📂 Project Structure

```
bug-out-timer/
├── App.js                     # Main app entry point with navigation
├── app.json                   # Expo configuration
├── package.json               # Dependencies
├── assets/                    # Images, icons, sounds
│   └── sounds/                # Audio files (alarm, task complete)
├── src/
│   ├── scenarios.js           # 5 pre-loaded evacuation scenarios
│   ├── constants.js           # Colors, typography, timing constants
│   ├── screens/
│   │   ├── HomeScreen.js      # Main screen with scenario buttons
│   │   ├── DrillScreen.js     # Active drill with timer and tasks
│   │   ├── DrillCompleteScreen.js  # Results and SMS options
│   │   ├── HistoryScreen.js   # List of past drills
│   │   ├── DrillDetailScreen.js    # Detailed drill results
│   │   └── SettingsScreen.js  # SMS contacts and preferences
│   ├── components/            # Reusable components (future)
│   ├── utils/
│   │   ├── storage.js         # AsyncStorage helpers
│   │   ├── timer.js           # Timer logic and formatting
│   │   └── sms.js             # SMS composition and validation
│   └── styles/
│       └── shared.js          # Shared styles
```

---

## 🎮 Usage

### Running a Drill

1. **Open the app** → See 5 scenario buttons on home screen
2. **Tap any scenario** → Timer starts immediately (no confirmation)
3. **Complete tasks** → Check off each task as you complete it
4. **Timer hits 0:00** → Alarm sounds, red flash, results modal appears
5. **View results** → See time taken, tasks completed, performance
6. **Optional**: Send SMS alert to emergency contacts
7. **Save drill** → Automatically saved to history

### Managing SMS Contacts

1. **Go to Settings** (from home screen)
2. **Tap "Add Contact"**
3. **Enter name and phone number**
4. **Toggle on/off** to enable/disable contacts
5. **Swipe to delete** or long-press to remove contacts

### Viewing History

1. **Tap "History"** on home screen
2. **See all past drills** sorted by date (newest first)
3. **Tap any drill** to see detailed results
4. **Long-press to delete** a drill

---

## 🛠️ Development

### Key Implementation Details

**Timer Accuracy**:
- Uses `Date.now()` for elapsed time calculation
- Updates display every 100ms to check for second changes
- No drift over long durations (±100ms accuracy)

**Offline-First Architecture**:
- All data stored in AsyncStorage
- No network calls required
- Maximum 100 drills stored (FIFO deletion)

**SMS User-Initiated**:
- Opens native SMS composer (expo-sms)
- User manually selects contacts and taps "Send"
- Not auto-send (by design for MVP)

**Screen Wake Lock**:
- Activates on drill start
- Deactivates on drill complete/abort
- Uses expo-keep-awake

### Adding Audio Files

Audio files are currently placeholders. To add actual sound files:

1. Create `assets/sounds/` directory (already exists)
2. Add MP3 files:
   - `alarm.mp3` (3-second siren for drill completion)
   - `task-complete.mp3` (subtle beep for task completion)
   - `drill-start.mp3` (optional start sound)
3. Uncomment audio file imports in `src/constants.js`:
   ```javascript
   export const AUDIO_FILES = {
     alarm: require('../assets/sounds/alarm.mp3'),
     taskComplete: require('../assets/sounds/task-complete.mp3'),
     drillStart: require('../assets/sounds/drill-start.mp3')
   };
   ```

---

## 📦 Building for Production

### iOS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build for iOS
eas build --platform ios

# Or use legacy Expo build
expo build:ios
```

**Requirements**:
- Apple Developer Account ($99/year)
- App Store Connect app listing
- Privacy policy (mention: no data collection, all local storage)

### Android Build

```bash
# Build for Android
eas build --platform android

# Or use legacy Expo build
expo build:android
```

**Requirements**:
- Google Play Developer Account ($25 one-time)
- Play Store app listing
- Privacy policy

### Testing Builds

**iOS**: TestFlight (requires Apple Developer account)
**Android**: Firebase App Distribution or direct APK install

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Timer accuracy over full duration (test 5 min scenario)
- [ ] Task auto-advance works correctly
- [ ] Pause/Resume maintains accurate time
- [ ] Abort drill returns to home
- [ ] Drill complete shows correct stats
- [ ] SMS composer opens with correct contacts
- [ ] Drill saves to history
- [ ] History displays correctly
- [ ] Settings persist after app restart

### Device Testing
- [ ] iOS 12+ (iPhone SE to iPhone 14 Pro Max)
- [ ] Android 6+ (various screen sizes)
- [ ] Tablet support (iPad, Android tablets)

### Performance Testing
- [ ] App launches in < 2 seconds
- [ ] Memory usage < 50MB during drill
- [ ] No memory leaks after multiple drills
- [ ] Smooth animations (60 FPS target)

---

## 🐛 Known Issues / TODO

### MVP Limitations
- Audio files are placeholders (need actual sound files)
- No app icon/splash screen images yet (using defaults)
- SMS is user-initiated only (not auto-send)
- No cloud sync (all data local only)
- No backup/restore functionality

### Future Enhancements
- Custom scenarios (user-created)
- Scenario templates
- Export drill history (CSV/PDF)
- Auto-send SMS option (with explicit user consent)
- Widget support (iOS/Android home screen)
- Apple Watch companion app
- Group drill coordination (multi-device sync)

---

## 📄 License

Proprietary - PrepperCodex
All rights reserved.

---

## 👥 Contact

For issues, feature requests, or contributions:
- **Project**: Bug-Out Timer MVP
- **Organization**: PrepperCodex
- **Build Date**: November 2025

---

## 🎯 Success Criteria (Launch)

- [ ] Approved on iOS App Store and Google Play
- [ ] No crashes in first 100 downloads
- [ ] Average rating ≥ 4.0 stars
- [ ] All 5 scenarios functional and accurate
- [ ] SMS feature working on both platforms

---

## 🔧 Troubleshooting

### Common Issues

**Problem**: Timer not accurate
**Solution**: Ensure device is not in power-saving mode. Timer uses Date.now() for accuracy.

**Problem**: Screen turns off during drill
**Solution**: expo-keep-awake should prevent this. Check device settings for override.

**Problem**: SMS not working
**Solution**: Ensure device has SMS capability. Some tablets don't support SMS.

**Problem**: App crashes on launch
**Solution**: Clear cache: `expo start -c` or reinstall: `npm install && npm start`

**Problem**: Tasks not advancing
**Solution**: Ensure you're tapping the "Complete Task" button, not just the task card.

---

## 📊 Performance Targets (MVP)

| Metric | Target | Actual |
|--------|--------|--------|
| App Launch | < 2s | TBD |
| Timer Accuracy | ±100ms | TBD |
| Memory Usage | < 50MB | TBD |
| APK Size | < 30MB | TBD |
| Battery Drain | < 5%/hour | TBD |
| Storage (100 drills) | < 2MB | TBD |

---

**Built with ❤️ for preppers by preppers**

*Stay ready. Stay safe.*
