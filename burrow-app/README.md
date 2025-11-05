# Burrow: The Digital Ledger

**Tagline:** "Know what you own. Track what expires. Stay prepared."

A cross-platform mobile application for preppers to manage their survival inventory offline. Part of the PrepperCodex ecosystem (Pillar 4).

## Features

### MVP (Version 1.0)

- **Comprehensive Asset Tracking**
  - Track all survival assets across 5 categories: Consumables, Gear, Kits, Documents, Information
  - Add items via manual entry or barcode scanning
  - Organize by location (Pantry, Garage, Vehicle, Cache, etc.)
  - Track quantities, par levels, and expiration dates

- **Smart Inventory Management**
  - Expiration alerts (30-day warning)
  - Par level tracking (minimum quantity alerts)
  - FIFO rotation discipline
  - Auto-generated shopping lists for items below par

- **Offline-First Design**
  - 100% local SQLite database
  - No cloud dependency
  - Zero OPSEC vulnerability
  - Works without internet

- **Specialized Kits**
  - Bug-Out Bags (BOB)
  - Bug-Out Vehicles (BOV)
  - Caches
  - First Aid Kits
  - Specialized equipment kits

- **Export & Backup**
  - PDF export for emergency hardcopy
  - CSV export for spreadsheet analysis
  - Print and laminate for SHTF scenarios

## Tech Stack

- **Frontend:** React Native (Expo)
- **Database:** SQLite (expo-sqlite)
- **State Management:** Redux Toolkit + Redux Persist
- **UI Framework:** React Native Paper
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **Barcode Scanning:** Expo Barcode Scanner
- **Date Handling:** date-fns

## Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Studio (for Android emulator)

### Setup

1. **Clone the repository**
   ```bash
   cd burrow-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run on iOS or Android**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## Project Structure

```
burrow-app/
├── App.tsx                 # Main entry point
├── src/
│   ├── components/         # Reusable components
│   ├── database/           # SQLite database
│   │   ├── index.ts        # Database initialization
│   │   ├── schema.ts       # Database schema
│   │   ├── seedData.ts     # Sample data
│   │   └── services/       # Database services (CRUD)
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # App screens
│   │   ├── DashboardScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── AddEditItemScreen.tsx
│   │   ├── LocationsScreen.tsx
│   │   ├── KitsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── ...
│   ├── store/              # Redux store
│   │   ├── index.ts
│   │   └── slices/
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── assets/                 # Images, fonts, etc.
├── package.json
├── tsconfig.json
└── app.json
```

## Database Schema

### Core Tables

- **assets** - All inventory items
- **locations** - Storage locations (Pantry, Garage, etc.)
- **kits** - Specialized kits (BOB, BOV, Cache, etc.)
- **kit_items** - Items in each kit
- **shopping_list** - Auto-generated shopping list
- **expiration_alerts** - Expiration tracking
- **user_settings** - App preferences

### Asset Categories

1. **Consumables:** Food, Water, Medicine, Hygiene, Fuel
2. **Tools & Gear:** General tools, survival gear, radios, navigation, power, shelter
3. **Specialized Kits:** BOBs, BOVs, Caches, First Aid, Repair, Communications
4. **Critical Information:** Documents, maps, frequencies, contacts
5. **Locations:** Home, Vehicle, Cache, External

## Usage

### Adding Items

1. Tap the **"Add Item"** FAB button
2. Scan barcode OR enter manually
3. Fill in:
   - Name, Category, Description
   - Quantity owned & Par level
   - Location
   - Expiration date (if applicable)
   - Cost, Source, Notes
4. Save

### Tracking Expiration

- Dashboard shows items expiring in next 30 days
- Color-coded alerts:
  - 🔴 Red: < 7 days
  - 🟠 Orange: 7-14 days
  - 🟡 Yellow: 15-30 days

### Managing Par Levels

- Set minimum quantity for each item
- Auto-alerts when below par
- Generate shopping list from gaps

### Organizing Kits

1. Create kit (BOB, BOV, Cache, etc.)
2. Add items to kit
3. Track packed status
4. Verify readiness

## Roadmap

### Version 2.0 (Planned)
- Optional encrypted cloud backup
- Private family sharing
- Photo attachments to assets
- Consumption tracking
- Price trend analysis
- Integration with PrepperCodex Pillars 1-5

### Version 3.0 (Planned)
- MAG/Group licensing
- Role-based access control
- Audit logging
- Web dashboard
- Advanced analytics

## Architecture Decisions

### Why Offline-First?

Preppers documenting their survival inventory face a critical OPSEC vulnerability with cloud-based solutions:

- **Cloud = Target:** Your inventory is essentially a treasure map for bad actors
- **No Network Dependency:** Works in emergencies when internet is unavailable
- **Privacy First:** Your data never leaves your device
- **No Server Costs:** Sustainable free tier without backend infrastructure

### Why React Native?

- **Cross-platform:** Single codebase for iOS & Android
- **Mature Ecosystem:** Robust libraries for barcode scanning, PDF export, SQLite
- **Performance:** Native performance with JavaScript productivity
- **Community:** Large community, extensive documentation

## Contributing

This is an open-source project. Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

- **Issues:** https://github.com/PrepperCodex/burrow-app/issues
- **Documentation:** https://preppercodex.com/burrow
- **Community:** Reddit /r/preppers

## Acknowledgments

- Part of the **PrepperCodex** ecosystem
- **Pillar 4:** The Digital Ledger
- Inspired by the prepper community's need for offline-first inventory management

---

**Burrow: The Digital Ledger**
*Know what you own. Track what expires. Stay prepared.*

PrepperCodex | Pillar 4
