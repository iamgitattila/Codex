# Morse Blinker

**By PrepperCodex**

> Signal without sound. Communicate across miles.

An offline-first Morse code transmission app that converts typed messages into visible light patterns via the phone's LED flash, or vibration patterns for silent communication.

## Overview

Morse Blinker is designed for preppers practicing long-distance emergency signaling, families learning Morse code together, and SHTF scenarios where radio is unavailable but line-of-sight communication is possible.

**Key Features:**
- 💡 LED Flash Transmission - Use your phone's flashlight to send Morse signals
- 📳 Vibration Mode - Silent communication alternative
- 🆘 5 Pre-saved Emergency Signals (SOS, ALL CLEAR, NEED WATER, etc.)
- ✏️ Custom Message Encoding
- 🎯 Practice Mode - Learn to decode Morse signals
- 📊 Transmission History
- ⚙️ Adjustable Speed (5-40 WPM)
- 🔒 Completely Offline - No backend, no accounts required

## Technical Stack

- **Framework:** React Native with Expo
- **Navigation:** React Navigation (Native Stack)
- **Storage:** AsyncStorage (local-only)
- **LED Control:** expo-camera (flashlight/torch mode)
- **Haptics:** expo-haptics (vibration patterns)
- **State Management:** React Context API

## Project Structure

```
morse-blinker/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js           # Main entry - quick signals
│   │   ├── EncoderScreen.js        # Create custom messages
│   │   ├── TransmissionScreen.js   # LED/vibration transmission
│   │   ├── PracticeScreen.js       # Decode practice drills
│   │   ├── HistoryScreen.js        # Past transmissions
│   │   └── SettingsScreen.js       # App configuration
│   ├── components/
│   │   ├── SignalButton.js         # Pre-saved signal buttons
│   │   └── MessageButton.js        # Custom message buttons
│   ├── utils/
│   │   └── morseEncoder.js         # Morse encoding logic
│   ├── constants/
│   │   └── preSavedSignals.js      # Emergency signals
│   └── services/
│       └── storage.js              # AsyncStorage wrapper
├── App.js                          # Navigation setup
└── app.json                        # Expo configuration

```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (optional, for easier development)
- iOS Simulator (Mac) or Android Emulator

### Install Dependencies

```bash
npm install
```

### Run the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Web (limited functionality - no LED/vibration):**
```bash
npm run web
```

**Using Expo Go:**
```bash
npx expo start
```

Then scan the QR code with Expo Go app on your phone.

## How It Works

### Morse Code Encoding

The app uses standard International Morse Code:
- **Dot (·)**: Short signal (60ms at 20 WPM)
- **Dash (−)**: Long signal (180ms, 3× dot)
- **Element spacing**: 60ms between dots/dashes
- **Letter spacing**: 180ms between letters
- **Word spacing**: 420ms between words

### Timing Calculation

Speed is measured in WPM (Words Per Minute) using the PARIS standard:
- 1 word = 50 dot durations
- At 20 WPM: 1000 dots/min = 60ms per dot

### LED Flash Control

- **iOS**: Uses `expo-camera` with `setFlashModeAsync()`
- **Android**: Uses `react-native-camera` torch mode
- **Timing precision**: JavaScript `setTimeout()` with async/await

### Data Storage

All data is stored locally using AsyncStorage:
- Custom messages
- Transmission history (last 50)
- User settings (WPM, mode, etc.)

## Pre-Saved Emergency Signals

1. **SOS** - Universal distress signal (... --- ...)
2. **ALL CLEAR** - Situation stable
3. **NEED WATER** - Hydration emergency
4. **UNDER ATTACK** - Security threat
5. **RALLY POINT ALPHA** - Meet at rendezvous point

## Features Breakdown

### Home Screen
- Quick access to 5 pre-saved signals
- Custom message list
- Navigation to encoder, practice, history, settings

### Message Encoder
- Text-to-Morse conversion (real-time)
- WPM speed selector (5-40 WPM)
- Duration calculator
- Save custom messages
- Preview transmission

### Transmission Screen
- Large visual indicator (dot/dash animation)
- Progress bar
- Real-time LED flash control
- Haptic vibration sync
- Save to history

### Practice Mode
- Random signal generation
- Flash/vibration playback
- User guess input
- Score tracking
- Hint system

### History Screen
- Past transmission log
- Message, Morse, timestamp
- WPM and duration info
- Clear history option

### Settings Screen
- Transmission mode (LED/Vibration/Both)
- Default WPM speed
- Audio (coming in v2.0)
- Reset settings
- Clear all data

## Development Notes

### Permissions Required

**iOS:**
- Camera access (for flashlight)

**Android:**
- CAMERA
- FLASHLIGHT
- VIBRATE

### Known Limitations

1. **LED timing precision**: Limited by JavaScript event loop (±5-10ms variance)
2. **Camera permission**: Required even though camera preview isn't used
3. **Background mode**: Flash doesn't work when app is backgrounded
4. **Web version**: No LED/vibration support (browser limitation)

### Future Enhancements (v2.0+)

- [ ] Audio Morse output (beep tones)
- [ ] Advanced practice drills
- [ ] Accuracy metrics
- [ ] Cloud backup (optional, encrypted)
- [ ] Community signal sharing
- [ ] Real-time peer-to-peer messaging
- [ ] Integration with other PrepperCodex apps

## Testing

### Manual Testing Checklist

- [ ] Install on iOS device
- [ ] Install on Android device
- [ ] Grant camera permissions
- [ ] Test all 5 pre-saved signals
- [ ] Create custom message
- [ ] Transmit with LED flash
- [ ] Transmit with vibration
- [ ] Test practice mode
- [ ] View transmission history
- [ ] Change WPM settings
- [ ] Test in dark environment (LED visibility)
- [ ] Test across distance (outdoor)

### Morse Code Accuracy Test

Use an online Morse decoder or ham radio operator to verify transmitted patterns match expected Morse code.

## License

This project is part of the PrepperCodex suite of emergency preparedness tools.

## Support & Feedback

For issues, feature requests, or feedback:
- GitHub Issues: https://github.com/preppercodex/morse-blinker/issues
- Email: support@preppercodex.com

## Credits

**Developed by:** PrepperCodex Team
**Technical Spec:** Senior TPM
**Version:** 1.0.0 (MVP)
**Release Date:** November 2025

---

**Remember:** Practice makes perfect. Regular Morse code drills ensure you're ready when communication matters most.

**Stay prepared. Stay connected.**
