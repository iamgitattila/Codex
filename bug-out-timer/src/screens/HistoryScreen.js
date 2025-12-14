/**
 * Bug-Out Timer - History Screen
 * Display list of all past drills
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, DIMENSIONS, MESSAGES } from '../constants';
import { getDrillHistory, deleteDrill } from '../utils/storage';
import { formatTime, formatDrillDate, getRelativeTime } from '../utils/timer';
import sharedStyles from '../styles/shared';

const HistoryScreen = ({ navigation }) => {
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();

    // Reload when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });

    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    setLoading(true);
    const history = await getDrillHistory();
    setDrills(history);
    setLoading(false);
  };

  const handleDrillPress = (drill) => {
    navigation.navigate('DrillDetail', { drill });
  };

  const handleDeleteDrill = (drill) => {
    Alert.alert(
      'Delete Drill',
      MESSAGES.confirmDelete,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteDrill(drill.drill_id);
            if (result.success) {
              loadHistory();
            } else {
              Alert.alert('Error', 'Failed to delete drill.');
            }
          }
        }
      ]
    );
  };

  const renderDrillItem = ({ item }) => {
    const isSuccess = item.tasks_completed === item.tasks_total;
    const isFaster = item.actual_duration_seconds < item.expected_duration_seconds;

    return (
      <TouchableOpacity
        style={styles.drillItem}
        onPress={() => handleDrillPress(item)}
        onLongPress={() => handleDeleteDrill(item)}
      >
        <View style={styles.drillHeader}>
          <Text style={styles.drillScenario}>{item.scenario_name}</Text>
          {isSuccess && <Text style={styles.successBadge}>✓</Text>}
        </View>

        <View style={styles.drillInfo}>
          <View style={styles.drillStat}>
            <Text style={styles.drillStatLabel}>Time:</Text>
            <Text style={[
              styles.drillStatValue,
              isFaster && styles.drillStatValueGood
            ]}>
              {formatTime(item.actual_duration_seconds)}
            </Text>
          </View>

          <View style={styles.drillStat}>
            <Text style={styles.drillStatLabel}>Tasks:</Text>
            <Text style={[
              styles.drillStatValue,
              isSuccess ? styles.drillStatValueGood : styles.drillStatValueBad
            ]}>
              {item.tasks_completed}/{item.tasks_total}
            </Text>
          </View>
        </View>

        <Text style={styles.drillDate}>
          {getRelativeTime(item.start_time)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>📋</Text>
      <Text style={styles.emptyStateText}>{MESSAGES.noDrillHistory}</Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.startButtonText}>Start First Drill</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Drill History</Text>
          {drills.length > 0 && (
            <Text style={styles.subtitle}>
              {drills.length} drill{drills.length !== 1 ? 's' : ''} completed
            </Text>
          )}
        </View>

        {/* Drills List */}
        <FlatList
          data={drills}
          renderItem={renderDrillItem}
          keyExtractor={(item) => item.drill_id}
          contentContainerStyle={drills.length === 0 ? styles.emptyListContainer : styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  headerContainer: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
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

  listContainer: {
    padding: SPACING.lg
  },

  emptyListContainer: {
    flexGrow: 1
  },

  drillItem: {
    backgroundColor: COLORS.surface,
    borderRadius: DIMENSIONS.borderRadius.medium,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3
  },

  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },

  drillScenario: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    flex: 1
  },

  successBadge: {
    fontSize: 20,
    color: COLORS.success
  },

  drillInfo: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.sm
  },

  drillStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs
  },

  drillStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary
  },

  drillStatValue: {
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
  },

  drillStatValueGood: {
    color: COLORS.success
  },

  drillStatValueBad: {
    color: COLORS.warning
  },

  drillDate: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl
  },

  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md
  },

  emptyStateText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg
  },

  startButton: {
    height: DIMENSIONS.buttonHeight.medium,
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: DIMENSIONS.borderRadius.medium,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center'
  },

  startButtonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
  }
});

export default HistoryScreen;
