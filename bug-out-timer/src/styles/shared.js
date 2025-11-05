/**
 * Bug-Out Timer - Shared Styles
 * Common styles used across all screens and components
 */

import { StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, DIMENSIONS } from '../constants';

export const sharedStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.md
  },

  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  },

  // Headers
  header: {
    fontSize: TYPOGRAPHY.fontSize.header,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md
  },

  sectionHeader: {
    fontSize: TYPOGRAPHY.fontSize.sectionHeader,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md
  },

  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg
  },

  // Text
  bodyText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary,
    lineHeight: TYPOGRAPHY.fontSize.body * TYPOGRAPHY.lineHeight.normal
  },

  smallText: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.fontSize.small * TYPOGRAPHY.lineHeight.normal
  },

  boldText: {
    fontWeight: TYPOGRAPHY.fontWeight.bold
  },

  // Buttons
  buttonPrimary: {
    height: DIMENSIONS.buttonHeight.medium,
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: DIMENSIONS.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg
  },

  buttonSecondary: {
    height: DIMENSIONS.buttonHeight.small,
    backgroundColor: COLORS.buttonSecondary,
    borderRadius: DIMENSIONS.borderRadius.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg
  },

  buttonSuccess: {
    height: DIMENSIONS.buttonHeight.medium,
    backgroundColor: COLORS.buttonSuccess,
    borderRadius: DIMENSIONS.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg
  },

  buttonDanger: {
    height: DIMENSIONS.buttonHeight.medium,
    backgroundColor: COLORS.buttonDanger,
    borderRadius: DIMENSIONS.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg
  },

  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
  },

  buttonTextSecondary: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary
  },

  // Cards
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: DIMENSIONS.borderRadius.medium,
    padding: SPACING.md,
    marginBottom: SPACING.md
  },

  cardElevated: {
    backgroundColor: COLORS.surface,
    borderRadius: DIMENSIONS.borderRadius.medium,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },

  // Inputs
  input: {
    height: DIMENSIONS.inputHeight,
    backgroundColor: COLORS.surface,
    borderRadius: DIMENSIONS.borderRadius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary
  },

  inputFocused: {
    borderColor: COLORS.accent
  },

  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold
  },

  // Lists
  listItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  listItemLast: {
    borderBottomWidth: 0
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md
  },

  dividerThick: {
    height: 2,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.lg
  },

  // Spacing utilities
  marginTopSm: {
    marginTop: SPACING.sm
  },

  marginTopMd: {
    marginTop: SPACING.md
  },

  marginTopLg: {
    marginTop: SPACING.lg
  },

  marginBottomSm: {
    marginBottom: SPACING.sm
  },

  marginBottomMd: {
    marginBottom: SPACING.md
  },

  marginBottomLg: {
    marginBottom: SPACING.lg
  },

  paddingHorizontalMd: {
    paddingHorizontal: SPACING.md
  },

  paddingHorizontalLg: {
    paddingHorizontal: SPACING.lg
  },

  paddingVerticalMd: {
    paddingVertical: SPACING.md
  },

  paddingVerticalLg: {
    paddingVertical: SPACING.lg
  },

  // Flexbox utilities
  row: {
    flexDirection: 'row'
  },

  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  column: {
    flexDirection: 'column'
  },

  flex1: {
    flex: 1
  },

  // Status badges
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: DIMENSIONS.borderRadius.small,
    alignSelf: 'flex-start'
  },

  badgeSuccess: {
    backgroundColor: COLORS.success
  },

  badgeWarning: {
    backgroundColor: COLORS.warning
  },

  badgeError: {
    backgroundColor: COLORS.error
  },

  badgeInfo: {
    backgroundColor: COLORS.info
  },

  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
  },

  // Empty states
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl
  },

  emptyStateText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md
  },

  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Modal/overlay
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center'
  },

  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: DIMENSIONS.borderRadius.large,
    padding: SPACING.lg,
    width: '85%',
    maxWidth: 400
  },

  modalHeader: {
    fontSize: TYPOGRAPHY.fontSize.sectionHeader,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center'
  },

  modalBody: {
    marginBottom: SPACING.lg
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md
  },

  // Icons
  iconSmall: {
    width: DIMENSIONS.iconSize.small,
    height: DIMENSIONS.iconSize.small
  },

  iconMedium: {
    width: DIMENSIONS.iconSize.medium,
    height: DIMENSIONS.iconSize.medium
  },

  iconLarge: {
    width: DIMENSIONS.iconSize.large,
    height: DIMENSIONS.iconSize.large
  }
});

export default sharedStyles;
