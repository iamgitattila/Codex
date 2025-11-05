// Water Boil Logger - Type Definitions

export interface BoilLog {
  log_id: string;
  timestamp: string; // ISO 8601 format
  volume_oz: number;
  volume_liters: number;
  boil_duration_seconds: number;
  person: string;
  notes: string;
}

export interface Settings {
  boil_duration_seconds: number; // 60, 180, 300, or 600 (1, 3, 5, or 10 minutes)
  volume_unit: 'oz' | 'liters';
  daily_goal_oz: number;
  notification_enabled: boolean;
  streak_enabled: boolean;
}

export interface Streaks {
  current_streak: number; // days
  longest_streak: number;
  last_logged_date: string; // YYYY-MM-DD
  streak_started_date: string; // YYYY-MM-DD
}

export interface DailyData {
  total_oz: number;
  total_liters: number;
  daily_goal_met: boolean;
  logs: BoilLog[];
}

export interface WeeklyData {
  [date: string]: {
    total_oz: number;
    daily_goal_met: boolean;
  };
}

export interface AppData {
  boil_logs: BoilLog[];
  settings: Settings;
  streaks: Streaks;
  weekly_data: WeeklyData;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Timer: undefined;
  VolumeLogger: { boilTime: Date };
  Weekly: undefined;
  History: undefined;
  Settings: undefined;
};

// Constants
export const QUICK_VOLUMES = [8, 16, 32, 64] as const;
export const BOIL_DURATIONS = [60, 180, 300, 600] as const; // 1, 3, 5, 10 minutes
export const VOLUME_UNITS = ['oz', 'liters'] as const;
export const DEFAULT_DAILY_GOAL_OZ = 64;
export const DEFAULT_BOIL_DURATION = 60; // 1 minute

// Helper type for volume unit conversion
export const OZ_TO_LITERS = 0.0295735;
export const LITERS_TO_OZ = 33.814;
