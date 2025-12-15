// Water Boil Logger - Calculation Utilities

import { BoilLog, DailyData, WeeklyData, OZ_TO_LITERS } from '../types';

// Date formatting helper
export const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

export const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateString(yesterday);
};

// Calculate total volume for a specific date
export const calculateDailyTotal = (logs: BoilLog[], date: string): DailyData => {
  const dayLogs = logs.filter(log => log.timestamp.split('T')[0] === date);

  const total_oz = dayLogs.reduce((sum, log) => sum + log.volume_oz, 0);
  const total_liters = total_oz * OZ_TO_LITERS;

  return {
    total_oz: Math.round(total_oz * 100) / 100,
    total_liters: Math.round(total_liters * 100) / 100,
    daily_goal_met: false, // Will be set based on user's goal
    logs: dayLogs,
  };
};

// Get today's data
export const getTodayData = (logs: BoilLog[]): DailyData => {
  return calculateDailyTotal(logs, getDateString());
};

// Calculate weekly data for the last 7 days
export const calculateWeeklyData = (
  logs: BoilLog[],
  dailyGoalOz: number
): WeeklyData => {
  const weeklyData: WeeklyData = {};

  // Last 7 days including today
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = getDateString(date);

    const dailyData = calculateDailyTotal(logs, dateStr);
    weeklyData[dateStr] = {
      total_oz: dailyData.total_oz,
      daily_goal_met: dailyData.total_oz >= dailyGoalOz,
    };
  }

  return weeklyData;
};

// Get weekly total in oz
export const getWeeklyTotal = (weeklyData: WeeklyData): number => {
  return Object.values(weeklyData).reduce((sum, day) => sum + day.total_oz, 0);
};

// Get count of days goal was met this week
export const getGoalsMetCount = (weeklyData: WeeklyData): number => {
  return Object.values(weeklyData).filter(day => day.daily_goal_met).length;
};

// Calculate streak
export const calculateStreak = (
  logs: BoilLog[],
  dailyGoalOz: number,
  currentStreak: number,
  lastLoggedDate: string,
  streakStartedDate: string
): {
  current_streak: number;
  longest_streak: number;
  last_logged_date: string;
  streak_started_date: string;
} => {
  const today = getDateString();
  const yesterday = getYesterdayDateString();

  // Get today's total
  const todayData = calculateDailyTotal(logs, today);
  const todayGoalMet = todayData.total_oz >= dailyGoalOz;

  if (!todayGoalMet) {
    // Goal not met today, don't update streak
    return {
      current_streak: currentStreak,
      longest_streak: Math.max(currentStreak, 0),
      last_logged_date: lastLoggedDate,
      streak_started_date: streakStartedDate,
    };
  }

  // Goal met today
  let newStreak = currentStreak;
  let newStartDate = streakStartedDate;

  if (lastLoggedDate === today) {
    // Already logged today, don't increment
    newStreak = currentStreak;
  } else if (lastLoggedDate === yesterday) {
    // Continuous streak
    newStreak = currentStreak + 1;
  } else if (lastLoggedDate === '') {
    // First log ever
    newStreak = 1;
    newStartDate = today;
  } else {
    // Streak broken, start new
    newStreak = 1;
    newStartDate = today;
  }

  return {
    current_streak: newStreak,
    longest_streak: Math.max(newStreak, currentStreak),
    last_logged_date: today,
    streak_started_date: newStartDate,
  };
};

// Format time (seconds to MM:SS)
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Convert oz to liters
export const ozToLiters = (oz: number): number => {
  return Math.round(oz * OZ_TO_LITERS * 100) / 100;
};

// Convert liters to oz
export const litersToOz = (liters: number): number => {
  return Math.round((liters / OZ_TO_LITERS) * 100) / 100;
};

// Get progress percentage
export const getProgressPercentage = (current: number, goal: number): number => {
  if (goal === 0) return 0;
  return Math.min(Math.round((current / goal) * 100), 100);
};

// Get last 30 days of logs
export const getLast30DaysLogs = (logs: BoilLog[]): BoilLog[] => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return logs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= thirtyDaysAgo;
  });
};

// Sort logs by timestamp (newest first)
export const sortLogsByTimestamp = (logs: BoilLog[], descending = true): BoilLog[] => {
  return [...logs].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return descending ? dateB - dateA : dateA - dateB;
  });
};
