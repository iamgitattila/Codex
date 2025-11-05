/**
 * Bug-Out Timer - SMS Utility
 * Handles SMS composition and contact validation
 */

import * as SMS from 'expo-sms';
import { getSmsTimestamp } from './timer';
import { MESSAGES } from '../constants';

/**
 * Check if SMS is available on this device
 * @returns {Promise<boolean>} True if SMS is available
 */
export const isSmsAvailable = async () => {
  try {
    return await SMS.isAvailableAsync();
  } catch (error) {
    console.error('Error checking SMS availability:', error);
    return false;
  }
};

/**
 * Send evacuation SMS to contacts
 * @param {Array} contacts - Array of contact objects
 * @param {string} customMessage - Optional custom message
 * @returns {Promise<Object>} Result object
 */
export const sendEvacuationSms = async (contacts, customMessage = null) => {
  try {
    const available = await isSmsAvailable();

    if (!available) {
      return {
        success: false,
        error: MESSAGES.errorSms
      };
    }

    // Filter enabled contacts and extract phone numbers
    const phoneNumbers = contacts
      .filter(contact => contact.enabled)
      .map(contact => contact.phone);

    if (phoneNumbers.length === 0) {
      return {
        success: false,
        error: 'No enabled contacts to send SMS'
      };
    }

    // Create default message with timestamp
    const timestamp = getSmsTimestamp();
    const message = customMessage || MESSAGES.smsDefaultMessage(timestamp);

    // Open SMS composer
    const { result } = await SMS.sendSMSAsync(phoneNumbers, message);

    return {
      success: result === 'sent',
      result,
      recipientCount: phoneNumbers.length
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Validate phone number format (basic validation)
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid
 */
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;

  // Remove all non-numeric characters except + at the start
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // Basic validation:
  // - Must have at least 10 digits
  // - Can optionally start with +
  // - Total length should be reasonable (10-15 characters)
  const hasMinDigits = (cleaned.match(/\d/g) || []).length >= 10;
  const validLength = cleaned.length >= 10 && cleaned.length <= 15;
  const validPrefix = cleaned[0] === '+' || /^\d/.test(cleaned[0]);

  return hasMinDigits && validLength && validPrefix;
};

/**
 * Format phone number for display
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  // Remove all non-numeric characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // If it starts with +1 (US/Canada), format as +1 (XXX) XXX-XXXX
  if (cleaned.startsWith('+1') && cleaned.length === 12) {
    return `+1 (${cleaned.substr(2, 3)}) ${cleaned.substr(5, 3)}-${cleaned.substr(8, 4)}`;
  }

  // If it's 10 digits (US/Canada without country code), format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.substr(0, 3)}) ${cleaned.substr(3, 3)}-${cleaned.substr(6, 4)}`;
  }

  // If it starts with + (international), format as +XX XXXX...
  if (cleaned.startsWith('+')) {
    const countryCode = cleaned.substr(0, 3);
    const rest = cleaned.substr(3);
    return `${countryCode} ${rest}`;
  }

  // Default: return as-is
  return cleaned;
};

/**
 * Create SMS contact object
 * @param {string} name - Contact name
 * @param {string} phone - Contact phone number
 * @returns {Object} Contact object
 */
export const createContact = (name, phone) => {
  return {
    contact_id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    phone: formatPhoneNumber(phone),
    enabled: true,
    created_at: new Date().toISOString()
  };
};

/**
 * Compose evacuation SMS message
 * @param {Object} drillData - Optional drill data for context
 * @returns {string} SMS message
 */
export const composeEvacuationMessage = (drillData = null) => {
  const timestamp = getSmsTimestamp();

  if (drillData) {
    return `EVACUATION ALERT: ${drillData.scenario_name} initiated at ${timestamp}. Evacuating now.`;
  }

  return MESSAGES.smsDefaultMessage(timestamp);
};

/**
 * Get SMS preview text
 * @param {Array} contacts - Array of contacts
 * @returns {string} Preview text
 */
export const getSmsPreviewText = (contacts) => {
  const enabledContacts = contacts.filter(c => c.enabled);
  const count = enabledContacts.length;

  if (count === 0) {
    return 'No contacts selected';
  }

  const names = enabledContacts.map(c => c.name).join(', ');

  return `Will send SMS to ${count} contact${count !== 1 ? 's' : ''}: ${names}`;
};

export default {
  isSmsAvailable,
  sendEvacuationSms,
  validatePhoneNumber,
  formatPhoneNumber,
  createContact,
  composeEvacuationMessage,
  getSmsPreviewText
};
