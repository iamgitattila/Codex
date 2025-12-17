import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Root Stack Navigator
export type RootStackParamList = {
  MainTabs: undefined;
  AddItem: { assetId?: string } | undefined;
  EditItem: { assetId: string };
  ScanBarcode: undefined;
  LocationDetail: { locationId: string };
  KitDetail: { kitId: string };
  ExportData: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Dashboard: undefined;
  Inventory: undefined;
  Locations: undefined;
  Kits: undefined;
  More: undefined;
};

// Navigation prop types
export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;

// Route prop types
export type AddItemRouteProp = RouteProp<RootStackParamList, 'AddItem'>;
export type EditItemRouteProp = RouteProp<RootStackParamList, 'EditItem'>;
export type LocationDetailRouteProp = RouteProp<RootStackParamList, 'LocationDetail'>;
export type KitDetailRouteProp = RouteProp<RootStackParamList, 'KitDetail'>;
