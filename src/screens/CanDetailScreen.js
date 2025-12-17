/**
 * CanDetailScreen - Display detailed information about a fuel can
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { deleteCan, getCanUsageHistory } from '../services/storage';
import {
  calculateDaysRemaining,
  getCanStatus,
  formatFuelType,
} from '../utils/fuelCalculations';
import { colors, spacing, borderRadius, typography, globalStyles } from '../styles/globalStyles';
import { STATUS_COLORS } from '../constants/fuelData';

const CanDetailScreen = ({ route, navigation }) => {
  const { can } = route.params;
  const [usageHistory, setUsageHistory] = useState([]);

  useEffect(() => {
    loadUsageHistory();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUsageHistory();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUsageHistory = async () => {
    const history = await getCanUsageHistory(can.can_id);
    // Sort by most recent first
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setUsageHistory(history);
  };

  const daysRemaining = calculateDaysRemaining(can.expiration_date);
  const status = getCanStatus(daysRemaining);
  const statusColor = STATUS_COLORS[status];

  const handleUseFuel = () => {
    if (can.current_contents_gallons <= 0) {
      Alert.alert('Empty Can', 'This can is empty and cannot be used.');
      return;
    }
    navigation.navigate('UseFuel', { can });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Can',
      'Are you sure you want to delete this fuel can? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCan(can.can_id);
            if (success) {
              navigation.goBack();
            } else {
              Alert.alert('Error', 'Failed to delete can. Please try again.');
            }
          },
        },
      ]
    );
  };

  const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  const UsageEntry = ({ entry }) => (
    <View style={styles.usageEntry}>
      <View style={styles.usageHeader}>
        <Text style={styles.usageDate}>
          {new Date(entry.timestamp).toLocaleDateString()}
        </Text>
        <Text style={styles.usageAmount}>{entry.gallons_used} gal</Text>
      </View>
      <Text style={styles.usageEquipment}>
        {entry.equipment} - {entry.purpose}
      </Text>
      {entry.notes && <Text style={styles.usageNotes}>{entry.notes}</Text>}
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <ScrollView style={globalStyles.content}>
        {/* Status Card */}
        <View style={[styles.statusCard, { borderColor: statusColor }]}>
          <Text style={styles.statusTitle}>
            {can.size_gallons} gal {formatFuelType(can.fuel_type)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusBadgeText}>
              {daysRemaining >= 0 ? `${daysRemaining} days remaining` : 'EXPIRED'}
            </Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Details</Text>

          <DetailRow label="Location:" value={can.storage_location} />
          <DetailRow
            label="Current Contents:"
            value={`${can.current_contents_gallons.toFixed(1)} gal`}
          />
          <DetailRow
            label="Condition:"
            value={can.condition.charAt(0).toUpperCase() + can.condition.slice(1)}
          />
          <DetailRow
            label="Purchased:"
            value={new Date(can.purchase_date).toLocaleDateString()}
          />
          <DetailRow
            label="Stabilizer:"
            value={can.stabilizer_used ? 'Yes' : 'No'}
          />
          <DetailRow
            label="Expires:"
            value={new Date(can.expiration_date).toLocaleDateString()}
          />
          <DetailRow label="Equipment:" value={can.equipment_use} />

          {can.notes && (
            <>
              <View style={styles.divider} />
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{can.notes}</Text>
            </>
          )}
        </View>

        {/* Usage History */}
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>
            Usage History ({usageHistory.length})
          </Text>

          {usageHistory.length === 0 ? (
            <View style={styles.emptyUsage}>
              <Text style={styles.emptyUsageText}>No usage recorded yet</Text>
            </View>
          ) : (
            usageHistory.map((entry) => (
              <UsageEntry key={entry.usage_id} entry={entry} />
            ))
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              globalStyles.button,
              globalStyles.buttonDanger,
              styles.actionButton,
              can.current_contents_gallons <= 0 && styles.actionButtonDisabled,
            ]}
            onPress={handleUseFuel}
            disabled={can.current_contents_gallons <= 0}
          >
            <Text style={globalStyles.buttonText}>USE FUEL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.buttonOutline, styles.actionButton]}
            onPress={handleDelete}
          >
            <Text style={[globalStyles.buttonOutlineText, { color: colors.error }]}>
              DELETE CAN
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    ...typography.h2,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statusBadgeText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.surface,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.body,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  notesLabel: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  notesText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyUsage: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyUsageText: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  usageEntry: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  usageDate: {
    ...typography.body,
    fontWeight: '600',
  },
  usageAmount: {
    ...typography.body,
    fontWeight: '700',
    color: colors.accent,
  },
  usageEquipment: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  usageNotes: {
    ...typography.caption,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  actions: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
});

export default CanDetailScreen;
