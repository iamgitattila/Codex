// Water Boil Logger - Storage Service
// Handles all AsyncStorage operations for data persistence

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BoilLog,
  Settings,
  Streaks,
  WeeklyData,
  DEFAULT_DAILY_GOAL_OZ,
  DEFAULT_BOIL_DURATION,
} from '../types';
import { STORAGE_KEYS } from '../constants';

// Generate unique ID for logs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Boil Logs Operations
export const getBoilLogs = async (): Promise<BoilLog[]> => {
  try {
    const logsJson = await AsyncStorage.getItem(STORAGE_KEYS.BOIL_LOGS);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (error) {
    console.error('Error getting boil logs:', error);
    return [];
  }
};

export const addBoilLog = async (log: BoilLog): Promise<void> => {
  try {
    const logs = await getBoilLogs();
    logs.push(log);
    await AsyncStorage.setItem(STORAGE_KEYS.BOIL_LOGS, JSON.stringify(logs));
  } catch (error) {
    console.error('Error adding boil log:', error);
    throw error;
  }
};

export const deleteBoilLog = async (logId: string): Promise<void> => {
  try {
    const logs = await getBoilLogs();
    const filteredLogs = logs.filter(log => log.log_id !== logId);
    await AsyncStorage.setItem(STORAGE_KEYS.BOIL_LOGS, JSON.stringify(filteredLogs));
  } catch (error) {
    console.error('Error deleting boil log:', error);
    throw error;
  }
};

export const clearAllLogs = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BOIL_LOGS, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing logs:', error);
    throw error;
  }
};

// Settings Operations
const DEFAULT_SETTINGS: Settings = {
  boil_duration_seconds: DEFAULT_BOIL_DURATION,
  volume_unit: 'oz',
  daily_goal_oz: DEFAULT_DAILY_GOAL_OZ,
  notification_enabled: true,
  streak_enabled: true,
};

export const getSettings = async (): Promise<Settings> => {
  try {
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settingsJson ? JSON.parse(settingsJson) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const updateSettings = async (settings: Partial<Settings>): Promise<void> => {
  try {
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

export const resetSettings = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  } catch (error) {
    console.error('Error resetting settings:', error);
    throw error;
  }
};

// Streaks Operations
const DEFAULT_STREAKS: Streaks = {
  current_streak: 0,
  longest_streak: 0,
  last_logged_date: '',
  streak_started_date: '',
};

export const getStreaks = async (): Promise<Streaks> => {
  try {
    const streaksJson = await AsyncStorage.getItem(STORAGE_KEYS.STREAKS);
    return streaksJson ? JSON.parse(streaksJson) : DEFAULT_STREAKS;
  } catch (error) {
    console.error('Error getting streaks:', error);
    return DEFAULT_STREAKS;
  }
};

export const updateStreaks = async (streaks: Partial<Streaks>): Promise<void> => {
  try {
    const currentStreaks = await getStreaks();
    const newStreaks = { ...currentStreaks, ...streaks };
    await AsyncStorage.setItem(STORAGE_KEYS.STREAKS, JSON.stringify(newStreaks));
  } catch (error) {
    console.error('Error updating streaks:', error);
    throw error;
  }
};

export const resetStreaks = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STREAKS, JSON.stringify(DEFAULT_STREAKS));
  } catch (error) {
    console.error('Error resetting streaks:', error);
    throw error;
  }
};

// Weekly Data Operations
export const getWeeklyData = async (): Promise<WeeklyData> => {
  try {
    const weeklyJson = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_DATA);
    return weeklyJson ? JSON.parse(weeklyJson) : {};
  } catch (error) {
    console.error('Error getting weekly data:', error);
    return {};
  }
};

export const updateWeeklyData = async (weeklyData: WeeklyData): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_DATA, JSON.stringify(weeklyData));
  } catch (error) {
    console.error('Error updating weekly data:', error);
    throw error;
  }
};

// Utility: Clear all app data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.BOIL_LOGS,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.STREAKS,
      STORAGE_KEYS.WEEKLY_DATA,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};
