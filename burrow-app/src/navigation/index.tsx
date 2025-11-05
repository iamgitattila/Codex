import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import SearchScreen from '../screens/SearchScreen';
import LocationsScreen from '../screens/LocationsScreen';
import KitsScreen from '../screens/KitsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddEditItemScreen from '../screens/AddEditItemScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import LocationDetailScreen from '../screens/LocationDetailScreen';
import KitDetailScreen from '../screens/KitDetailScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import ExpirationAlertsScreen from '../screens/ExpirationAlertsScreen';

import { RootStackParamList, MainTabParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceDisabled,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Burrow',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsScreen}
        options={{
          tabBarLabel: 'Locations',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Kits"
        component={KitsScreen}
        options={{
          tabBarLabel: 'Kits',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bag-checked" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2E7D32',
          },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddItem"
          component={AddEditItemScreen}
          options={{ title: 'Add Item' }}
        />
        <Stack.Screen
          name="EditItem"
          component={AddEditItemScreen}
          options={{ title: 'Edit Item' }}
        />
        <Stack.Screen
          name="ItemDetail"
          component={ItemDetailScreen}
          options={{ title: 'Item Details' }}
        />
        <Stack.Screen
          name="LocationDetail"
          component={LocationDetailScreen}
          options={{ title: 'Location Details' }}
        />
        <Stack.Screen
          name="KitDetail"
          component={KitDetailScreen}
          options={{ title: 'Kit Details' }}
        />
        <Stack.Screen
          name="BarcodeScanner"
          component={BarcodeScannerScreen}
          options={{ title: 'Scan Barcode' }}
        />
        <Stack.Screen
          name="ShoppingList"
          component={ShoppingListScreen}
          options={{ title: 'Shopping List' }}
        />
        <Stack.Screen
          name="ExpirationAlerts"
          component={ExpirationAlertsScreen}
          options={{ title: 'Expiration Alerts' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
