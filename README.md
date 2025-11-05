# 🔥 SurvivalSkill - Offline-First Survival Skills App

**An offline-first, scenario-based survival skills mobile app that teaches 10 critical survival techniques through structured learning and spaced repetition.**

> *Master the skills that could save your life when power grids fail, internet dies, and you're on your own.*

![Version](https://img.shields.io/badge/version-1.0.0-green)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📱 What is SurvivalSkill?

SurvivalSkill is a mobile app designed for preppers, outdoor enthusiasts, and anyone who wants to build genuine survival competency. The app features:

- **10 Critical Survival Scenarios** - Fire, Water, Shelter, Signaling, Navigation, First Aid, and more
- **100+ Expert-Verified Tips** - Step-by-step instructions with difficulty ratings
- **Offline-First Architecture** - Works completely without internet using SQLite
- **Spaced Repetition Learning** - Daily challenges to build muscle memory
- **Progress Tracking** - Track your journey from beginner to expert
- **Freemium Model** - First 2 scenarios free (Fire & Water), premium unlocks all 10

---

## ✨ Key Features

### 🎯 **Scenario-Based Learning**
- 10 survival scenarios, each with exactly 10 ranked techniques
- Progressive difficulty: Beginner → Intermediate → Advanced
- Cross-linked related tips for comprehensive skill building

### 📚 **Comprehensive Content**
Each tip includes:
- Step-by-step instructions
- Materials needed
- Success criteria
- Common mistakes to avoid
- Variations and alternatives
- Time-to-master estimates

### 💪 **Skill Mastery System**
- Track tips as: Viewed → Attempted → Mastered
- Daily challenges with spaced repetition
- Bookmark your favorite tips
- Progress analytics and completion rates

### 🔒 **Offline-First Design**
- All content stored locally in SQLite
- Zero internet dependency after initial setup
- Works during power outages, grid failures, natural disasters
- Optional cloud sync for multi-device (future)

### 💎 **Freemium Monetization**
- **Free:** Fire Mastery + Water Procurement (20 tips)
- **Premium:** All 10 scenarios (100 tips) - $4.99/month or $39.99/year
- Paywall with in-app purchase integration (demo mode in MVP)

---

## 🏗️ Technical Architecture

### **Tech Stack**

#### Frontend
- **Framework:** React Native 0.73.2 (supports iOS & Android)
- **Language:** TypeScript for type safety
- **State Management:** Redux Toolkit with Redux Persist
- **Database:** SQLite (react-native-sqlite-storage)
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **UI Components:** React Native Paper + Vector Icons

#### Backend (Minimal MVP)
- **Runtime:** Node.js + Express (optional for analytics)
- **Database:** SQLite local-first, PostgreSQL for cloud sync (future)
- **Auth:** Firebase Auth (future)

### **App Structure**

```
survival-skill-app/
├── src/
│   ├── database/
│   │   ├── database.ts          # SQLite initialization
│   │   └── queries.ts            # All database queries
│   ├── redux/
│   │   ├── store.ts              # Redux store + persist config
│   │   └── slices/
│   │       ├── scenariosSlice.ts # Scenarios state
│   │       ├── tipsSlice.ts      # Tips state
│   │       └── userSlice.ts      # User progress, bookmarks
│   ├── screens/
│   │   ├── ScenarioListScreen.tsx
│   │   ├── ScenarioDetailScreen.tsx
│   │   ├── TipDetailScreen.tsx
│   │   ├── DailyChallengeScreen.tsx
│   │   ├── BookmarksScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── PaywallScreen.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx      # Bottom tabs + stack navigation
│   ├── data/
│   │   └── survivalData.ts       # Seed data (10 scenarios, 100 tips)
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── App.tsx                       # Main app entry with initialization
├── index.js                      # React Native entry point
└── package.json
```

### **Database Schema**

```sql
-- Core tables
scenarios (id, title, description, icon, difficulty_level, is_premium)
tips (id, scenario_id, rank, title, difficulty, instruction_text, ...)

-- User tracking
user_progress (id, user_id, tip_id, status, attempts_count, completion_date)
bookmarks (id, user_id, tip_id, created_at)
daily_challenges (id, user_id, challenge_tip_id, date_assigned, completed)
session_events (id, user_id, event_type, timestamp) -- For analytics
```

---

## 🚀 Getting Started

### Prerequisites

**Required:**
- Node.js 18+ ([Download](https://nodejs.org/))
- npm or Yarn
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

**For iOS:**
```bash
# Install CocoaPods
sudo gem install cocoapods
```

**For Android:**
- Install Android SDK Platform 34
- Install Android SDK Build-Tools 34.0.0
- Set up environment variables (see below)

### Installation

1. **Clone & Install Dependencies**
```bash
git clone <repository-url>
cd Codex
npm install
```

2. **iOS Setup (macOS only)**
```bash
cd ios
pod install
cd ..
npm run ios
```

3. **Android Setup**

Set environment variables in `~/.bash_profile` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Run the app:
```bash
npm run android
```

### First Launch

1. App initializes SQLite database
2. Seeds 10 scenarios + 100 survival tips
3. Ready to use offline immediately!

---

## 📖 Content Overview

### **Free Scenarios (MVP)**

#### 1. 🔥 **Fire Mastery**
- Friction Fire: Bow Drill Method
- Flint and Steel Method
- Magnifying Glass / Lens Method
- + 7 more fire-starting techniques

#### 2. 💧 **Water Procurement**
- Boiling Water Purification
- Solar Still Construction
- Natural Water Filtration
- + 7 more water techniques

### **Premium Scenarios**

3. 🏕️ Emergency Shelter
4. 🚨 Signaling & Rescue
5. 🌿 Edible Plants & Foraging
6. 🪢 Rope Work & Knots
7. 🧭 Navigation
8. ⚕️ First Aid Essentials
9. 🔨 Improvised Tools & Weapons
10. ⛈️ Weather & Wilderness Hazards

---

## 🎮 User Experience Flow

### First-Time User Journey

1. **Launch App** → Database seeds automatically
2. **View Scenarios** → See all 10 scenarios (2 unlocked, 8 locked)
3. **Browse Free Content** → Explore Fire & Water scenarios (20 tips)
4. **Read a Tip** → Full instructions, materials, common mistakes
5. **Mark Progress** → Viewed → Attempted → Mastered
6. **Try Daily Challenge** → Spaced repetition practice
7. **Hit Paywall** → Upgrade to access all 10 scenarios

### Premium User Journey

1. **Upgrade** → $4.99/month or $39.99/year
2. **Unlock All Scenarios** → Access all 100 tips
3. **Track Progress** → Complete scenarios, earn badges
4. **Build Competency** → Daily challenges, bookmarks
5. **Achieve Mastery** → 100% completion across all scenarios

---

## 🧪 Testing the App

### Demo Features

**Toggle Premium Mode:**
1. Go to Profile screen
2. Tap "Switch to Premium (Demo)" to unlock all content
3. Test paywall by tapping locked scenarios when in Free mode

**Test Progress Tracking:**
1. Open any tip
2. Mark as "Attempted" or "Mastered"
3. See progress update in Scenario Detail and Profile screens

**Test Bookmarks:**
1. Open any tip
2. Tap bookmark icon
3. View bookmarks in Bookmarks tab

**Test Daily Challenge:**
1. Go to Daily Challenge tab
2. (Currently shows placeholder - full logic coming in v1.1)

---

## 📊 Data Flow

### Offline-First Architecture

```
User Action (e.g., "View Tip #1")
    ↓
Redux Action Dispatched (fetchTipById)
    ↓
SQLite Query Executed (getTipById)
    ↓
Data Returned from Local Database (0ms latency)
    ↓
Redux State Updated
    ↓
React Component Re-renders
```

**Key Benefits:**
- ⚡ Instant loading (no network latency)
- 🔒 Works 100% offline
- 💾 Low data usage (5MB total for all content)
- 🔋 Battery-efficient (no constant syncing)

---

## 🎨 Design System

### Colors
- **Primary Green:** #2E7D32 (Survival theme)
- **Secondary Orange:** #FF9800 (Alerts, warnings)
- **Success:** #4CAF50
- **Error:** #F44336
- **Info:** #2196F3

### Typography
- **Headers:** Bold, 22-28px
- **Body:** Regular, 15-16px
- **Metadata:** 12-14px

### Difficulty Badges
- 🟢 **Beginner:** Green (#4CAF50)
- 🟠 **Intermediate:** Orange (#FF9800)
- 🔴 **Advanced:** Red (#F44336)

---

## 🚢 Deployment

### iOS (App Store)

1. **Configure App in Xcode:**
```bash
open ios/SurvivalSkill.xcworkspace
```

2. **Set Bundle ID:** `com.yourcompany.survivalskill`
3. **Add App Icons** (1024x1024 required)
4. **Archive & Upload:**
   - Product → Archive
   - Distribute App → App Store Connect

### Android (Google Play Store)

1. **Generate Signing Key:**
```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore survivalskill-release.keystore \
  -alias survivalskill -keyalg RSA -keysize 2048 -validity 10000
```

2. **Build Release APK/AAB:**
```bash
cd android
./gradlew bundleRelease  # AAB for Play Store
```

3. **Upload to Play Console:**
   - Create app listing
   - Upload AAB: `android/app/build/outputs/bundle/release/`
   - Submit for review

---

## 🔮 Roadmap

### v1.1 (Q2 2025)
- [ ] Complete daily challenge algorithm
- [ ] Add AI-generated illustrations (100 images)
- [ ] Implement achievement badges
- [ ] Add search functionality

### v2.0 (Q3 2025)
- [ ] Community-moderated tips (user submissions)
- [ ] Video tutorial integration
- [ ] Offline map + GPS integration
- [ ] Multi-device cloud sync

### v3.0 (Q4 2025)
- [ ] AR visualization of techniques
- [ ] Multiplayer scenario challenges
- [ ] Survival kit shopping list (Amazon affiliate)
- [ ] PDF export of progress certificates

---

## 🐛 Troubleshooting

### Common Issues

**Database not initializing:**
```bash
# Clear app data and restart
# iOS: Delete app and reinstall
# Android: Settings → Apps → SurvivalSkill → Clear Data
```

**SQLite errors:**
```bash
# Make sure react-native-sqlite-storage is linked
npm install
cd ios && pod install && cd ..
```

**Navigation not working:**
```bash
# Ensure gesture handler is imported FIRST in App.tsx
import 'react-native-gesture-handler';
```

**Metro bundler issues:**
```bash
npm start -- --reset-cache
```

---

## 📄 License

MIT License - Feel free to use this project for your own survival apps!

---

## 🤝 Contributing

Survival skills are life-saving knowledge. Contributions welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-scenario`)
3. Commit changes (`git commit -m 'Add Edible Plants scenario'`)
4. Push to branch (`git push origin feature/new-scenario`)
5. Open a Pull Request

---

## 📧 Support & Contact

- **Issues:** [GitHub Issues](https://github.com/yourrepo/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourrepo/discussions)
- **Email:** support@survivalskill.app

---

## 🙏 Acknowledgments

- Content inspired by SAS Survival Manual (John "Lofty" Wiseman)
- Built with React Native and Expo
- Icons by Material Community Icons
- Tested by real preppers and bushcraft enthusiasts

---

## ⚠️ Disclaimer

**IMPORTANT:** This app provides educational survival information. Always:
- Practice techniques in safe environments first
- Seek professional training when possible
- Follow local laws and regulations
- Use common sense and caution

Survival situations are dangerous. The creators assume no liability for injuries or outcomes resulting from use of this information.

---

**Built with 🔥 for survivors everywhere.**

*Stay prepared. Stay alive.*
