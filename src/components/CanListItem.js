/**
 * CanListItem component - displays a fuel can in a list
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { calculateDaysRemaining, getCanStatus, formatFuelType } from '../utils/fuelCalculations';
import { colors, spacing, borderRadius, typography } from '../styles/globalStyles';
import { STATUS_COLORS } from '../constants/fuelData';

const CanListItem = ({ can, onPress }) => {
  const daysRemaining = calculateDaysRemaining(can.expiration_date);
  const status = getCanStatus(daysRemaining);
  const statusColor = STATUS_COLORS[status];
  const expirationDate = new Date(can.expiration_date).toLocaleDateString();

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: statusColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
        <View style={styles.content}>
          <Text style={styles.title}>
            {can.size_gallons} gal {formatFuelType(can.fuel_type)}
          </Text>
          <Text style={styles.location}>{can.storage_location}</Text>
          <Text style={styles.contents}>
            {can.current_contents_gallons.toFixed(1)} gal remaining
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.expiry}>
          {daysRemaining >= 0 ? `${daysRemaining}d` : 'Expired'}
        </Text>
        <Text style={styles.expiryDate}>{expirationDate}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  location: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  contents: {
    ...typography.caption,
    color: colors.textLight,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },
  expiry: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  expiryDate: {
    ...typography.caption,
    color: colors.textLight,
  },
});

export default CanListItem;
