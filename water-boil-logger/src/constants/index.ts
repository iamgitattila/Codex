// Water Boil Logger - Constants

export const STORAGE_KEYS = {
  BOIL_LOGS: '@water_boil_logger:boil_logs',
  SETTINGS: '@water_boil_logger:settings',
  STREAKS: '@water_boil_logger:streaks',
  WEEKLY_DATA: '@water_boil_logger:weekly_data',
};

export const COLORS = {
  primary: '#FF6B6B', // Red for boil button
  secondary: '#4ECDC4', // Teal for progress
  success: '#95E1D3', // Light teal for completed
  warning: '#FFE66D', // Yellow for warnings
  danger: '#F38181', // Light red
  background: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#666666',
  lightGray: '#E0E0E0',
  darkGray: '#333333',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  progressFill: '#64C8FF', // Blue for progress bar
  streakFire: '#FF6B35', // Orange for streak
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
};

export const PERSON_OPTIONS = [
  { label: 'Me', value: 'Me' },
  { label: 'Spouse', value: 'Spouse' },
  { label: 'Child 1', value: 'Child1' },
  { label: 'Child 2', value: 'Child2' },
  { label: 'Other', value: 'Other' },
];

export const BOIL_DURATION_OPTIONS = [
  { label: '1 minute (Sea level)', value: 60 },
  { label: '3 minutes (2,000-6,500 ft)', value: 180 },
  { label: '5 minutes (6,500-10,000 ft)', value: 300 },
  { label: '10 minutes (>10,000 ft)', value: 600 },
];

export const NOTIFICATION_MESSAGES = {
  TIMER_COMPLETE: {
    title: '☕ Water is boiled!',
    body: 'Tap to log how much you drank',
  },
  DAILY_REMINDER: {
    title: '💧 Stay hydrated!',
    body: 'Remember to boil and drink water today',
  },
  GOAL_REACHED: {
    title: '🎉 Daily goal reached!',
    body: 'Great job staying hydrated today!',
  },
  STREAK_MILESTONE: {
    title: '🔥 Streak milestone!',
    body: 'You\'ve maintained your streak for {days} days!',
  },
};

export const WEEKLY_GOAL_OZ = 448; // 7 days × 64 oz
export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
