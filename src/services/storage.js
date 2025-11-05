/**
 * AsyncStorage service for data persistence
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  CANS: '@fuel_tracker:cans',
  USAGE_HISTORY: '@fuel_tracker:usage_history',
  SETTINGS: '@fuel_tracker:settings',
};

/**
 * Get all fuel cans
 * @returns {Promise<Array>} Array of fuel cans
 */
export const getCans = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.CANS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading cans:', error);
    return [];
  }
};

/**
 * Save all fuel cans
 * @param {Array} cans - Array of fuel cans
 * @returns {Promise<boolean>} Success status
 */
export const saveCans = async (cans) => {
  try {
    await AsyncStorage.setItem(KEYS.CANS, JSON.stringify(cans));
    return true;
  } catch (error) {
    console.error('Error saving cans:', error);
    return false;
  }
};

/**
 * Add a new fuel can
 * @param {Object} can - Fuel can object
 * @returns {Promise<boolean>} Success status
 */
export const addCan = async (can) => {
  try {
    const cans = await getCans();
    cans.push(can);
    return await saveCans(cans);
  } catch (error) {
    console.error('Error adding can:', error);
    return false;
  }
};

/**
 * Update a fuel can
 * @param {string} canId - Can ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<boolean>} Success status
 */
export const updateCan = async (canId, updates) => {
  try {
    const cans = await getCans();
    const index = cans.findIndex(c => c.can_id === canId);

    if (index !== -1) {
      cans[index] = { ...cans[index], ...updates };
      return await saveCans(cans);
    }

    return false;
  } catch (error) {
    console.error('Error updating can:', error);
    return false;
  }
};

/**
 * Delete a fuel can
 * @param {string} canId - Can ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteCan = async (canId) => {
  try {
    const cans = await getCans();
    const filtered = cans.filter(c => c.can_id !== canId);
    return await saveCans(filtered);
  } catch (error) {
    console.error('Error deleting can:', error);
    return false;
  }
};

/**
 * Get usage history
 * @returns {Promise<Array>} Array of usage entries
 */
export const getUsageHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USAGE_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading usage history:', error);
    return [];
  }
};

/**
 * Save usage history
 * @param {Array} history - Array of usage entries
 * @returns {Promise<boolean>} Success status
 */
export const saveUsageHistory = async (history) => {
  try {
    await AsyncStorage.setItem(KEYS.USAGE_HISTORY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Error saving usage history:', error);
    return false;
  }
};

/**
 * Add a usage entry
 * @param {Object} entry - Usage entry object
 * @returns {Promise<boolean>} Success status
 */
export const addUsageEntry = async (entry) => {
  try {
    const history = await getUsageHistory();
    history.push(entry);
    return await saveUsageHistory(history);
  } catch (error) {
    console.error('Error adding usage entry:', error);
    return false;
  }
};

/**
 * Get usage history for a specific can
 * @param {string} canId - Can ID
 * @returns {Promise<Array>} Array of usage entries
 */
export const getCanUsageHistory = async (canId) => {
  try {
    const history = await getUsageHistory();
    return history.filter(entry => entry.can_id === canId);
  } catch (error) {
    console.error('Error getting can usage history:', error);
    return [];
  }
};

/**
 * Get app settings
 * @returns {Promise<Object>} Settings object
 */
export const getSettings = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : getDefaultSettings();
  } catch (error) {
    console.error('Error loading settings:', error);
    return getDefaultSettings();
  }
};

/**
 * Save app settings
 * @param {Object} settings - Settings object
 * @returns {Promise<boolean>} Success status
 */
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * Get default settings
 * @returns {Object} Default settings
 */
export const getDefaultSettings = () => ({
  alert_threshold_days: 30,
  default_fuel_type: 'gasoline',
  default_stabilizer: true,
  volume_unit: 'gallons',
  notification_enabled: true,
});

/**
 * Clear all data (for testing/reset)
 * @returns {Promise<boolean>} Success status
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.CANS,
      KEYS.USAGE_HISTORY,
      KEYS.SETTINGS,
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
