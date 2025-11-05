// Burrow: The Digital Ledger - Main App Entry Point
// PrepperCodex Pillar 4
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/db';

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        console.log('Initializing database...');
        await initDatabase();
        console.log('Database initialized successfully');
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    }

    initializeApp();
  }, []);

  if (!dbInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PaperProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </PaperProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
