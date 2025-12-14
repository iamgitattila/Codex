/**
 * Bug-Out Timer - Drill Detail Screen
 * Shows detailed information about a completed drill
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, DIMENSIONS } from '../constants';
import { formatTime, formatDrillDate, calculateAccuracy } from '../utils/timer';
import { getScenarioById } from '../scenarios';
import sharedStyles from '../styles/shared';

const DrillDetailScreen = ({ route, navigation }) => {
  const { drill } = route.params;

  // Get full scenario data
  const scenario = getScenarioById(drill.scenario_id);

  // Calculate accuracy
  const accuracy = calculateAccuracy(
    drill.expected_duration_seconds,
    drill.actual_duration_seconds
  );

  // Separate completed and incomplete tasks
  const completedTaskIds = scenario.tasks
    .filter(task => !drill.incomplete_tasks.includes(task.id))
    .map(task => task.id);

  const completedTasks = scenario.tasks.filter(task =>
    completedTaskIds.includes(task.id)
  );

  const incompleteTasks = scenario.tasks.filter(task =>
    drill.incomplete_tasks.includes(task.id)
  );

  const isSuccess = drill.tasks_completed === drill.tasks_total;

  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{drill.scenario_name}</Text>
          <Text style={styles.subtitle}>
            {formatDrillDate(drill.start_time)}
          </Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>
              {isSuccess ? '✅ Success' : '⚠️ Incomplete'}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Time Taken:</Text>
            <Text style={styles.statValue}>
              {formatTime(drill.actual_duration_seconds)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Expected Time:</Text>
            <Text style={styles.statValue}>
              {formatTime(drill.expected_duration_seconds)}
            </Text>
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
              {accuracy.message}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tasks Completed:</Text>
            <Text
              style={[
                styles.statValue,
                isSuccess ? styles.statValueGood : styles.statValueBad
              ]}
            >
              {drill.tasks_completed} / {drill.tasks_total}
            </Text>
          </View>

          {drill.sms_sent && (
            <View style={styles.smsBadge}>
              <Text style={styles.smsBadgeText}>
                📱 SMS Alert Sent
              </Text>
            </View>
          )}
        </View>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>
              ✅ Completed Tasks ({completedTasks.length})
            </Text>
            {completedTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <Text style={styles.taskNumber}>{task.id}</Text>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDetails}>
                    📍 {task.location} • ⏱ {Math.floor(task.duration / 60)}min {task.duration % 60}s
                  </Text>
                </View>
                <Text style={styles.taskCheck}>✓</Text>
              </View>
            ))}
          </View>
        )}

        {/* Incomplete Tasks */}
        {incompleteTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, styles.sectionHeaderWarning]}>
              ⚠️ Incomplete Tasks ({incompleteTasks.length})
            </Text>
            {incompleteTasks.map((task) => (
              <View key={task.id} style={[styles.taskItem, styles.taskItemIncomplete]}>
                <Text style={styles.taskNumber}>{task.id}</Text>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDetails}>
                    📍 {task.location} • ⏱ {Math.floor(task.duration / 60)}min {task.duration % 60}s
                  </Text>
                </View>
                <Text style={styles.taskCross}>✗</Text>
              </View>
            ))}
          </View>
        )}

        {/* Drill Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Drill ID:</Text>
          <Text style={styles.infoValue}>{drill.drill_id}</Text>
        </View>

        {drill.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{drill.notes}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg
  },

  headerContainer: {
    marginBottom: SPACING.xl
  },

  backButton: {
    marginBottom: SPACING.md
  },

  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.fontWeight.bold
  },

  title: {
    fontSize: TYPOGRAPHY.fontSize.header,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },

  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary
  },

  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: DIMENSIONS.borderRadius.large,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5
  },

  summaryHeader: {
    marginBottom: SPACING.md
  },

  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.sectionHeader,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },

  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary
  },

  statValue: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
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

  smsBadge: {
    backgroundColor: COLORS.info,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: DIMENSIONS.borderRadius.small,
    alignSelf: 'flex-start',
    marginTop: SPACING.md
  },

  smsBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
  },

  section: {
    marginBottom: SPACING.lg
  },

  sectionHeader: {
    fontSize: TYPOGRAPHY.fontSize.sectionHeader,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md
  },

  sectionHeaderWarning: {
    color: COLORS.warning
  },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: DIMENSIONS.borderRadius.medium,
    marginBottom: SPACING.sm
  },

  taskItemIncomplete: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.warning
  },

  taskNumber: {
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
    minWidth: 24
  },

  taskContent: {
    flex: 1
  },

  taskTitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },

  taskDetails: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary
  },

  taskCheck: {
    fontSize: 20,
    color: COLORS.success,
    marginLeft: SPACING.md
  },

  taskCross: {
    fontSize: 20,
    color: COLORS.warning,
    marginLeft: SPACING.md
  },

  infoSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: DIMENSIONS.borderRadius.medium,
    marginBottom: SPACING.lg
  },

  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },

  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textPrimary,
    fontFamily: 'monospace'
  },

  notesSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: DIMENSIONS.borderRadius.medium,
    marginBottom: SPACING.lg
  },

  notesLabel: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold
  },

  notesText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary,
    lineHeight: TYPOGRAPHY.fontSize.body * TYPOGRAPHY.lineHeight.relaxed
  }
});

export default DrillDetailScreen;
