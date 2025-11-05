/**
 * Type definitions for Fuel Tracker app
 * Using JSDoc for type hints in JavaScript
 */

/**
 * @typedef {'gasoline' | 'diesel' | 'ethanol-free' | 'kerosene'} FuelType
 */

/**
 * @typedef {'sealed' | 'open' | 'low' | 'empty'} CanCondition
 */

/**
 * @typedef {'good' | 'approaching' | 'urgent' | 'expired'} AlertType
 */

/**
 * @typedef {Object} FuelCan
 * @property {string} can_id - Unique identifier for the can
 * @property {number} size_gallons - Size of the can in gallons
 * @property {FuelType} fuel_type - Type of fuel
 * @property {string} purchase_date - ISO date string when purchased
 * @property {boolean} stabilizer_used - Whether stabilizer was added
 * @property {string} expiration_date - ISO date string when fuel expires
 * @property {number} current_contents_gallons - Current amount of fuel in gallons
 * @property {string} storage_location - Where the can is stored
 * @property {CanCondition} condition - Current condition of the can
 * @property {string} equipment_use - Equipment this fuel is for
 * @property {string} created_at - ISO date string when can was added
 * @property {string} notes - User notes about this can
 */

/**
 * @typedef {Object} UsageEntry
 * @property {string} usage_id - Unique identifier for the usage
 * @property {string} can_id - ID of the can that was used
 * @property {number} gallons_used - Amount of fuel used
 * @property {string} timestamp - ISO date string when fuel was used
 * @property {string} equipment - Equipment fuel was used in
 * @property {string} purpose - Purpose of usage
 * @property {string} notes - User notes about this usage
 */

/**
 * @typedef {Object} Alert
 * @property {string} alert_id - Unique identifier for the alert
 * @property {string} can_id - ID of the can with alert
 * @property {AlertType} alert_type - Type of alert
 * @property {number} days_remaining - Days until expiration
 * @property {string} created_at - ISO date string when alert was created
 * @property {boolean} dismissed - Whether alert has been dismissed
 */

/**
 * @typedef {Object} AppSettings
 * @property {number} alert_threshold_days - Alert when X days remaining
 * @property {FuelType} default_fuel_type - Default fuel type for new cans
 * @property {boolean} default_stabilizer - Default stabilizer setting
 * @property {'gallons' | 'liters'} volume_unit - Volume unit preference
 * @property {boolean} notification_enabled - Whether notifications are enabled
 */

export const FuelTypes = {
  GASOLINE: 'gasoline',
  DIESEL: 'diesel',
  ETHANOL_FREE: 'ethanol-free',
  KEROSENE: 'kerosene',
};

export const CanConditions = {
  SEALED: 'sealed',
  OPEN: 'open',
  LOW: 'low',
  EMPTY: 'empty',
};

export const AlertTypes = {
  GOOD: 'good',
  APPROACHING: 'approaching',
  URGENT: 'urgent',
  EXPIRED: 'expired',
};
