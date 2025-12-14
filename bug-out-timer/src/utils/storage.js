/**
 * Bug-Out Timer - AsyncStorage Utility
 * Handles all local storage operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_SETTINGS, LIMITS } from '../constants';

// ========================================
// DRILL HISTORY
// ========================================

/**
 * Save a completed drill to history
 * @param {Object} drill - Drill data object
 */
export const saveDrill = async (drill) => {
  try {
    const history = await getDrillHistory();

    // Add new drill to beginning of array
    const updatedHistory = [drill, ...history];

    // Keep only the most recent LIMITS.maxDrillsStored drills
    const trimmedHistory = updatedHistory.slice(0, LIMITS.maxDrillsStored);

    await AsyncStorage.setItem(
      STORAGE_KEYS.drillHistory,
      JSON.stringify(trimmedHistory)
    );

    return { success: true, drill };
  } catch (error) {
    console.error('Error saving drill:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all drill history
 * @returns {Array} Array of drill objects
 */
export const getDrillHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.drillHistory);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting drill history:', error);
    return [];
  }
};

/**
 * Get drill by ID
 * @param {string} drillId - Drill ID
 * @returns {Object|null} Drill object or null
 */
export const getDrillById = async (drillId) => {
  try {
    const history = await getDrillHistory();
    return history.find(drill => drill.drill_id === drillId) || null;
  } catch (error) {
    console.error('Error getting drill by ID:', error);
    return null;
  }
};

/**
 * Delete drill from history
 * @param {string} drillId - Drill ID to delete
 */
