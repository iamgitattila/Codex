# ⛽ Fuel Tracker (Jerry Can Edition)

**Tagline:** "Bad gas kills generators. Track your fuel."

A hyper-focused fuel inventory management app designed for preppers who stockpile stabilized gasoline/diesel in jerry cans. Track each can's purchase date, rotation schedule, usage history, and expiration warnings to prevent running bad gas in critical equipment.

**By PrepperCodex** | MVP Version 1.0.0

---

## 🎯 Core Value Proposition

Fuel degrades over time even with stabilizer (12-24 months shelf life). This app prevents $500+ generator damage by:

- ✅ **Auto-calculating expiration dates** based on fuel type and stabilizer
- ✅ **FIFO queue management** - always know which can to use first
- ✅ **Expiration alerts** - 30-day and 7-day warnings before fuel goes bad
- ✅ **One-tap usage logging** - track consumption in seconds
- ✅ **Offline-first** - no internet required, all data stored locally

---

## 🚀 Features

### Core Features (MVP)
- ✅ Add fuel cans (size, type, purchase date, stabilizer, location)
- ✅ Automatic expiration calculation
- ✅ Visual status indicators (green/yellow/red/black)
- ✅ FIFO rotation queue (oldest first)
- ✅ Quick fuel usage logging
- ✅ Can detail view with usage history
- ✅ Total inventory tracking
- ✅ Alert system for approaching expiration
- ✅ Local push notifications
- ✅ Usage history by month
- ✅ Settings and preferences

### Supported Fuel Types
- **Gasoline (87 Octane)** - 6 months without stabilizer, 12 months with
- **Diesel** - 12 months without stabilizer, 24 months with
- **Ethanol-Free Gas** - 12 months without stabilizer, 24 months with
- **Kerosene** - 24+ months (very stable)

---

## 📱 Screenshots

### Home Dashboard
- Total fuel inventory
- Active alerts
- FIFO queue (use first)
- All cans list with status colors

### Add Can
- Quick size selection (1, 2, 5, 10, 20 gal)
- Fuel type picker
- Stabilizer toggle
- Storage location
- Auto-calculated expiration date

### Use Fuel
- Quick amount buttons (0.5, 1, 2, 5 gal)
- Equipment selection
- Purpose tracking
- Notes

### Can Detail
- Full can information
- Usage history timeline
- Status indicators
- Actions (use fuel, delete)

---

## 🛠️ Tech Stack

- **Framework:** React Native (Expo)
- **Navigation:** React Navigation
- **Storage:** AsyncStorage (offline-first)
- **Notifications:** Expo Notifications
- **Date Handling:** date-fns
- **UI:** Custom components with color-coded status system

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Install Dependencies
```bash
npm install
```

### Run the App

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Web (for testing)
```bash
npm run web
```

### Development with Expo Go
```bash
npm start
```
Scan the QR code with Expo Go app on your phone.

---

## 📂 Project Structure

```
fuel-tracker/
├── App.js                      # Main app entry
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── AlertBanner.js
│   │   ├── CanListItem.js
│   │   └── CanPreview.js
│   ├── constants/              # App constants
│   │   └── fuelData.js         # Fuel shelf life data
│   ├── navigation/             # Navigation setup
│   │   └── AppNavigator.js
│   ├── screens/                # App screens
│   │   ├── AddCanScreen.js
│   │   ├── CanDetailScreen.js
│   │   ├── HistoryScreen.js
│   │   ├── HomeScreen.js
│   │   ├── SettingsScreen.js
│   │   └── UseFuelScreen.js
│   ├── services/               # Data services
│   │   ├── notifications.js    # Push notifications
│   │   └── storage.js          # AsyncStorage wrapper
│   ├── styles/                 # Global styles
│   │   └── globalStyles.js
│   ├── types/                  # Type definitions
│   │   └── index.js
│   └── utils/                  # Utility functions
│       └── fuelCalculations.js # Expiration logic
└── assets/                     # Images, fonts
```

---

## 🎨 Color-Coded Status System

