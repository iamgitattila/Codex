import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import 'react-native-gesture-handler';

import { store, persistor } from './src/redux/store';
import { getDatabase, createTables } from './src/database/database';
import { seedDatabase } from './src/data/survivalData';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing SurvivalSkill App...');

      // Initialize database
      await getDatabase();
      console.log('✅ Database opened');

      // Create tables
      await createTables();
      console.log('✅ Tables created');

      // Seed data (only runs once, uses INSERT OR REPLACE)
      await seedDatabase();
      console.log('✅ Database seeded with survival data');

      setIsInitializing(false);
    } catch (error) {
      console.error('❌ App initialization error:', error);
      setInitError('Failed to initialize app. Please restart.');
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logo}>🔥</Text>
        <Text style={styles.appName}>SurvivalSkill</Text>
        <ActivityIndicator size="large" color="#2E7D32" style={styles.loader} />
        <Text style={styles.loadingText}>Loading survival scenarios...</Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorText}>{initError}</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
};

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#2E7D32" />
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  loader: {
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 40,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});

export default App;