export const deleteDrill = async (drillId) => {
  try {
    const history = await getDrillHistory();
    const updatedHistory = history.filter(drill => drill.drill_id !== drillId);

    await AsyncStorage.setItem(
      STORAGE_KEYS.drillHistory,
      JSON.stringify(updatedHistory)
    );

    return { success: true };
  } catch (error) {
    console.error('Error deleting drill:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all drill history
 */
export const clearDrillHistory = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.drillHistory);
    return { success: true };
  } catch (error) {
    console.error('Error clearing drill history:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get most recent drill
 * @returns {Object|null} Most recent drill or null
 */
export const getLastDrill = async () => {
  try {
    const history = await getDrillHistory();
    return history.length > 0 ? history[0] : null;
  } catch (error) {
    console.error('Error getting last drill:', error);
    return null;
  }
};

// ========================================
// SMS CONTACTS
// ========================================

/**
 * Save SMS contacts
 * @param {Array} contacts - Array of contact objects
 */
export const saveSmsContacts = async (contacts) => {
  try {
    // Limit to max contacts
    const trimmedContacts = contacts.slice(0, LIMITS.maxSmsContacts);

    await AsyncStorage.setItem(
      STORAGE_KEYS.smsContacts,
      JSON.stringify(trimmedContacts)
    );

    return { success: true, contacts: trimmedContacts };
  } catch (error) {
    console.error('Error saving SMS contacts:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all SMS contacts
 * @returns {Array} Array of contact objects
 */
export const getSmsContacts = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.smsContacts);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting SMS contacts:', error);
    return [];
  }
};

/**
 * Add new SMS contact
 * @param {Object} contact - Contact object
 */
export const addSmsContact = async (contact) => {
  try {
    const contacts = await getSmsContacts();

    if (contacts.length >= LIMITS.maxSmsContacts) {
      return {
        success: false,
        error: `Maximum ${LIMITS.maxSmsContacts} contacts allowed`
      };
    }

    const updatedContacts = [...contacts, contact];
    return await saveSmsContacts(updatedContacts);
  } catch (error) {
    console.error('Error adding SMS contact:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update SMS contact
 * @param {string} contactId - Contact ID
 * @param {Object} updatedContact - Updated contact data
 */
export const updateSmsContact = async (contactId, updatedContact) => {
  try {
    const contacts = await getSmsContacts();
    const updatedContacts = contacts.map(contact =>
      contact.contact_id === contactId ? { ...contact, ...updatedContact } : contact
    );

    return await saveSmsContacts(updatedContacts);
  } catch (error) {
    console.error('Error updating SMS contact:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete SMS contact
 * @param {string} contactId - Contact ID to delete
 */
export const deleteSmsContact = async (contactId) => {
  try {
    const contacts = await getSmsContacts();
    const updatedContacts = contacts.filter(
      contact => contact.contact_id !== contactId
    );

    return await saveSmsContacts(updatedContacts);
  } catch (error) {
    console.error('Error deleting SMS contact:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get enabled SMS contacts
 * @returns {Array} Array of enabled contacts
 */
export const getEnabledSmsContacts = async () => {
  try {
    const contacts = await getSmsContacts();
    return contacts.filter(contact => contact.enabled === true);
  } catch (error) {
    console.error('Error getting enabled SMS contacts:', error);
    return [];
  }
};

// ========================================
// APP SETTINGS
// ========================================

/**
 * Save app settings
 * @param {Object} settings - Settings object
 */
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.appSettings,
      JSON.stringify(settings)
    );

    return { success: true, settings };
  } catch (error) {
    console.error('Error saving settings:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get app settings
 * @returns {Object} Settings object
 */
export const getSettings = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.appSettings);
    return jsonValue != null ? JSON.parse(jsonValue) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Update specific setting
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 */
export const updateSetting = async (key, value) => {
  try {
    const settings = await getSettings();
    const updatedSettings = { ...settings, [key]: value };
    return await saveSettings(updatedSettings);
  } catch (error) {
    console.error('Error updating setting:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Reset settings to defaults
 */
export const resetSettings = async () => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.appSettings,
      JSON.stringify(DEFAULT_SETTINGS)
    );

    return { success: true, settings: DEFAULT_SETTINGS };
  } catch (error) {
    console.error('Error resetting settings:', error);
    return { success: false, error: error.message };
  }
};

// ========================================
// LAST SCENARIO
// ========================================

/**
 * Save last used scenario
 * @param {string} scenarioId - Scenario ID
 */
export const saveLastScenario = async (scenarioId) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.lastScenario, scenarioId);
    return { success: true };
  } catch (error) {
    console.error('Error saving last scenario:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get last used scenario
 * @returns {string|null} Scenario ID or null
 */
export const getLastScenario = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.lastScenario);
  } catch (error) {
    console.error('Error getting last scenario:', error);
    return null;
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Clear all app data
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.drillHistory,
      STORAGE_KEYS.smsContacts,
      STORAGE_KEYS.appSettings,
      STORAGE_KEYS.lastScenario
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error clearing all data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get app data size (estimated)
 * @returns {Object} Size information
 */
export const getDataSize = async () => {
  try {
    const [history, contacts, settings] = await Promise.all([
      getDrillHistory(),
      getSmsContacts(),
      getSettings()
    ]);

    const historySize = JSON.stringify(history).length;
    const contactsSize = JSON.stringify(contacts).length;
    const settingsSize = JSON.stringify(settings).length;
    const totalBytes = historySize + contactsSize + settingsSize;
    const totalKB = (totalBytes / 1024).toFixed(2);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

    return {
      bytes: totalBytes,
      kilobytes: totalKB,
      megabytes: totalMB,
      drillCount: history.length,
      contactCount: contacts.length
    };
  } catch (error) {
    console.error('Error getting data size:', error);
    return null;
  }
};

export default {
  // Drill operations
  saveDrill,
  getDrillHistory,
  getDrillById,
  deleteDrill,
  clearDrillHistory,
  getLastDrill,

  // SMS contacts
  saveSmsContacts,
  getSmsContacts,
  addSmsContact,
  updateSmsContact,
  deleteSmsContact,
  getEnabledSmsContacts,

  // Settings
  saveSettings,
  getSettings,
  updateSetting,
  resetSettings,

  // Last scenario
  saveLastScenario,
  getLastScenario,

  // Utility
  clearAllData,
  getDataSize
};
