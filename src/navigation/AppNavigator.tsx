import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens (we'll create these)
import ScenarioListScreen from '../screens/ScenarioListScreen';
import ScenarioDetailScreen from '../screens/ScenarioDetailScreen';
import TipDetailScreen from '../screens/TipDetailScreen';
import DailyChallengeScreen from '../screens/DailyChallengeScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaywallScreen from '../screens/PaywallScreen';

import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Scenarios Stack Navigator
const ScenariosStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#2E7D32',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
    <Stack.Screen
      name="ScenarioList"
      component={ScenarioListScreen}
      options={{ title: 'Survival Scenarios' }}
    />
    <Stack.Screen
      name="ScenarioDetail"
      component={ScenarioDetailScreen}
      options={{ title: 'Scenario' }}
    />
    <Stack.Screen
      name="TipDetail"
      component={TipDetailScreen}
      options={{ title: 'Survival Tip' }}
    />
  </Stack.Navigator>
);

// Bottom Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#2E7D32',
      tabBarInactiveTintColor: '#757575',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
      },
      headerShown: false,
    }}>
    <Tab.Screen
      name="Home"
      component={ScenariosStack}
      options={{
        tabBarLabel: 'Scenarios',
        tabBarIcon: ({ color, size }) => (
          <Icon name="fire" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="DailyChallenge"
      component={DailyChallengeScreen}
      options={{
        tabBarLabel: 'Daily',
        tabBarIcon: ({ color, size }) => (
          <Icon name="calendar-star" size={size} color={color} />
        ),
        headerShown: true,
        headerStyle: {
          backgroundColor: '#2E7D32',
        },
        headerTintColor: '#fff',
        headerTitle: 'Daily Challenge',
      }}
    />
    <Tab.Screen
      name="Bookmarks"
      component={BookmarksScreen}
      options={{
        tabBarLabel: 'Saved',
        tabBarIcon: ({ color, size }) => (
          <Icon name="bookmark" size={size} color={color} />
        ),
        headerShown: true,
        headerStyle: {
          backgroundColor: '#2E7D32',
        },
        headerTintColor: '#fff',
        headerTitle: 'Bookmarks',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Icon name="account" size={size} color={color} />
        ),
        headerShown: true,
        headerStyle: {
          backgroundColor: '#2E7D32',
        },
        headerTintColor: '#fff',
        headerTitle: 'Profile',
      }}
    />
  </Tab.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Upgrade to Premium',
            headerStyle: {
              backgroundColor: '#2E7D32',
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
