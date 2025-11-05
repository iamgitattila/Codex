// Water Boil Logger - Home Screen (Dashboard)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, BoilLog } from '../types';
import { COLORS } from '../constants';
import { getBoilLogs, getSettings, getStreaks } from '../services/StorageService';
import { getTodayData, getProgressPercentage } from '../utils/calculations';
import ProgressBar from '../components/ProgressBar';
import LogEntry from '../components/LogEntry';
import { requestNotificationPermissions } from '../services/NotificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [todayLogs, setTodayLogs] = useState<BoilLog[]>([]);
  const [dailyGoal, setDailyGoal] = useState<number>(64);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    requestNotificationPermissions();
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const logs = await getBoilLogs();
      const settings = await getSettings();
      const streaks = await getStreaks();

      const todayData = getTodayData(logs);

      setTodayTotal(todayData.total_oz);
      setTodayLogs(todayData.logs.reverse()); // Most recent first
      setDailyGoal(settings.daily_goal_oz);
      setCurrentStreak(streaks.current_streak);
      setLongestStreak(streaks.longest_streak);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const progress = getProgressPercentage(todayTotal, dailyGoal);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Dashboard Card */}
        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardLabel}>TODAY'S INTAKE</Text>
          <Text style={styles.dashboardValue}>
            {todayTotal.toFixed(1)} oz / {dailyGoal} oz
          </Text>
          <ProgressBar progress={progress} />
          {progress >= 100 && (
            <Text style={styles.goalMetText}>🎉 Daily goal reached!</Text>
          )}
        </View>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <Text style={styles.streakLabel}>🔥 CURRENT STREAK</Text>
              <Text style={styles.streakValue}>{currentStreak} days</Text>
            </View>
            <View style={styles.streakItem}>
              <Text style={styles.streakLabel}>🏆 LONGEST</Text>
              <Text style={styles.streakValue}>{longestStreak} days</Text>
            </View>
          </View>

          {currentStreak >= 7 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {currentStreak >= 30
                  ? '🌟 Hydration Champion'
                  : currentStreak >= 14
                  ? '💪 Two-Week Warrior'
                  : '🎖 Weekly Hydrator'}
              </Text>
            </View>
          )}
        </View>

        {/* Start Boil Button */}
        <TouchableOpacity
          style={styles.startBoilButton}
          onPress={() => navigation.navigate('Timer')}
        >
          <Text style={styles.startBoilButtonText}>⏱ START BOIL</Text>
        </TouchableOpacity>

        {/* Today's Logs */}
        <View style={styles.logsSection}>
          <Text style={styles.logsSectionTitle}>TODAY'S LOGS</Text>
          {todayLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No water logged yet today
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Tap "START BOIL" to begin tracking
              </Text>
            </View>
          ) : (
            todayLogs.map(log => <LogEntry key={log.log_id} log={log} />)
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Weekly')}
          >
            <Text style={styles.navButtonText}>📊 Weekly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.navButtonText}>📜 History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.navButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  dashboardCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dashboardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 8,
  },
  dashboardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  goalMetText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
    textAlign: 'center',
    marginTop: 12,
  },
  streakCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.streakFire,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.streakFire,
  },
  badge: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.warning,
    borderRadius: 20,
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  startBoilButton: {
    backgroundColor: COLORS.primary,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startBoilButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  logsSection: {
    marginBottom: 24,
  },
  logsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: COLORS.white,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
