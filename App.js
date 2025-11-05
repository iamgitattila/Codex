/**
 * Fuel Tracker - Jerry Can Edition
 * Main App Component
 * by PrepperCodex
 */
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { requestNotificationPermissions, scheduleExpirationAlerts } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    // Initialize app
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Request notification permissions
      const hasPermission = await requestNotificationPermissions();

      if (hasPermission) {
        // Schedule expiration alerts
        await scheduleExpirationAlerts();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}
