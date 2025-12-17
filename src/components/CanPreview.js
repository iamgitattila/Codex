/**
 * CanPreview component - displays a preview of a fuel can (used in FIFO queue)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calculateDaysRemaining, getCanStatus, formatFuelType } from '../utils/fuelCalculations';
import { colors, spacing, borderRadius, typography } from '../styles/globalStyles';
import { STATUS_COLORS } from '../constants/fuelData';

const CanPreview = ({ can }) => {
  const daysRemaining = calculateDaysRemaining(can.expiration_date);
  const status = getCanStatus(daysRemaining);
  const statusColor = STATUS_COLORS[status];
  const expirationDate = new Date(can.expiration_date).toLocaleDateString();

  return (
    <View style={[styles.container, { borderColor: statusColor }]}>
      <View style={styles.header}>
        <Text style={styles.size}>{can.size_gallons} Gallon</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>
            {daysRemaining >= 0 ? `${daysRemaining}d` : 'EXPIRED'}
          </Text>
        </View>
      </View>

      <Text style={styles.fuelType}>{formatFuelType(can.fuel_type)}</Text>
      <Text style={styles.location}>📍 {can.storage_location}</Text>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {can.current_contents_gallons.toFixed(1)} gal
        </Text>
        <Text style={styles.footerText}>Expires {expirationDate}</Text>
      </View>

      {can.stabilizer_used && (
        <Text style={styles.stabilizerBadge}>✓ Stabilizer</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  size: {
    ...typography.h3,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.surface,
  },
  fuelType: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  location: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  stabilizerBadge: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
});

export default CanPreview;
