// Database schema creation for Burrow: The Digital Ledger
// SQLite schema based on the technical specification

export const CREATE_ASSETS_TABLE = `
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  quantity_owned INTEGER DEFAULT 0,
  quantity_par INTEGER,
  unit_type TEXT,
  location_id TEXT NOT NULL,
  expiration_date TEXT,
  date_acquired TEXT,
  last_verified TEXT,
  cost_usd REAL,
  source_url TEXT,
  barcode_ean TEXT,
  photo_path TEXT,
  notes TEXT,
  condition TEXT,
  rotation_status TEXT DEFAULT 'Active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);
`;

export const CREATE_LOCATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location_type TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
`;

export const CREATE_KITS_TABLE = `
CREATE TABLE IF NOT EXISTS kits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  kit_type TEXT NOT NULL,
  location_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);
`;

export const CREATE_KIT_ITEMS_TABLE = `
CREATE TABLE IF NOT EXISTS kit_items (
  id TEXT PRIMARY KEY,
  kit_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  quantity_required INTEGER DEFAULT 1,
  is_packed INTEGER DEFAULT 0,
  last_verified TEXT,
  UNIQUE(kit_id, asset_id),
  FOREIGN KEY (kit_id) REFERENCES kits(id),
  FOREIGN KEY (asset_id) REFERENCES assets(id)
);
`;

export const CREATE_EXPIRATION_ALERTS_TABLE = `
CREATE TABLE IF NOT EXISTS expiration_alerts (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  expiration_date TEXT NOT NULL,
  days_until_expiration INTEGER,
  alert_sent INTEGER DEFAULT 0,
  alert_date TEXT,
  action_taken TEXT,
  action_date TEXT,
  FOREIGN KEY (asset_id) REFERENCES assets(id)
);
`;

export const CREATE_SHOPPING_LIST_TABLE = `
CREATE TABLE IF NOT EXISTS shopping_list (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  current_quantity INTEGER,
  par_quantity INTEGER,
  quantity_to_buy INTEGER,
  priority TEXT,
  source_url TEXT,
  estimated_cost REAL,
  created_at TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY (asset_id) REFERENCES assets(id)
);
`;

export const CREATE_USER_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS user_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT,
  updated_at TEXT NOT NULL
);
`;

// Performance indexes as specified in the technical document
export const CREATE_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_assets_location ON assets(location_id);',
  'CREATE INDEX IF NOT EXISTS idx_assets_expiration ON assets(expiration_date);',
  'CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);',
  'CREATE INDEX IF NOT EXISTS idx_kit_items_kit ON kit_items(kit_id);',
  'CREATE INDEX IF NOT EXISTS idx_kit_items_asset ON kit_items(asset_id);',
  'CREATE INDEX IF NOT EXISTS idx_shopping_list_asset ON shopping_list(asset_id);',
  'CREATE INDEX IF NOT EXISTS idx_expiration_alerts_asset ON expiration_alerts(asset_id);',
];

// Seed data for default locations
export const SEED_DEFAULT_LOCATIONS = `
INSERT OR IGNORE INTO locations (id, name, description, location_type, "order", created_at) VALUES
  ('loc_pantry', 'Pantry', 'Main food storage area', 'Home', 1, datetime('now')),
  ('loc_garage', 'Garage', 'Tool and equipment storage', 'Home', 2, datetime('now')),
  ('loc_basement', 'Basement', 'Long-term storage area', 'Home', 3, datetime('now')),
  ('loc_attic', 'Attic', 'Seasonal and archive storage', 'Home', 4, datetime('now')),
  ('loc_master_bedroom', 'Master Bedroom', 'Personal items and safe', 'Home', 5, datetime('now')),
  ('loc_vehicle_primary', 'Primary Vehicle', 'Main transportation vehicle', 'Vehicle', 6, datetime('now')),
  ('loc_vehicle_backup', 'Backup Vehicle', 'Secondary vehicle storage', 'Vehicle', 7, datetime('now')),
  ('loc_cache_1', 'Cache #1', 'External emergency cache', 'Cache', 8, datetime('now'));
`;

// Seed data for default settings
export const SEED_DEFAULT_SETTINGS = `
INSERT OR IGNORE INTO user_settings (setting_key, setting_value, updated_at) VALUES
  ('expiration_alert_days', '30', datetime('now')),
  ('enable_notifications', 'true', datetime('now')),
  ('daily_reminder_enabled', 'true', datetime('now')),
  ('daily_reminder_time', '09:00', datetime('now')),
  ('require_device_password', 'false', datetime('now')),
  ('encrypt_database', 'false', datetime('now')),
  ('app_version', '1.0.0', datetime('now'));
`;

export const ALL_CREATE_STATEMENTS = [
  CREATE_LOCATIONS_TABLE,
  CREATE_ASSETS_TABLE,
  CREATE_KITS_TABLE,
  CREATE_KIT_ITEMS_TABLE,
  CREATE_EXPIRATION_ALERTS_TABLE,
  CREATE_SHOPPING_LIST_TABLE,
  CREATE_USER_SETTINGS_TABLE,
  ...CREATE_INDEXES,
];

export const ALL_SEED_STATEMENTS = [
  SEED_DEFAULT_LOCATIONS,
  SEED_DEFAULT_SETTINGS,
];
