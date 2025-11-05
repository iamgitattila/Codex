// Water Boil Logger - Volume Logger Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, BoilLog, QUICK_VOLUMES } from '../types';
import { COLORS, PERSON_OPTIONS } from '../constants';
import {
  addBoilLog,
  getSettings,
  getStreaks,
  updateStreaks,
} from '../services/StorageService';
import { generateId } from '../services/StorageService';
import { ozToLiters } from '../utils/calculations';
import { calculateStreak, getDateString } from '../utils/calculations';
import { getBoilLogs } from '../services/StorageService';
import {
  sendGoalReachedNotification,
  sendStreakMilestoneNotification,
} from '../services/NotificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'VolumeLogger'>;

export default function VolumeLoggerScreen({ navigation, route }: Props) {
  const { boilTime } = route.params;

  const [customVolume, setCustomVolume] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<'oz' | 'liters'>('oz');
  const [selectedPerson, setSelectedPerson] = useState<string>('Me');
  const [notes, setNotes] = useState<string>('');
  const [dailyGoal, setDailyGoal] = useState<number>(64);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getSettings();
    setSelectedUnit(settings.volume_unit);
    setDailyGoal(settings.daily_goal_oz);
  };

  const handleLogVolume = async (volumeOz: number) => {
    if (volumeOz <= 0) {
      Alert.alert('Invalid Volume', 'Please enter a volume greater than 0');
      return;
    }

    try {
      const log: BoilLog = {
        log_id: generateId(),
        timestamp: new Date().toISOString(),
        volume_oz: Math.round(volumeOz * 100) / 100,
        volume_liters: ozToLiters(volumeOz),
        boil_duration_seconds: 60,
        person: selectedPerson,
        notes: notes.trim(),
      };

      await addBoilLog(log);

      // Update streaks
      const logs = await getBoilLogs();
      const streaks = await getStreaks();
      const settings = await getSettings();

      const newStreaks = calculateStreak(
        logs,
        settings.daily_goal_oz,
        streaks.current_streak,
        streaks.last_logged_date,
        streaks.streak_started_date
      );

      await updateStreaks(newStreaks);

      // Check if goal reached
      const today = getDateString();
      const todayLogs = logs.filter(l => l.timestamp.split('T')[0] === today);
      const todayTotal = todayLogs.reduce((sum, l) => sum + l.volume_oz, 0);

      if (todayTotal >= dailyGoal && todayTotal - volumeOz < dailyGoal) {
        await sendGoalReachedNotification();
      }

      // Check streak milestones
      const streakMilestones = [3, 7, 14, 30, 60, 100];
      if (streakMilestones.includes(newStreaks.current_streak)) {
        await sendStreakMilestoneNotification(newStreaks.current_streak);
      }

      Alert.alert(
        '✓ Logged',
        `${volumeOz.toFixed(1)} oz logged for ${selectedPerson}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (error) {
      console.error('Error logging volume:', error);
      Alert.alert('Error', 'Failed to log volume. Please try again.');
    }
  };

  const handleQuickLog = (volumeOz: number) => {
    handleLogVolume(volumeOz);
  };

  const handleCustomLog = () => {
    const volume = parseFloat(customVolume);

    if (isNaN(volume) || volume <= 0) {
      Alert.alert('Invalid Volume', 'Please enter a valid number greater than 0');
      return;
    }

    const volumeOz = selectedUnit === 'oz' ? volume : volume * 33.814;
    handleLogVolume(volumeOz);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>💧 LOG VOLUME</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick volumes:</Text>
          <View style={styles.quickButtonsGrid}>
            {QUICK_VOLUMES.map(vol => (
              <TouchableOpacity
                key={vol}
                style={styles.volumeButton}
                onPress={() => handleQuickLog(vol)}
              >
                <Text style={styles.volumeButtonText}>{vol} oz</Text>
                <Text style={styles.volumeButtonSubtext}>
                  {ozToLiters(vol).toFixed(2)}L
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Custom volume:</Text>
          <View style={styles.customInputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter volume"
              keyboardType="decimal-pad"
              value={customVolume}
              onChangeText={setCustomVolume}
            />
            <View style={styles.unitButtons}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  selectedUnit === 'oz' && styles.unitButtonActive,
                ]}
                onPress={() => setSelectedUnit('oz')}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    selectedUnit === 'oz' && styles.unitButtonTextActive,
                  ]}
                >
                  oz
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  selectedUnit === 'liters' && styles.unitButtonActive,
                ]}
                onPress={() => setSelectedUnit('liters')}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    selectedUnit === 'liters' && styles.unitButtonTextActive,
                  ]}
                >
                  liters
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleCustomLog}
          >
            <Text style={styles.submitButtonText}>SUBMIT CUSTOM</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Who drank:</Text>
          <View style={styles.personGrid}>
            {PERSON_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.personButton,
                  selectedPerson === option.value && styles.personButtonActive,
                ]}
                onPress={() => setSelectedPerson(option.value)}
              >
                <Text
                  style={[
                    styles.personButtonText,
                    selectedPerson === option.value &&
                      styles.personButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes (optional):</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g., morning hydration, post-exercise"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.text,
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  quickButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  volumeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  volumeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  volumeButtonSubtext: {
    fontSize: 14,
    color: COLORS.white,
    marginTop: 4,
    opacity: 0.8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  unitButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  unitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  unitButtonTextActive: {
    color: COLORS.white,
  },
  submitButton: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  personGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  personButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  personButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  personButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  personButtonTextActive: {
    color: COLORS.white,
  },
  notesInput: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
