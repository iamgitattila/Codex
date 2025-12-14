/**
 * Bug-Out Timer - Drill Complete Screen
 * Shows drill results, plays alarm, and offers SMS/save options
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { COLORS, TYPOGRAPHY, SPACING, DIMENSIONS, TIMING, MESSAGES } from '../constants';
import {
  formatTime,
  calculateAccuracy,
  createDrillData
} from '../utils/timer';
import { saveDrill } from '../utils/storage';
import { sendEvacuationSms, isSmsAvailable } from '../utils/sms';
import { getEnabledSmsContacts } from '../utils/storage';
import sharedStyles from '../styles/shared';

const DrillCompleteScreen = ({ route, navigation }) => {
  const { scenario, startTime, endTime, completedTasks } = route.params;

  const [drillSaved, setDrillSaved] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [isFlashing, setIsFlashing] = useState(true);

  // Animation for red flash
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Play alarm sound and haptic feedback
    playAlarm();
    triggerHapticFeedback();

    // Start flashing animation
    startFlashAnimation();

    // Stop flashing after 5 seconds
    const flashTimeout = setTimeout(() => {
      setIsFlashing(false);
    }, 5000);

    return () => {
      clearTimeout(flashTimeout);
    };
  }, []);

  const playAlarm = async () => {
    try {
      // Note: In production, you would load an actual alarm sound file
      // For now, this is a placeholder
      // const { sound } = await Audio.Sound.createAsync(
      //   require('../assets/sounds/alarm.mp3')
      // );
      // await sound.playAsync();
      console.log('Alarm would play here');
    } catch (error) {
      console.error('Error playing alarm:', error);
    }
  };

  const triggerHapticFeedback = () => {
    // Strong vibration pattern
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 500);
  };

  const startFlashAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: TIMING.flashInterval,
          useNativeDriver: false
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: TIMING.flashInterval,
          useNativeDriver: false
        })
      ])
    ).start();
  };

  const handleSaveDrill = async () => {
    const drillData = createDrillData(
      scenario,
      startTime,
      endTime,
      completedTasks,
      smsSent
    );

    const result = await saveDrill(drillData);

    if (result.success) {
      setDrillSaved(true);
      Alert.alert('Drill Saved', 'Your drill has been saved to history.');
    } else {
      Alert.alert('Error', 'Failed to save drill. Please try again.');
    }
  };

  const handleSendSms = async () => {
    // Check if SMS is available
    const available = await isSmsAvailable();
    if (!available) {
      Alert.alert('SMS Not Available', MESSAGES.errorSms);
      return;
    }

    // Get enabled contacts
    const contacts = await getEnabledSmsContacts();

    if (contacts.length === 0) {
      Alert.alert(
        'No Contacts',
        'Please add emergency contacts in Settings before sending SMS.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Go to Settings',
            onPress: () => navigation.navigate('Settings')
          }
        ]
      );
      return;
    }

    // Send SMS
    const result = await sendEvacuationSms(contacts);

    if (result.success) {
      setSmsSent(true);
      Alert.alert(
        'SMS Sent',
        `Evacuation alert sent to ${result.recipientCount} contact(s).`
      );
    } else {
      Alert.alert('SMS Error', result.error || 'Failed to send SMS.');
    }
  };

  const handleGoHome = async () => {
    // Auto-save if not already saved
    if (!drillSaved) {
      await handleSaveDrill();
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }]
    });
  };

  // Calculate drill stats
  const actualDuration = Math.floor((endTime - startTime) / 1000);
  const accuracy = calculateAccuracy(scenario.duration, actualDuration);
  const incompleteTasks = scenario.tasks.filter(
    task => !completedTasks.includes(task.id)
  );

  // Background color interpolation for flash effect
  const backgroundColor = isFlashing
    ? flashAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [COLORS.background, COLORS.error]
      })
    : COLORS.background;

  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <Animated.View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerEmoji}>🎯</Text>
          <Text style={styles.headerText}>DRILL COMPLETE</Text>
        </View>

        {/* Stats Box */}
        <View style={styles.statsBox}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Time Taken:</Text>
            <Text style={styles.statValue}>{formatTime(actualDuration)}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Expected:</Text>
            <Text style={styles.statValue}>{formatTime(scenario.duration)}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Performance:</Text>
            <Text
              style={[
                styles.statValue,
                accuracy.status === 'faster' && styles.statValueGood,
                accuracy.status === 'slower' && styles.statValueBad
              ]}
            >
              {accuracy.status === 'faster' && '✅ '}
              {accuracy.status === 'slower' && '⚠️ '}
              {accuracy.status === 'exact' && '🎯 '}
              {accuracy.message}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tasks Completed:</Text>
            <Text style={styles.statValue}>
              {completedTasks.length} / {scenario.tasks.length}
            </Text>
          </View>

          {incompleteTasks.length > 0 && (
            <>
              <View style={styles.incompleteSection}>
                <Text style={styles.incompleteHeader}>
                  ⚠️ Incomplete Tasks:
                </Text>
                {incompleteTasks.map(task => (
                  <Text key={task.id} style={styles.incompleteTask}>
                    • {task.title}
                  </Text>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSms]}
            onPress={handleSendSms}
            disabled={smsSent}
          >
            <Text style={styles.buttonText}>
              {smsSent ? '✅ SMS SENT' : '🚨 SEND EVACUATION SMS'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSave]}
            onPress={handleSaveDrill}
            disabled={drillSaved}
          >
            <Text style={styles.buttonText}>
              {drillSaved ? '✅ DRILL SAVED' : '💾 SAVE DRILL'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonHome]}
            onPress={handleGoHome}
          >
            <Text style={styles.buttonText}>🏠 HOME</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center'
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl
  },

  headerEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md
  },

  headerText: {
    fontSize: TYPOGRAPHY.fontSize.header + 4,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    letterSpacing: 2
  },

  statsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: DIMENSIONS.borderRadius.large,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },

  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
    flex: 1
  },

  statValue: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right'
  },

  statValueGood: {
    color: COLORS.success
  },

  statValueBad: {
    color: COLORS.warning
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md
  },

  incompleteSection: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: DIMENSIONS.borderRadius.medium
  },

  incompleteHeader: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.warning,
    marginBottom: SPACING.sm
  },

  incompleteTask: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },

  buttonsContainer: {
    gap: SPACING.md
  },

  button: {
    height: DIMENSIONS.buttonHeight.medium,
    borderRadius: DIMENSIONS.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },

  buttonSms: {
    backgroundColor: COLORS.error
  },

  buttonSave: {
    backgroundColor: COLORS.success
  },

  buttonHome: {
    backgroundColor: COLORS.buttonSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight
  },

  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
  }
});

export default DrillCompleteScreen;
