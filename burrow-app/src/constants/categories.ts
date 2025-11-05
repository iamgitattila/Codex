export const ASSET_CATEGORIES = {
  CONSUMABLE: 'Consumable',
  GEAR: 'Gear',
  KIT: 'Kit',
  DOCUMENT: 'Document',
  INFORMATION: 'Information',
} as const;

export const CONSUMABLE_SUBCATEGORIES = {
  FOOD: 'Food',
  WATER: 'Water',
  MEDICINE: 'Medicine',
  HYGIENE: 'Hygiene',
  FUEL: 'Fuel',
} as const;

export const GEAR_SUBCATEGORIES = {
  GENERAL_TOOLS: 'General Tools',
  SURVIVAL_GEAR: 'Survival Gear',
  PILLAR_1_LISTEN: 'Pillar 1 (Listen)',
  PILLAR_2_MAP: 'Pillar 2 (Map)',
  PILLAR_3_LIBRARY: 'Pillar 3 (Library)',
  PILLAR_5_WHETSTONE: 'Pillar 5 (Whetstone)',
  WATER_SYSTEMS: 'Water Systems',
  POWER_SYSTEMS: 'Power Systems',
  SHELTER_BEDDING: 'Shelter & Bedding',
} as const;

export const KIT_TYPES = {
  BOB: 'Bug-Out Bag',
  BOV: 'Bug-Out Vehicle',
  CACHE: 'Fixed Cache',
  FIRST_AID: 'First Aid Kit',
  REPAIR: 'Repair Kit',
  COMMUNICATIONS: 'Communications Kit',
  OTHER: 'Other',
} as const;

export const LOCATION_TYPES = {
  HOME: 'Home',
  VEHICLE: 'Vehicle',
  CACHE: 'Cache',
  EXTERNAL: 'External',
} as const;

export const ROTATION_STATUS = {
  ACTIVE: 'Active',
  RESERVE: 'Reserve',
  EXPIRED: 'Expired',
  DEPLETED: 'Depleted',
} as const;

export const UNIT_TYPES = [
  'pieces',
  'cans',
  'boxes',
  'bags',
  'bottles',
  'gallons',
  'liters',
  'pounds',
  'kilograms',
  'ounces',
  'grams',
  'sets',
  'kits',
  'rolls',
  'packs',
] as const;

export const PRIORITY_LEVELS = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
} as const;

export type AssetCategory = typeof ASSET_CATEGORIES[keyof typeof ASSET_CATEGORIES];
export type ConsumableSubcategory = typeof CONSUMABLE_SUBCATEGORIES[keyof typeof CONSUMABLE_SUBCATEGORIES];
export type GearSubcategory = typeof GEAR_SUBCATEGORIES[keyof typeof GEAR_SUBCATEGORIES];
export type KitType = typeof KIT_TYPES[keyof typeof KIT_TYPES];
export type LocationType = typeof LOCATION_TYPES[keyof typeof LOCATION_TYPES];
export type RotationStatus = typeof ROTATION_STATUS[keyof typeof ROTATION_STATUS];
export type UnitType = typeof UNIT_TYPES[number];
export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];