| Status | Color | Days Remaining | Action |
|--------|-------|----------------|--------|
| **Good** | 🟢 Green | 30+ days | No action needed |
| **Approaching** | 🟡 Yellow | 7-29 days | Plan to use soon |
| **Urgent** | 🔴 Red | 0-6 days | USE NOW |
| **Expired** | ⚫ Black | Negative | BAD FUEL - DISPOSE |

---

## 📊 Data Model

### Fuel Can
```javascript
{
  can_id: string,
  size_gallons: number,
  fuel_type: 'gasoline' | 'diesel' | 'ethanol-free' | 'kerosene',
  purchase_date: ISO date string,
  stabilizer_used: boolean,
  expiration_date: ISO date string (auto-calculated),
  current_contents_gallons: number,
  storage_location: string,
  condition: 'sealed' | 'open' | 'low' | 'empty',
  equipment_use: string,
  created_at: ISO date string,
  notes: string
}
```

### Usage Entry
```javascript
{
  usage_id: string,
  can_id: string,
  gallons_used: number,
  timestamp: ISO date string,
  equipment: string,
  purpose: string,
  notes: string
}
```

---

## 🔔 Notifications

The app schedules local notifications for:

- **Approaching expiration** (30 days out)
- **Urgent expiration** (7 days out)
- **Expired fuel** (immediate alert)
- **Daily check reminder** (optional, 9 AM)

Notifications require permission on first launch.

---

## ⚙️ Settings

- **Alert Threshold** - When to show alerts (7, 14, 30, 60, 90 days)
- **Default Fuel Type** - Pre-select fuel type for new cans
- **Default Stabilizer** - Pre-select stabilizer setting
- **Notifications** - Enable/disable push notifications

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Add a fuel can
- [ ] View can in home dashboard
- [ ] Check FIFO queue displays oldest can first
- [ ] Log fuel usage
- [ ] View can detail and usage history
- [ ] Check color coding (green/yellow/red/black)
- [ ] View usage history screen
- [ ] Test settings changes
- [ ] Test notifications (simulate expiring can)
- [ ] Delete a can

### Test Data
To test with cans approaching expiration, manually edit AsyncStorage data or use cans with short shelf life.

---

## 🗺️ Roadmap

### Version 1.0 (MVP) - Current ✅
- Core fuel tracking
- Expiration alerts
- FIFO queue
- Usage logging
- Local storage

### Version 2.0 (Planned)
- Cloud backup (optional, encrypted)
- PDF export for documentation
- Advanced analytics (consumption trends)
- Multi-can bulk operations
- Equipment association improvements

### Version 3.0 (Future)
- Family accounts (multi-user)
- GPS location mapping for caches
- Integration with other PrepperCodex apps
- Supplier price tracking
- Web dashboard

---

## 🤝 Contributing

This is an MVP project for PrepperCodex. Feature requests and bug reports are welcome!

---

## 📝 License

Copyright © 2025 PrepperCodex. All rights reserved.

---

## 📞 Support

For issues or questions about Fuel Tracker:
- GitHub Issues: [Create an issue](https://github.com/iamgitattila/Codex/issues)
- PrepperCodex Community: [Join the discussion](#)

---

## 🎯 Why This App Exists

**Real-world failure scenario:**
```
Power outage → Grab generator → Fill with "oldest" can (actually 3 years old)
→ Generator runs 2 minutes → Carburetor clogged → $500 repair
→ No power for 3+ days → Confidence in prep destroyed
```

**With Fuel Tracker:**
```
App alerts → "Can #2: Use by Nov 15" → Use oldest fuel first
→ Generator starts perfectly → Power restored → Prep validated
```

**One bad fill-up ruins engines. This app prevents that.**

---

## 🔥 Key Innovation

**First app designed specifically for jerry can fuel rotation.**

- Generic inventory apps don't understand fuel degradation
- Spreadsheets require manual updates and don't alert
- This is the ONLY app that prevents generator failure from bad fuel

**Target users:**
- Preppers with generators
- Homesteaders with gas-powered equipment
- Rural property owners
- MAG coordinators managing shared fuel caches

---

**Built with ❤️ for the preparedness community**