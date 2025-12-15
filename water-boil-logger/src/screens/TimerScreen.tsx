// Water Boil Logger - Timer Screen

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import { formatTime } from '../utils/calculations';
import { getSettings } from '../services/StorageService';
import {
  scheduleTimerCompleteNotification,
  cancelNotification,
} from '../services/NotificationService';
import { useKeepAwake } from 'expo-keep-awake';

type Props = NativeStackScreenProps<RootStackParamList, 'Timer'>;

export default function TimerScreen({ navigation }: Props) {
  useKeepAwake(); // Keep screen on during timer

  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [initialTime, setInitialTime] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  const boilStartTimeRef = useRef<Date>(new Date());

  useEffect(() => {
    loadSettings();
    return () => {
      // Cleanup on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (notificationIdRef.current) {
        cancelNotification(notificationIdRef.current);
      }
    };
  }, []);

  const loadSettings = async () => {
    const settings = await getSettings();
    setTimeRemaining(settings.boil_duration_seconds);
    setInitialTime(settings.boil_duration_seconds);

    // Schedule notification
    if (settings.notification_enabled) {
      const notifId = await scheduleTimerCompleteNotification(
        settings.boil_duration_seconds
      );
      if (notifId) {
        notificationIdRef.current = notifId;
      }
    }
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    // Navigate to volume logger
    setTimeout(() => {
      navigation.replace('VolumeLogger', {
        boilTime: boilStartTimeRef.current,
      });
    }, 500);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Timer',
      'Are you sure you want to skip? Water should boil for the full duration.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip Anyway',
          style: 'destructive',
          onPress: () => {
            setIsRunning(false);
            if (notificationIdRef.current) {
              cancelNotification(notificationIdRef.current);
            }
            navigation.replace('VolumeLogger', {
              boilTime: boilStartTimeRef.current,
            });
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert('Cancel Timer', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          setIsRunning(false);
          if (notificationIdRef.current) {
            cancelNotification(notificationIdRef.current);
          }
          navigation.goBack();
        },
      },
    ]);
  };

  const progress = ((initialTime - timeRemaining) / initialTime) * 100;
  const isWarning = timeRemaining < 10;
  const isComplete = timeRemaining === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🫖 BOILING WATER</Text>

      <View
        style={[
          styles.timerDisplay,
          isWarning && styles.timerWarning,
          isComplete && styles.timerComplete,
        ]}
      >
        <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
        <Text style={styles.timerLabel}>
          {isComplete ? 'Complete!' : isPaused ? 'Paused' : 'Remaining'}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Boiling for {Math.floor(initialTime / 60)} minute
          {initialTime > 60 ? 's' : ''}
        </Text>
        <Text style={styles.infoSubtext}>
          Standard: 1 minute kills most pathogens
        </Text>
        <Text style={styles.infoSubtext}>
          Keep at rolling boil for full duration
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handlePauseResume}
          disabled={isComplete}
        >
          <Text style={styles.buttonText}>
            {isPaused ? '▶️ RESUME' : '⏸ PAUSE'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={handleSkip}
          disabled={isComplete}
        >
          <Text style={styles.buttonText}>⏭ SKIP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleCancel}
        >
          <Text style={styles.buttonText}>✖️ CANCEL</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ℹ️ Screen stays on during boil
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.text,
    marginBottom: 40,
  },
  timerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 40,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  timerWarning: {
    borderColor: COLORS.warning,
  },
  timerComplete: {
    borderColor: COLORS.success,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  timerLabel: {
    fontSize: 18,
    color: COLORS.textLight,
    marginTop: 8,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.progressFill,
  },
  progressText: {
    textAlign: 'right',
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'column',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  warningButton: {
    backgroundColor: COLORS.warning,
  },
  dangerButton: {
    backgroundColor: COLORS.danger,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
