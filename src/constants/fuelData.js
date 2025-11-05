/**
 * Fuel shelf life constants and data
 */

export const FUEL_SHELF_LIFE = {
  gasoline: {
    without_stabilizer: 6, // months
    with_stabilizer: 12, // months
    name: 'Gasoline (87 Octane)',
  },
  diesel: {
    without_stabilizer: 12, // months
    with_stabilizer: 24, // months
    name: 'Diesel',
  },
  'ethanol-free': {
    without_stabilizer: 12, // months
    with_stabilizer: 24, // months
    name: 'Ethanol-Free Gas',
  },
  kerosene: {
    without_stabilizer: 24, // months
    with_stabilizer: 36, // months
    name: 'Kerosene',
  },
};

export const STORAGE_LOCATIONS = [
  'Garage',
  'Shed',
  'Vehicle',
  'Underground Cache',
  'Basement',
  'Other',
];

export const EQUIPMENT_TYPES = [
  'Generator',
  'Vehicle',
  'Well Pump',
  'Lawnmower',
  'Tractor',
  'Chainsaw',
  'Other',
];

export const USAGE_PURPOSES = [
  'Testing',
  'Regular Use',
  'Emergency',
  'Maintenance',
  'Other',
];

export const CAN_SIZES = [
  { label: '1 gal', value: 1 },
  { label: '2 gal', value: 2 },
  { label: '5 gal', value: 5 },
  { label: '10 gal', value: 10 },
  { label: '20 gal', value: 20 },
];

export const ALERT_THRESHOLDS = {
  APPROACHING: 30, // days
  URGENT: 7, // days
  EXPIRED: 0, // days
};

export const STATUS_COLORS = {
  good: '#4CAF50', // Green
  approaching: '#FFC107', // Yellow
  urgent: '#FF0000', // Red
  expired: '#000000', // Black
};
