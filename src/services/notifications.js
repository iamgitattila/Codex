/**
 * Notification service for expiration alerts
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getCans } from './storage';
import { calculateDaysRemaining, getCanStatus } from '../utils/fuelCalculations';
import { AlertTypes } from '../types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('fuel-alerts', {
        name: 'Fuel Expiration Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B6B',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule notifications for all cans approaching expiration
 * @returns {Promise<void>}
 */
export const scheduleExpirationAlerts = async () => {
  try {
    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const cans = await getCans();
    const today = new Date();

    for (const can of cans) {
      const daysRemaining = calculateDaysRemaining(can.expiration_date);
      const status = getCanStatus(daysRemaining);

      // Only schedule for cans that are approaching expiration or urgent
      if (status === AlertTypes.APPROACHING || status === AlertTypes.URGENT) {
        // Schedule notification for next day
        const notificationTime = new Date(today);
        notificationTime.setDate(notificationTime.getDate() + 1);
        notificationTime.setHours(9, 0, 0, 0); // 9 AM next day

        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⛽ Fuel Expiration Alert',
            body: `Can in ${can.storage_location}: Use by ${new Date(can.expiration_date).toLocaleDateString()} (${daysRemaining} days)`,
            data: {
              can_id: can.can_id,
              screen: 'CanDetail',
            },
            sound: true,
          },
          trigger: notificationTime,
        });
      }

      // Schedule urgent alert for expired cans
      if (status === AlertTypes.EXPIRED) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⛔ BAD FUEL ALERT',
            body: `Can in ${can.storage_location} has EXPIRED - Dispose or treat immediately`,
            data: {
              can_id: can.can_id,
              screen: 'CanDetail',
            },
            sound: true,
          },
          trigger: null, // Immediate
        });
      }
    }
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
};

/**
 * Schedule daily check for expiration alerts
 * @returns {Promise<void>}
 */
export const scheduleDailyCheck = async () => {
  try {
    // Schedule notification to check daily at 9 AM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⛽ Daily Fuel Check',
        body: 'Tap to check your fuel inventory',
        data: {
          screen: 'Home',
        },
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  } catch (error) {
    console.error('Error scheduling daily check:', error);
  }
};

/**
 * Handle notification tap
 * @param {Object} navigation - Navigation object
 * @param {Object} notification - Notification data
 */
export const handleNotificationResponse = (navigation, notification) => {
  const data = notification.request.content.data;

  if (data.screen === 'CanDetail' && data.can_id) {
    // Navigate to can detail
    // Note: This requires the can object, which we'll need to fetch
    navigation.navigate('Home'); // Navigate to home for now
  } else if (data.screen === 'Home') {
    navigation.navigate('Home');
  }
};

export default {
  requestNotificationPermissions,
  scheduleExpirationAlerts,
  scheduleDailyCheck,
  handleNotificationResponse,
};
