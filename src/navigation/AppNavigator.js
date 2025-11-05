/**
 * App navigation structure
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens (will be created)
import HomeScreen from '../screens/HomeScreen';
import AddCanScreen from '../screens/AddCanScreen';
import CanDetailScreen from '../screens/CanDetailScreen';
import UseFuelScreen from '../screens/UseFuelScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HistoryScreen from '../screens/HistoryScreen';

import { colors } from '../styles/globalStyles';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.surface,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '⛽ Fuel Tracker',
            headerStyle: {
              backgroundColor: colors.primary,
            },
          }}
        />
        <Stack.Screen
          name="AddCan"
          component={AddCanScreen}
          options={{
            title: 'Add Fuel Can',
          }}
        />
        <Stack.Screen
          name="CanDetail"
          component={CanDetailScreen}
          options={{
            title: 'Can Details',
          }}
        />
        <Stack.Screen
          name="UseFuel"
          component={UseFuelScreen}
          options={{
            title: 'Use Fuel',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{
            title: 'Usage History',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
