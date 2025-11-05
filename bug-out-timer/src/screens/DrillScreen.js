/**
 * Bug-Out Timer - Drill Screen
 * Active drill with countdown timer, task checklist, and controls
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, DIMENSIONS, TIMING } from '../constants';
import { formatTime, isCriticalTime, DrillTimer } from '../utils/timer';
import sharedStyles from '../styles/shared';

const DrillScreen = ({ route, navigation }) => {
  const { scenario } = route.params;

  // Timer state
  const [remainingSeconds, setRemainingSeconds] = useState(scenario.duration);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Task state
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);

  // Timer ref
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Animation values
  const taskSlideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Keep screen awake during drill
    activateKeepAwakeAsync();

    // Initialize and start timer
    timerRef.current = new DrillTimer(
      scenario.duration,
      handleTimerTick,
      handleTimerComplete
    );
    timerRef.current.start();

    // Cleanup
    return () => {
      deactivateKeepAwake();
      if (timerRef.current) {
        timerRef.current.stop();
      }
    };
  }, []);

  // Animate task card on mount
  useEffect(() => {
    Animated.spring(taskSlideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();
  }, [currentTaskIndex]);

  const handleTimerTick = (remaining) => {
    setRemainingSeconds(remaining);

    // Update progress animation
    const progress = ((scenario.duration - remaining) / scenario.duration) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: TIMING.animation.fast,
      useNativeDriver: false
    }).start();
  };

  const handleTimerComplete = () => {
    setIsComplete(true);
    deactivateKeepAwake();

    // Navigate to completion screen
    navigation.replace('DrillComplete', {
      scenario,
      startTime: startTimeRef.current,
      endTime: Date.now(),
      completedTasks
    });
  };

  const handleTaskComplete = () => {
    const currentTask = scenario.tasks[currentTaskIndex];

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Add to completed tasks
    setCompletedTasks([...completedTasks, currentTask.id]);

    // Animate out and move to next task
    Animated.timing(taskSlideAnim, {
      toValue: 0,
      duration: TIMING.animation.normal,
      useNativeDriver: true
    }).start(() => {
      if (currentTaskIndex < scenario.tasks.length - 1) {
        setCurrentTaskIndex(currentTaskIndex + 1);
        taskSlideAnim.setValue(0);
      }
    });
  };

  const handleSkipTask = () => {
    if (currentTaskIndex < scenario.tasks.length - 1) {
      Animated.timing(taskSlideAnim, {
        toValue: 0,
        duration: TIMING.animation.fast,
        useNativeDriver: true
      }).start(() => {
        setCurrentTaskIndex(currentTaskIndex + 1);
        taskSlideAnim.setValue(0);
      });
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      timerRef.current?.resume();
      setIsPaused(false);
    } else {
      timerRef.current?.pause();
      setIsPaused(true);
    }
  };

  const handleAbort = () => {
    Alert.alert(
      'Abort Drill?',
      'Are you sure you want to abort this drill? Progress will not be saved.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Abort',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) {
              timerRef.current.stop();
            }
            deactivateKeepAwake();
            navigation.goBack();
          }
        }
      ]
    );
  };

  const currentTask = scenario.tasks[currentTaskIndex];
  const isCritical = isCriticalTime(remainingSeconds);
  const tasksCompleted = completedTasks.length;
  const tasksTotal = scenario.tasks.length;
  const progressPercentage = (tasksCompleted / tasksTotal) * 100;

  // Determine background color (red when critical)
  const backgroundColor = isCritical ? COLORS.error : COLORS.background;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={styles.container}>
        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={[
            styles.timerText,
            isCritical && styles.timerTextCritical
          ]}>
            {formatTime(remainingSeconds)}
          </Text>
          <Text style={styles.scenarioLabel}>{scenario.name.toUpperCase()}</Text>
          {isPaused && (
            <View style={styles.pausedBadge}>
              <Text style={styles.pausedText}>⏸ PAUSED</Text>
            </View>
          )}
        </View>

        {/* Task Card */}
        <Animated.View
          style={[
            styles.taskSection,
            {
              opacity: taskSlideAnim,
              transform: [{
                translateY: taskSlideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }]
            }
          ]}
        >
          <Text style={styles.taskCounter}>
            Task {currentTaskIndex + 1} / {tasksTotal}
          </Text>

          {currentTask && (
            <View style={styles.taskCard}>
              <Text style={styles.taskEmoji}>
                {getCategoryEmoji(currentTask.category)}
              </Text>
              <Text style={styles.taskTitle}>{currentTask.title}</Text>
              <Text style={styles.taskLocation}>📍 {currentTask.location}</Text>
              <Text style={styles.taskDuration}>
                ⏱ Est. {Math.floor(currentTask.duration / 60)}min {currentTask.duration % 60}s
              </Text>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => Alert.alert('Task Details', currentTask.details)}
              >
                <Text style={styles.detailsButtonText}>ℹ️ Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleTaskComplete}
                activeOpacity={0.8}
              >
                <Text style={styles.completeButtonText}>✓ COMPLETE TASK</Text>
              </TouchableOpacity>
            </View>
          )}

          {!currentTask && (
            <View style={styles.taskCard}>
              <Text style={styles.allTasksComplete}>
                🎯 All tasks completed!
              </Text>
              <Text style={styles.allTasksCompleteSubtext}>
                Wait for timer or finish early
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: progressWidth }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {tasksCompleted} / {tasksTotal} tasks completed
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePauseResume}
          >
            <Text style={styles.controlButtonText}>
              {isPaused ? '▶️ RESUME' : '⏸ PAUSE'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.controlButtonSecondary]}
            onPress={handleSkipTask}
            disabled={!currentTask}
          >
            <Text style={styles.controlButtonText}>⏭ SKIP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.controlButtonDanger]}
            onPress={handleAbort}
          >
            <Text style={styles.controlButtonText}>❌ ABORT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Helper function to get emoji for task category
