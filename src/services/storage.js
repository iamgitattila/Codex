// AsyncStorage service for local data persistence

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRE_SAVED_SIGNALS } from '../constants/preSavedSignals';

const KEYS = {
  CUSTOM_MESSAGES: '@morse_blinker:custom_messages',
  TRANSMISSION_HISTORY: '@morse_blinker:transmission_history',
  SETTINGS: '@morse_blinker:settings'
};

// Default settings
const DEFAULT_SETTINGS = {
  default_wpm: 20,
  flash_intensity: 100,
  vibration_enabled: true,
  audio_enabled: false,
  transmission_mode: 'LED_FLASH' // 'LED_FLASH', 'VIBRATION', 'BOTH'
};

/**
 * Get all custom messages
 */
export async function getCustomMessages() {
  try {
    const data = await AsyncStorage.getItem(KEYS.CUSTOM_MESSAGES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading custom messages:', error);
    return [];
  }
}

/**
 * Save a custom message
 */
export async function saveCustomMessage(message) {
  try {
    const messages = await getCustomMessages();
    const newMessage = {
      message_id: `custom_${Date.now()}`,
      text: message.text.toUpperCase(),
      morse: message.morse,
      created_at: new Date().toISOString(),
      category: 'Custom',
      wpm: message.wpm || 20
    };
    messages.push(newMessage);
    await AsyncStorage.setItem(KEYS.CUSTOM_MESSAGES, JSON.stringify(messages));
    return newMessage;
  } catch (error) {
    console.error('Error saving custom message:', error);
    throw error;
  }
}

/**
 * Delete a custom message
 */
export async function deleteCustomMessage(messageId) {
  try {
    const messages = await getCustomMessages();
    const filtered = messages.filter(m => m.message_id !== messageId);
    await AsyncStorage.setItem(KEYS.CUSTOM_MESSAGES, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting custom message:', error);
    throw error;
  }
}

/**
 * Get transmission history
 */
export async function getTransmissionHistory() {
  try {
    const data = await AsyncStorage.getItem(KEYS.TRANSMISSION_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transmission history:', error);
    return [];
  }
}

/**
 * Save a transmission to history
 */
export async function saveTransmission(transmission) {
  try {
    const history = await getTransmissionHistory();
    const newTransmission = {
      transmission_id: `tx_${Date.now()}`,
      message: transmission.message,
      morse: transmission.morse,
      wpm: transmission.wpm,
      flash_duration_seconds: transmission.duration,
      timestamp: new Date().toISOString(),
      transmission_mode: transmission.mode || 'LED_FLASH'
    };

    // Keep only last 50 transmissions
    history.unshift(newTransmission);
    if (history.length > 50) {
      history.pop();
    }

    await AsyncStorage.setItem(KEYS.TRANSMISSION_HISTORY, JSON.stringify(history));
    return newTransmission;
  } catch (error) {
    console.error('Error saving transmission:', error);
    throw error;
  }
}

/**
 * Clear transmission history
 */
export async function clearTransmissionHistory() {
  try {
    await AsyncStorage.setItem(KEYS.TRANSMISSION_HISTORY, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing transmission history:', error);
    throw error;
  }
}

/**
 * Get user settings
 */
export async function getSettings() {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update user settings
 */
export async function updateSettings(newSettings) {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(updatedSettings));
    return updatedSettings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

/**
 * Reset all settings to default
 */
export async function resetSettings() {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error resetting settings:', error);
    throw error;
  }
}

/**
 * Get all pre-saved signals
 */
export function getPreSavedSignals() {
  return PRE_SAVED_SIGNALS;
}

/**
 * Clear all app data (for testing/reset)
 */
export async function clearAllData() {
  try {
    await AsyncStorage.multiRemove([
      KEYS.CUSTOM_MESSAGES,
      KEYS.TRANSMISSION_HISTORY,
      KEYS.SETTINGS
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}
