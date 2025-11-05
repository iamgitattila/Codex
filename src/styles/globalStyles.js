/**
 * Global styles for Fuel Tracker app
 */
import { StyleSheet } from 'react-native';
import { STATUS_COLORS } from '../constants/fuelData';

export const colors = {
  // Status colors
  statusGood: STATUS_COLORS.good,
  statusApproaching: STATUS_COLORS.approaching,
  statusUrgent: STATUS_COLORS.urgent,
  statusExpired: STATUS_COLORS.expired,

  // Primary colors
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#BBDEFB',

  // Accent colors
  accent: '#FF6B6B',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',

  // Neutral colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  border: '#E0E0E0',
  divider: '#EEEEEE',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: 16,
    color: colors.text,
  },
  bodySmall: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: colors.textLight,
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  scrollContent: {
    padding: spacing.md,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },

  // Buttons
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSuccess: {
    backgroundColor: colors.success,
  },
  buttonWarning: {
    backgroundColor: colors.warning,
  },
  buttonDanger: {
    backgroundColor: colors.accent,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonOutlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Forms
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  inputLabel: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputHelp: {
    ...typography.caption,
    marginTop: spacing.xs,
  },

  // Lists
  listItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  listItemSubtitle: {
    ...typography.bodySmall,
  },
  listItemRight: {
    marginLeft: spacing.sm,
  },

  // Status indicators
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },

  // Headers
  header: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    ...typography.h2,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Alerts
  alert: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertError: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  alertWarning: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  alertSuccess: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  alertText: {
    ...typography.body,
    flex: 1,
  },

  // Empty states
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    ...typography.bodySmall,
    textAlign: 'center',
  },

  // Utility
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
});

export default globalStyles;
