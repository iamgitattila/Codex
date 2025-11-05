/**
 * Bug-Out Timer - App Constants
 * Colors, Typography, Spacing, and other app-wide constants
 */

// ========================================
// COLORS
// ========================================

export const COLORS = {
  // Base colors
  background: '#121212',        // Dark gray background
  surface: '#1E1E1E',          // Slightly lighter surface
  textPrimary: '#FFFFFF',      // White text
  textSecondary: '#BBBBBB',    // Gray text
  accent: '#FF6B6B',           // Bright red accent

  // Scenario colors
  scenario: {
    immediate: '#FF0000',      // 5 MIN - Red
    routine: '#FF6600',        // 15 MIN - Orange
    planned: '#FFC107',        // 30 MIN - Yellow
    family: '#4CAF50',         // 60 MIN Family - Green
    group: '#2196F3'           // 60 MIN Group - Blue
  },

  // Status colors
  warning: '#FFC107',          // Yellow
  error: '#FF0000',            // Red
  success: '#4CAF50',          // Green
  info: '#2196F3',             // Blue

  // UI element colors
  border: '#333333',
  borderLight: '#666666',
  disabled: '#888888',
  overlay: 'rgba(0, 0, 0, 0.8)',

  // Button colors
  buttonPrimary: '#FF6B6B',    // Red CTA
  buttonSecondary: '#333333',  // Dark gray
  buttonSuccess: '#4CAF50',    // Green
  buttonDanger: '#FF0000'      // Red
};

// ========================================
// TYPOGRAPHY
// ========================================

export const TYPOGRAPHY = {
  // Font sizes
  fontSize: {
    header: 24,               // Page titles
    sectionHeader: 18,        // Section headers
    scenarioName: 20,         // Scenario names
    body: 16,                 // Body text
    small: 14,                // Small text, task details
    timer: 72,                // Large countdown timer
    taskTitle: 18             // Task titles
  },

  // Font weights
  fontWeight: {
    regular: '400',
    bold: '700'
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8
  }
};

// ========================================
// SPACING
// ========================================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

// ========================================
// DIMENSIONS
// ========================================

export const DIMENSIONS = {
  // Button sizes
  buttonHeight: {
    small: 44,
    medium: 56,
    large: 64
  },

  // Input sizes
  inputHeight: 44,

  // Icon sizes
  iconSize: {
    small: 24,
    medium: 32,
    large: 48
  },

  // Border radius
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
    round: 999
  },

  // Minimum touch target
  minTouchTarget: 48
};

// ========================================
// TIMING
// ========================================

export const TIMING = {
  // Animation durations (milliseconds)
  animation: {
    fast: 150,
    normal: 300,
    slow: 500
  },

  // Timer intervals
  timerInterval: 100,         // Update timer every 100ms
  displayInterval: 1000,      // Update display every second

  // Feedback durations
  hapticDuration: 100,
  flashInterval: 500,         // Red flash interval for alarm

  // Timeouts
  splashDuration: 2000,
  notificationDuration: 3000
};

// ========================================
// STORAGE KEYS
// ========================================

export const STORAGE_KEYS = {
  drillHistory: '@bug_out_timer:drill_history',
  smsContacts: '@bug_out_timer:sms_contacts',
  appSettings: '@bug_out_timer:app_settings',
  lastScenario: '@bug_out_timer:last_scenario'
};

// ========================================
// APP SETTINGS DEFAULTS
// ========================================

export const DEFAULT_SETTINGS = {
  audioEnabled: true,
  hapticEnabled: true,
  smsEnabled: true,
  keepScreenOn: true,
  appVersion: '1.0.0'
};

// ========================================
// LIMITS
// ========================================

export const LIMITS = {
  maxDrillsStored: 100,        // Maximum drill history entries
  maxSmsContacts: 3,           // Maximum SMS contacts
  maxStorageMB: 10             // Estimated max storage in MB
};

// ========================================
// MESSAGES
// ========================================

export const MESSAGES = {
  // Drill completion
  drillComplete: '🎯 DRILL COMPLETE',
  drillAborted: '⚠️ DRILL ABORTED',

  // SMS
  smsDefaultMessage: (timestamp) => `Evacuating now. ${timestamp}`,
  smsContactLimit: `Maximum ${LIMITS.maxSmsContacts} contacts allowed`,

  // Errors
  errorSaving: 'Failed to save data. Please try again.',
  errorLoading: 'Failed to load data. App may not function correctly.',
  errorSms: 'SMS feature is not available on this device.',

  // Confirmations
  confirmAbort: 'Are you sure you want to abort this drill?',
  confirmDelete: 'Are you sure you want to delete this drill?',
  confirmReset: 'This will delete all drill history and settings. Continue?',

  // Info
  noDrillHistory: 'No drills completed yet. Start your first drill!',
  noTasks: 'All tasks completed!',
  drillInProgress: 'Drill in progress...'
};

// ========================================
// SCENARIOS (Quick access)
// ========================================

export const SCENARIO_IDS = {
  IMMEDIATE: '5_min_immediate',
  ROUTINE: '15_min_routine',
  PLANNED: '30_min_planned',
  FAMILY: '60_min_family',
  GROUP: '60_min_group'
};

// ========================================
// AUDIO FILES
// ========================================

// Note: Audio files need to be added to assets/sounds/ directory
// Uncomment these when audio files are available:
/*
export const AUDIO_FILES = {
  alarm: require('../assets/sounds/alarm.mp3'),
  taskComplete: require('../assets/sounds/task-complete.mp3'),
  drillStart: require('../assets/sounds/drill-start.mp3')
};
*/

export const AUDIO_FILES = {
  alarm: null,
  taskComplete: null,
  drillStart: null
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  DIMENSIONS,
  TIMING,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  LIMITS,
  MESSAGES,
  SCENARIO_IDS,
  AUDIO_FILES
};
