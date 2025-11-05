// Type definitions for Burrow: The Digital Ledger

export type AssetCategory = 'Consumable' | 'Gear' | 'Document' | 'Information' | 'Kit';

export type AssetSubcategory =
  | 'Food'
  | 'Water'
  | 'Medicine'
  | 'Hygiene'
  | 'Fuel'
  | 'General Tool'
  | 'Survival Gear'
  | 'Pillar 1 (Listen)'
  | 'Pillar 2 (Map)'
  | 'Pillar 3 (Library)'
  | 'Pillar 5 (Whetstone)'
  | 'Water System'
  | 'Power System'
  | 'Shelter'
  | 'Important Document'
  | 'Map'
  | 'Radio Frequency'
  | 'Contact'
  | 'Medical Record'
  | 'Financial Record'
  | 'Other';

export type RotationStatus = 'Active' | 'Reserve' | 'Expired' | 'Depleted';
export type Condition = 'Sealed' | 'Open' | 'Functional' | 'Damaged';
export type LocationType = 'Home' | 'Vehicle' | 'Cache' | 'External';
export type KitType = 'BOB' | 'BOV' | 'Cache' | 'FirstAid' | 'Repair' | 'Communications' | 'Other';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertAction = 'Rotated' | 'Donated' | 'Discarded' | 'Replaced' | null;

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  subcategory?: AssetSubcategory;
  description?: string;
  quantity_owned: number;
  quantity_par?: number;
  unit_type?: string;
  location_id: string;
  expiration_date?: string; // ISO date string
  date_acquired?: string;
  last_verified?: string;
  cost_usd?: number;
  source_url?: string;
  barcode_ean?: string;
  photo_path?: string;
  notes?: string;
  condition?: Condition;
  rotation_status: RotationStatus;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  location_type: LocationType;
  order: number;
  created_at: string;
}

export interface Kit {
  id: string;
  name: string;
  description?: string;
  kit_type: KitType;
  location_id?: string;
  created_at: string;
}

export interface KitItem {
  id: string;
  kit_id: string;
  asset_id: string;
  quantity_required: number;
  is_packed: boolean;
  last_verified?: string;
}

export interface ExpirationAlert {
  id: string;
  asset_id: string;
  expiration_date: string;
  days_until_expiration: number;
  alert_sent: boolean;
  alert_date?: string;
  action_taken?: AlertAction;
  action_date?: string;
}

export interface ShoppingListItem {
  id: string;
  asset_id: string;
  current_quantity: number;
  par_quantity: number;
  quantity_to_buy: number;
  priority: Priority;
  source_url?: string;
  estimated_cost?: number;
  created_at: string;
  completed: boolean;
}

export interface UserSetting {
  setting_key: string;
  setting_value: string;
  updated_at: string;
}

export interface InventoryStats {
  total_assets: number;
  total_value: number;
  expiring_soon: number;
  below_par: number;
  total_locations: number;
  total_kits: number;
}

export interface AssetWithLocation extends Asset {
  location_name?: string;
  location_type?: LocationType;
}

export interface KitWithItems extends Kit {
  items: (KitItem & { asset?: Asset })[];
  total_items: number;
  packed_items: number;
}
