import { format, differenceInDays, addDays, parseISO, isValid } from 'date-fns';

/**
 * Format a date for display
 */
export const formatDate = (date: Date | number | null | undefined): string => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, 'MMM d, yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Calculate days until expiration
 */
export const getDaysUntilExpiration = (expirationDate: Date | number): number => {
  const dateObj = typeof expirationDate === 'number' ? new Date(expirationDate) : expirationDate;
  return differenceInDays(dateObj, new Date());
};

/**
 * Check if an item is expiring soon (within threshold days)
 */
export const isExpiringSoon = (expirationDate: Date | number | null | undefined, thresholdDays: number = 30): boolean => {
  if (!expirationDate) return false;
  const days = getDaysUntilExpiration(expirationDate);
  return days >= 0 && days <= thresholdDays;
};

/**
 * Check if an item is expired
 */
export const isExpired = (expirationDate: Date | number | null | undefined): boolean => {
  if (!expirationDate) return false;
  return getDaysUntilExpiration(expirationDate) < 0;
};

/**
 * Get expiration status with color code
 */
export const getExpirationStatus = (expirationDate: Date | number | null | undefined): {
  status: 'expired' | 'urgent' | 'soon' | 'upcoming' | 'good';
  color: string;
  label: string;
  days: number | null;
} => {
  if (!expirationDate) {
    return { status: 'good', color: '#4CAF50', label: 'No expiration', days: null };
  }

  const days = getDaysUntilExpiration(expirationDate);

  if (days < 0) {
    return { status: 'expired', color: '#F44336', label: 'Expired', days };
  } else if (days <= 7) {
    return { status: 'urgent', color: '#FF5722', label: 'Urgent', days };
  } else if (days <= 14) {
    return { status: 'soon', color: '#FF9800', label: 'Soon', days };
  } else if (days <= 30) {
    return { status: 'upcoming', color: '#FFC107', label: 'Upcoming', days };
  } else {
    return { status: 'good', color: '#4CAF50', label: 'Good', days };
  }
};

/**
 * Format relative time (e.g., "in 5 days", "2 days ago")
 */
export const formatRelativeTime = (date: Date | number): string => {
  const days = getDaysUntilExpiration(date);

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
};
