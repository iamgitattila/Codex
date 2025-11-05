// Core Types for Burrow Digital Ledger

export type AssetCategory = 'Consumable' | 'Gear' | 'Kit' | 'Document' | 'Information';

export type AssetSubcategory =
  | 'Food' | 'Water' | 'Medicine' | 'Hygiene' | 'Fuel' // Consumables
  | 'Tool' | 'SurvivalGear' | 'Radio' | 'Navigation' | 'Power' | 'Shelter' // Gear
  | 'BOB' | 'BOV' | 'Cache' | 'FirstAid' | 'Repair' | 'Communications' // Kits
  | 'ImportantDoc' | 'Map' | 'Frequency' | 'Contact' | 'Medical' | 'Financial'; // Info

export type RotationStatus = 'Active' | 'Reserve' | 'Expired' | 'Depleted';
export type Condition = 'Sealed' | 'Open' | 'Functional' | 'Damaged' | 'Unknown';
export type LocationType = 'Home' | 'Vehicle' | 'Cache' | 'External';
export type KitType = 'BOB' | 'BOV' | 'Cache' | 'FirstAid' | 'Repair' | 'Communications' | 'Other';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  subcategory?: AssetSubcategory;
  description?: string;
  quantityOwned: number;
  quantityPar?: number;
  unitType: string;
  locationId: string;
  expirationDate?: string; // ISO date string
  dateAcquired?: string;
  lastVerified?: string;
  costUsd?: number;
  sourceUrl?: string;
  barcodeEan?: string;
  photoPath?: string;
  notes?: string;
  condition: Condition;
  rotationStatus: RotationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  locationType: LocationType;
  order: number;
  createdAt: string;
}

export interface Kit {
  id: string;
  name: string;
  description?: string;
  kitType: KitType;
  locationId?: string;
  createdAt: string;
}

export interface KitItem {
  id: string;
  kitId: string;
  assetId: string;
  quantityRequired: number;
  isPacked: boolean;
  lastVerified?: string;
}

export interface ExpirationAlert {
  id: string;
  assetId: string;
  expirationDate: string;
  daysUntilExpiration: number;
  alertSent: boolean;
  alertDate?: string;
  actionTaken?: string;
  actionDate?: string;
}

export interface ShoppingListItem {
  id: string;
  assetId: string;
  currentQuantity: number;
  parQuantity: number;
  quantityToBuy: number;
  priority: Priority;
  sourceUrl?: string;
  estimatedCost?: number;
  createdAt: string;
  completed: boolean;
}

export interface UserSettings {
  expirationAlertDays: number;
  enableNotifications: boolean;
  enableBelowParAlerts: boolean;
  enableDailyReminder: boolean;
  dailyReminderTime: string;
  requirePassword: boolean;
  encryptDatabase: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface DashboardStats {
  totalAssets: number;
  totalValue: number;
  expiringSoon: number;
  belowPar: number;
  locationCount: number;
  kitCount: number;
}

// Navigation Types
export type RootStackParamList = {
  Main: undefined;
  AddItem: { assetId?: string };
  EditItem: { assetId: string };
  ItemDetail: { assetId: string };
  LocationDetail: { locationId: string };
  KitDetail: { kitId: string };
  BarcodeScanner: undefined;
  ShoppingList: undefined;
  ExpirationAlerts: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Search: undefined;
  Locations: undefined;
  Kits: undefined;
  Settings: undefined;
};
