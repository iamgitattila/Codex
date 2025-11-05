/**
 * HistoryScreen - Display all usage history
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { getUsageHistory, getCans } from '../services/storage';
import { colors, spacing, borderRadius, typography, globalStyles } from '../styles/globalStyles';
import { formatFuelType } from '../utils/fuelCalculations';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [cans, setCans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalUsed, setTotalUsed] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    try {
      const usageData = await getUsageHistory();
      const cansData = await getCans();

      // Sort by most recent first
      usageData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setHistory(usageData);
      setCans(cansData);

      // Calculate total fuel used
      const total = usageData.reduce((sum, entry) => sum + entry.gallons_used, 0);
      setTotalUsed(total);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const getCanForEntry = (canId) => {
    return cans.find(c => c.can_id === canId);
  };

  const UsageEntry = ({ entry }) => {
    const can = getCanForEntry(entry.can_id);

    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryDate}>
            {new Date(entry.timestamp).toLocaleDateString()}
          </Text>
          <Text style={styles.entryAmount}>{entry.gallons_used} gal</Text>
        </View>

        {can && (
          <Text style={styles.entryCanInfo}>
            {can.size_gallons} gal {formatFuelType(can.fuel_type)} - {can.storage_location}
          </Text>
        )}

        <View style={styles.entryDetails}>
          <Text style={styles.entryEquipment}>
            {entry.equipment} • {entry.purpose}
          </Text>
        </View>

        {entry.notes && (
          <Text style={styles.entryNotes}>{entry.notes}</Text>
        )}
      </View>
    );
  };

  // Group by month
  const groupByMonth = () => {
    const grouped = {};

    history.forEach(entry => {
      const date = new Date(entry.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          name: monthName,
          entries: [],
          total: 0,
        };
      }

      grouped[monthKey].entries.push(entry);
      grouped[monthKey].total += entry.gallons_used;
    });

    return Object.values(grouped);
  };

  const monthGroups = groupByMonth();

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={globalStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL FUEL USED</Text>
          <Text style={styles.summaryValue}>{totalUsed.toFixed(1)} gallons</Text>
          <Text style={styles.summaryCount}>
            {history.length} usage{history.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* History by Month */}
        {history.length === 0 ? (
          <View style={globalStyles.emptyState}>
            <Text style={globalStyles.emptyStateIcon}>📊</Text>
            <Text style={globalStyles.emptyStateTitle}>No Usage History</Text>
            <Text style={globalStyles.emptyStateText}>
              Usage history will appear here when you log fuel consumption
            </Text>
          </View>
        ) : (
          monthGroups.map((group, index) => (
            <View key={index} style={styles.monthGroup}>
              <View style={styles.monthHeader}>
                <Text style={styles.monthName}>{group.name}</Text>
                <Text style={styles.monthTotal}>{group.total.toFixed(1)} gal</Text>
              </View>

              {group.entries.map((entry) => (
                <UsageEntry key={entry.usage_id} entry={entry} />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryLabel: {
    ...typography.bodySmall,
    color: colors.surface,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  summaryCount: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
  },
  monthGroup: {
    marginBottom: spacing.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  monthName: {
    ...typography.h3,
  },
  monthTotal: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  entryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  entryDate: {
    ...typography.body,
    fontWeight: '600',
  },
  entryAmount: {
    ...typography.body,
    fontWeight: '700',
    color: colors.accent,
  },
  entryCanInfo: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  entryDetails: {
    marginBottom: spacing.xs,
  },
  entryEquipment: {
    ...typography.bodySmall,
    color: colors.text,
  },
  entryNotes: {
    ...typography.caption,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});

export default HistoryScreen;