const getCategoryEmoji = (category) => {
  const emojiMap = {
    gear: '🎒',
    communication: '📱',
    transportation: '🚗',
    security: '🔒',
    evacuation: '🚪',
    utilities: '⚡',
    documents: '📄',
    medical: '💊',
    data: '💻',
    valuables: '💎',
    documentation: '📸',
    planning: '🗺️',
    coordination: '🤝',
    childcare: '👶',
    pets: '🐾',
    electronics: '🔌',
    supplies: '📦',
    safety: '🛡️'
  };

  return emojiMap[category] || '📋';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg
  },

  timerContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl
  },

  timerText: {
    fontSize: TYPOGRAPHY.fontSize.timer,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums']
  },

  timerTextCritical: {
    color: COLORS.error,
    textShadowColor: COLORS.error,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10
  },

  scenarioLabel: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    letterSpacing: 2
  },

  pausedBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: DIMENSIONS.borderRadius.small,
    marginTop: SPACING.md
  },

  pausedText: {
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background
  },

  taskSection: {
    flex: 1,
    marginBottom: SPACING.lg
  },

  taskCounter: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: 'center'
  },

  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: DIMENSIONS.borderRadius.large,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8
  },

  taskEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md
  },

  taskTitle: {
    fontSize: TYPOGRAPHY.fontSize.taskTitle,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center'
  },

  taskLocation: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },

  taskDuration: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md
  },

  detailsButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: DIMENSIONS.borderRadius.small,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg
  },

  detailsButtonText: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary
  },

  completeButton: {
    width: '100%',
    height: DIMENSIONS.buttonHeight.large,
    backgroundColor: COLORS.buttonSuccess,
    borderRadius: DIMENSIONS.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center'
  },

  completeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
  },

  allTasksComplete: {
    fontSize: TYPOGRAPHY.fontSize.sectionHeader,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.success,
    marginBottom: SPACING.sm,
    textAlign: 'center'
  },

  allTasksCompleteSubtext: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },

  progressSection: {
    marginBottom: SPACING.lg
  },

  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: DIMENSIONS.borderRadius.small,
    overflow: 'hidden',
    marginBottom: SPACING.sm
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.success
  },

  progressText: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },

  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm
  },

  controlButton: {
    flex: 1,
    height: DIMENSIONS.buttonHeight.medium,
    backgroundColor: COLORS.buttonSecondary,
    borderRadius: DIMENSIONS.borderRadius.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center'
  },

  controlButtonSecondary: {
    backgroundColor: COLORS.buttonSecondary
  },

  controlButtonDanger: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error
  },

  controlButtonText: {
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
  }
});

export default DrillScreen;
