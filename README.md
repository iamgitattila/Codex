# Survival First Aid App

**by PrepperCodex**

*"Medical skills for when professionals can't reach you"*

---

## 📱 Overview

Survival First Aid is a free, offline-first first aid reference app specifically designed for **prepper communities, off-grid residents, and remote outdoor enthusiasts**. Unlike generic Red Cross apps designed for training certification, this app is built for **SHTF (Shit Hits The Fan) scenarios** where 911 isn't available.

### Key Features

- ✅ **12 Critical Emergency Protocols** - Step-by-step medical response procedures
- ✅ **100% Offline Access** - Works without internet connection
- ✅ **Video Demonstrations** - Visual learning for each protocol
- ✅ **Knowledge Quizzes** - Test and retain your medical knowledge
- ✅ **Medical Kit Tracker** - Track your emergency supplies inventory
- ✅ **Triage Mode** - Quick emergency protocol access
- ✅ **Bookmarks** - Save important protocols for quick reference
- ✅ **Progress Tracking** - Monitor your learning and mastery

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Codex
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on a platform:**
   - iOS: `npm run ios` (Mac only)
   - Android: `npm run android`
   - Web: `npm run web`

---

## 📂 Project Structure

```
survival-first-aid/
├── App.tsx                          # Main app entry point
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx        # Main navigation setup
│   ├── screens/
│   │   ├── ProtocolListScreen.tsx  # Home screen with protocol list
│   │   ├── ProtocolDetailScreen.tsx # Detailed protocol view
│   │   ├── VideoPlayerScreen.tsx   # Video demonstrations
│   │   ├── QuizScreen.tsx          # Knowledge quiz system
│   │   ├── KitTrackerScreen.tsx    # Medical kit inventory
│   │   ├── TriageModeScreen.tsx    # Emergency triage mode
│   │   └── BookmarksScreen.tsx     # Saved protocols
│   ├── redux/
│   │   ├── store.ts                # Redux store configuration
│   │   ├── hooks.ts                # Typed Redux hooks
│   │   └── slices/
│   │       ├── protocolsSlice.ts   # Protocols state
│   │       ├── userProgressSlice.ts # User progress tracking
│   │       ├── kitInventorySlice.ts # Kit inventory state
│   │       └── quizSlice.ts        # Quiz state management
│   ├── constants/
│   │   └── protocols.ts            # Medical protocol data
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── theme/
│   │   └── theme.ts                # App theme configuration
│   └── assets/
│       ├── images/                 # Protocol images
│       └── videos/                 # Video demonstrations
└── README.md
```

---

## 🏥 The 12 Core Protocols

### Critical (RED)
1. **Severe Bleeding & Hemorrhage Control** - Tourniquet application, wound packing
2. **CPR & Airway Management** - Life-saving cardiopulmonary resuscitation

### Important (YELLOW)
3. **Fractures & Immobilization** - Splinting and bone stabilization
4. **Burns (Minor to Severe)** - Assessment and treatment by degree
5-12. Additional protocols to be added

---

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Screen navigation
- **React Native Paper** - Material Design UI components
- **Redux Toolkit** - State management
- **Redux Persist** - Offline data persistence
- **Expo AV** - Video playback

---

## 🔒 Legal & Safety

**IMPORTANT DISCLAIMER:**

This app provides **educational reference material only**. It is NOT a substitute for professional medical training or care.

- ☎️ Call emergency services (911) when available
- 🏥 Seek professional medical care when possible
- 📚 Use these protocols only when professional help is unavailable

---

## 📄 License

This project is licensed under the MIT License.

---

*Built with ❤️ by PrepperCodex*