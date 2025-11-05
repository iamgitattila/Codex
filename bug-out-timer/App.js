/**
 * Bug-Out Timer - Main App Entry Point
 * React Navigation setup with all screens
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from './src/constants';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import DrillScreen from './src/screens/DrillScreen';
import DrillCompleteScreen from './src/screens/DrillCompleteScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import DrillDetailScreen from './src/screens/DrillDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background },
          gestureEnabled: false // Disable swipe-back during drills
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            gestureEnabled: true
          }}
        />
        <Stack.Screen
          name="Drill"
          component={DrillScreen}
          options={{
            gestureEnabled: false // Prevent accidental back during drill
          }}
        />
        <Stack.Screen
          name="DrillComplete"
          component={DrillCompleteScreen}
          options={{
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{
            gestureEnabled: true
          }}
        />
        <Stack.Screen
          name="DrillDetail"
          component={DrillDetailScreen}
          options={{
            gestureEnabled: true
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            gestureEnabled: true
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
