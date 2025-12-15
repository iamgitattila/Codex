// Water Boil Logger - Navigation Setup

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Import screens (will be created)
import HomeScreen from '../screens/HomeScreen';
import TimerScreen from '../screens/TimerScreen';
import VolumeLoggerScreen from '../screens/VolumeLoggerScreen';
import WeeklyScreen from '../screens/WeeklyScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF6B6B',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '💧 Water Boil Logger' }}
        />
        <Stack.Screen
          name="Timer"
          component={TimerScreen}
          options={{ title: '⏱ Boil Timer' }}
        />
        <Stack.Screen
          name="VolumeLogger"
          component={VolumeLoggerScreen}
          options={{ title: '💧 Log Volume' }}
        />
        <Stack.Screen
          name="Weekly"
          component={WeeklyScreen}
          options={{ title: '📊 This Week' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: '📜 History' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: '⚙️ Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
