/**
 * AlertBanner component - displays an alert for a fuel can
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getAlertMessage, formatFuelType } from '../utils/fuelCalculations';
import { colors, spacing, borderRadius, typography } from '../styles/globalStyles';
import { STATUS_COLORS } from '../constants/fuelData';
import { AlertTypes } from '../types';

const AlertBanner = ({ alert, onPress }) => {
  const { can, alert_type, days_remaining } = alert;
  const statusColor = STATUS_COLORS[alert_type];
  const message = getAlertMessage(alert_type, can.expiration_date);

  const getIcon = () => {
    switch (alert_type) {
      case AlertTypes.EXPIRED:
        return '⛔';
      case AlertTypes.URGENT:
        return '🔴';
      case AlertTypes.APPROACHING:
        return '🟡';
      default:
        return '🟢';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: statusColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{getIcon()}</Text>

      <View style={styles.content}>
        <Text style={styles.canInfo}>
          {can.size_gallons} gal {formatFuelType(can.fuel_type)} - {can.storage_location}
        </Text>
        <Text style={[styles.message, { color: statusColor }]}>{message}</Text>
        {days_remaining >= 0 && (
          <Text style={styles.daysRemaining}>
            {days_remaining === 0 ? 'Expires today' : `${days_remaining} days remaining`}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: statusColor }]}
        onPress={onPress}
      >
        <Text style={styles.actionText}>View</Text>
      </TouchableOpacity>
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
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  canInfo: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  daysRemaining: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  actionText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.surface,
  },
});

export default AlertBanner;
