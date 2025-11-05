/**
 * Fuel calculation utilities
 */
import { addMonths, differenceInDays, parseISO } from 'date-fns';
import { FUEL_SHELF_LIFE, ALERT_THRESHOLDS } from '../constants/fuelData';
import { AlertTypes } from '../types';

/**
 * Calculate expiration date for a fuel can
 * @param {Date|string} purchaseDate - Purchase date
 * @param {string} fuelType - Type of fuel
 * @param {boolean} stabilizerUsed - Whether stabilizer was added
 * @returns {Date} Expiration date
 */
export const calculateExpirationDate = (purchaseDate, fuelType, stabilizerUsed) => {
  const date = typeof purchaseDate === 'string' ? parseISO(purchaseDate) : purchaseDate;
  const fuelData = FUEL_SHELF_LIFE[fuelType] || FUEL_SHELF_LIFE.gasoline;

  const shelfLifeMonths = stabilizerUsed
    ? fuelData.with_stabilizer
    : fuelData.without_stabilizer;

  return addMonths(date, shelfLifeMonths);
};

/**
 * Calculate days remaining until expiration
 * @param {Date|string} expirationDate - Expiration date
 * @returns {number} Days remaining (negative if expired)
 */
export const calculateDaysRemaining = (expirationDate) => {
  const expDate = typeof expirationDate === 'string' ? parseISO(expirationDate) : expirationDate;
  return differenceInDays(expDate, new Date());
};

/**
 * Get status based on days remaining
 * @param {number} daysRemaining - Days until expiration
 * @returns {string} Status: 'good', 'approaching', 'urgent', 'expired'
 */
export const getCanStatus = (daysRemaining) => {
  if (daysRemaining < ALERT_THRESHOLDS.EXPIRED) {
    return AlertTypes.EXPIRED;
  } else if (daysRemaining < ALERT_THRESHOLDS.URGENT) {
    return AlertTypes.URGENT;
  } else if (daysRemaining < ALERT_THRESHOLDS.APPROACHING) {
    return AlertTypes.APPROACHING;
  }
  return AlertTypes.GOOD;
};

/**
 * Generate FIFO queue (oldest first)
 * @param {Array} cans - Array of fuel cans
 * @returns {Array} Sorted array of cans
 */
export const generateFifoQueue = (cans) => {
  return cans
    .filter(can => can.current_contents_gallons > 0)
    .sort((a, b) => {
      const dateA = parseISO(a.expiration_date);
      const dateB = parseISO(b.expiration_date);
      return dateA - dateB;
    });
};

/**
 * Calculate total fuel inventory
 * @param {Array} cans - Array of fuel cans
 * @returns {number} Total gallons
 */
export const calculateTotalFuel = (cans) => {
  return cans.reduce((sum, can) => sum + can.current_contents_gallons, 0);
};

/**
 * Generate alerts for cans approaching expiration
 * @param {Array} cans - Array of fuel cans
 * @returns {Array} Array of alerts
 */
export const generateAlerts = (cans) => {
  const alerts = [];

  cans.forEach(can => {
    const daysRemaining = calculateDaysRemaining(can.expiration_date);
    const status = getCanStatus(daysRemaining);

    if (status !== AlertTypes.GOOD) {
      alerts.push({
        alert_id: `alert_${can.can_id}_${Date.now()}`,
        can_id: can.can_id,
        alert_type: status,
        days_remaining: daysRemaining,
        created_at: new Date().toISOString(),
        dismissed: false,
        can: can,
      });
    }
  });

  return alerts.sort((a, b) => a.days_remaining - b.days_remaining);
};

/**
 * Get alert message for a status
 * @param {string} status - Alert status
 * @param {Date|string} expirationDate - Expiration date
 * @returns {string} Alert message
 */
export const getAlertMessage = (status, expirationDate) => {
  const expDate = typeof expirationDate === 'string' ? parseISO(expirationDate) : expirationDate;
  const dateStr = expDate.toLocaleDateString();

  switch (status) {
    case AlertTypes.EXPIRED:
      return 'BAD FUEL - DISPOSE';
    case AlertTypes.URGENT:
      return `URGENT: Use by ${dateStr}`;
    case AlertTypes.APPROACHING:
      return `Use by ${dateStr}`;
    default:
      return `Good until ${dateStr}`;
  }
};

/**
 * Format fuel type for display
 * @param {string} fuelType - Fuel type key
 * @returns {string} Formatted fuel type
 */
export const formatFuelType = (fuelType) => {
  const fuelData = FUEL_SHELF_LIFE[fuelType];
  return fuelData ? fuelData.name : fuelType;
};
