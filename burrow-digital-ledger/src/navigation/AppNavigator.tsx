// Main app navigation structure
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens (to be created)
import DashboardScreen from '../screens/DashboardScreen';
import SearchScreen from '../screens/SearchScreen';
import LocationsScreen from '../screens/LocationsScreen';
import KitsScreen from '../screens/KitsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddEditAssetScreen from '../screens/AddEditAssetScreen';
import LocationViewScreen from '../screens/LocationViewScreen';
import KitDetailsScreen from '../screens/KitDetailsScreen';
import ExpirationAlertsScreen from '../screens/ExpirationAlertsScreen';
import ParLevelScreen from '../screens/ParLevelScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import DataExportScreen from '../screens/DataExportScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  AddEditAsset: { assetId?: string };
  LocationView: { locationId: string; locationName: string };
  KitDetails: { kitId: string };
  ExpirationAlerts: undefined;
  ParLevel: undefined;
  ShoppingList: undefined;
  DataExport: undefined;
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Search: undefined;
  Locations: undefined;
  Kits: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = 'view-dashboard';
          } else if (route.name === 'Search') {
            iconName = 'magnify';
          } else if (route.name === 'Locations') {
            iconName = 'map-marker-multiple';
          } else if (route.name === 'Kits') {
            iconName = 'bag-checked';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2e7d32',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Burrow Inventory' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Search Assets' }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsScreen}
        options={{ title: 'Locations' }}
      />
      <Tab.Screen name="Kits" component={KitsScreen} options={{ title: 'Kits & BOBs' }} />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2e7d32',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddEditAsset"
          component={AddEditAssetScreen}
          options={({ route }) => ({
            title: (route.params as any)?.assetId ? 'Edit Asset' : 'Add New Asset',
          })}
        />
        <Stack.Screen
          name="LocationView"
          component={LocationViewScreen}
          options={({ route }) => ({
            title: (route.params as any)?.locationName || 'Location',
          })}
        />
        <Stack.Screen
          name="KitDetails"
          component={KitDetailsScreen}
          options={{ title: 'Kit Details' }}
        />
        <Stack.Screen
          name="ExpirationAlerts"
          component={ExpirationAlertsScreen}
          options={{ title: 'Expiration Alerts' }}
        />
        <Stack.Screen
          name="ParLevel"
          component={ParLevelScreen}
          options={{ title: 'Par Level Management' }}
        />
        <Stack.Screen
          name="ShoppingList"
          component={ShoppingListScreen}
          options={{ title: 'Shopping List' }}
        />
        <Stack.Screen
          name="DataExport"
          component={DataExportScreen}
          options={{ title: 'Export Data' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
