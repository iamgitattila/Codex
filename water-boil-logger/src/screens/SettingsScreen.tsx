// Water Boil Logger - Settings Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Settings } from '../types';
import { COLORS, BOIL_DURATION_OPTIONS } from '../constants';
import {
  getSettings,
  updateSettings,
  resetSettings,
  clearAllData,
  getStreaks,
  resetStreaks,
} from '../services/StorageService';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<Settings>({
    boil_duration_seconds: 60,
    volume_unit: 'oz',
    daily_goal_oz: 64,
    notification_enabled: true,
    streak_enabled: true,
  });

  const [customGoal, setCustomGoal] = useState<string>('64');
  const [streakInfo, setStreakInfo] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    loadSettings();
    loadStreakInfo();
  }, []);

  const loadSettings = async () => {
    const currentSettings = await getSettings();
    setSettings(currentSettings);
    setCustomGoal(currentSettings.daily_goal_oz.toString());
  };

  const loadStreakInfo = async () => {
    const streaks = await getStreaks();
    setStreakInfo({
      current: streaks.current_streak,
      longest: streaks.longest_streak,
    });
  };

  const handleUpdateSetting = async (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await updateSettings({ [key]: value });
  };

  const handleUpdateDailyGoal = async () => {
    const goal = parseFloat(customGoal);
    if (isNaN(goal) || goal <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid number greater than 0');
      return;
    }

    await handleUpdateSetting('daily_goal_oz', goal);
    Alert.alert('Success', 'Daily goal updated successfully');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetSettings();
            await loadSettings();
            Alert.alert('Success', 'Settings reset to defaults');
          },
        },
      ]
    );
  };

  const handleResetStreak = () => {
    Alert.alert(
      'Reset Streak',
      'Are you sure you want to reset your streak? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetStreaks();
            await loadStreakInfo();
            Alert.alert('Success', 'Streak reset successfully');
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'WARNING: This will delete ALL your logs, settings, and streaks. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            await loadSettings();
            await loadStreakInfo();
            Alert.alert('Success', 'All data cleared');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Boil Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Boil Duration</Text>
          <Text style={styles.sectionSubtitle}>
            Select based on your altitude
          </Text>

          {BOIL_DURATION_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                settings.boil_duration_seconds === option.value &&
                  styles.optionButtonActive,
              ]}
              onPress={() =>
                handleUpdateSetting('boil_duration_seconds', option.value)
              }
            >
              <Text
                style={[
                  styles.optionButtonText,
                  settings.boil_duration_seconds === option.value &&
                    styles.optionButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Volume Unit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volume Unit</Text>

          <View style={styles.unitRow}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                settings.volume_unit === 'oz' && styles.unitButtonActive,
              ]}
              onPress={() => handleUpdateSetting('volume_unit', 'oz')}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  settings.volume_unit === 'oz' && styles.unitButtonTextActive,
                ]}
              >
                Ounces (oz)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.unitButton,
                settings.volume_unit === 'liters' && styles.unitButtonActive,
              ]}
              onPress={() => handleUpdateSetting('volume_unit', 'liters')}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  settings.volume_unit === 'liters' && styles.unitButtonTextActive,
                ]}
              >
                Liters (L)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Goal (oz)</Text>
          <Text style={styles.sectionSubtitle}>
            Recommended: 64 oz (2 liters) for adults
          </Text>

          <View style={styles.goalRow}>
            <TextInput
              style={styles.goalInput}
              value={customGoal}
              onChangeText={setCustomGoal}
              keyboardType="decimal-pad"
              placeholder="64"
            />
            <TouchableOpacity
              style={styles.goalButton}
              onPress={handleUpdateDailyGoal}
            >
              <Text style={styles.goalButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Text style={styles.toggleTitle}>Notifications</Text>
              <Text style={styles.toggleSubtitle}>
                Alert when boil is complete
              </Text>
            </View>
            <Switch
              value={settings.notification_enabled}
              onValueChange={value =>
                handleUpdateSetting('notification_enabled', value)
              }
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            />
          </View>
        </View>

        {/* Streak Tracking */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Text style={styles.toggleTitle}>Streak Tracking</Text>
              <Text style={styles.toggleSubtitle}>
                Track consecutive days meeting goal
              </Text>
            </View>
            <Switch
              value={settings.streak_enabled}
              onValueChange={value =>
                handleUpdateSetting('streak_enabled', value)
              }
              trackColor={{ false: COLORS.lightGray, true: COLORS.streakFire }}
            />
          </View>

          {settings.streak_enabled && (
            <View style={styles.streakInfo}>
              <Text style={styles.streakInfoText}>
                Current Streak: {streakInfo.current} days 🔥
              </Text>
              <Text style={styles.streakInfoText}>
                Longest Streak: {streakInfo.longest} days 🏆
              </Text>
            </View>
          )}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleResetSettings}
          >
            <Text style={styles.dangerButtonText}>Reset Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleResetStreak}
          >
            <Text style={styles.dangerButtonText}>Reset Streak</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dangerButton, styles.dangerButtonCritical]}
            onPress={handleClearAllData}
          >
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Water Boil Logger</Text>
          <Text style={styles.infoText}>Version 1.0.0</Text>
          <Text style={styles.infoText}>by PrepperCodex</Text>
          <Text style={styles.infoSubtext}>
            "Every boil counts. Track your water."
          </Text>
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
  section: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: 8,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  optionButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  unitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  unitButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  unitButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  goalRow: {
    flexDirection: 'row',
    gap: 12,
  },
  goalInput: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    fontSize: 16,
  },
  goalButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
  },
  goalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLeft: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  streakInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  streakInfoText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  dangerSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.danger,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.danger,
    marginBottom: 12,
  },
  dangerButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.warning,
    marginBottom: 8,
  },
  dangerButtonCritical: {
    backgroundColor: COLORS.danger,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
