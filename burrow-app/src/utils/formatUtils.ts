/**
 * Format currency (USD)
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format quantity with unit
 */
export const formatQuantity = (quantity: number, unit: string): string => {
  if (quantity === 1 && !unit.endsWith('s')) {
    return `${quantity} ${unit}`;
  }
  return `${quantity} ${unit}`;
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (current: number, total: number): string => {
  const percentage = calculatePercentage(current, total);
  return `${percentage}%`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format large numbers with commas
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Get status color based on par level
 */
export const getParLevelStatus = (current: number, par: number | null | undefined): {
  status: 'adequate' | 'low' | 'critical' | 'overstocked';
  color: string;
  label: string;
} => {
  if (!par) {
    return { status: 'adequate', color: '#4CAF50', label: 'No par level set' };
  }

  const percentage = (current / par) * 100;

  if (percentage === 0) {
    return { status: 'critical', color: '#F44336', label: 'Out of stock' };
  } else if (percentage < 50) {
    return { status: 'critical', color: '#F44336', label: 'Critical' };
  } else if (percentage < 75) {
    return { status: 'low', color: '#FF9800', label: 'Low' };
  } else if (percentage <= 100) {
    return { status: 'adequate', color: '#4CAF50', label: 'Adequate' };
  } else {
    return { status: 'overstocked', color: '#2196F3', label: 'Overstocked' };
  }
};
