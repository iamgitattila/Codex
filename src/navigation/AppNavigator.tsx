import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Screens
import ProtocolListScreen from '../screens/ProtocolListScreen';
import ProtocolDetailScreen from '../screens/ProtocolDetailScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import QuizScreen from '../screens/QuizScreen';
import KitTrackerScreen from '../screens/KitTrackerScreen';
import TriageModeScreen from '../screens/TriageModeScreen';
import BookmarksScreen from '../screens/BookmarksScreen';

import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function ProtocolStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ProtocolList"
        component={ProtocolListScreen}
        options={{ title: 'Survival First Aid' }}
      />
      <Stack.Screen
        name="ProtocolDetail"
        component={ProtocolDetailScreen}
        options={{ title: 'Protocol Details' }}
      />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{ title: 'Video Demo' }}
      />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Knowledge Quiz' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={ProtocolStack}
        options={{
          tabBarLabel: 'Protocols',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="medical-bag" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TriageMode"
        component={TriageModeScreen}
        options={{
          tabBarLabel: 'Emergency',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="alert-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="KitTracker"
        component={KitTrackerScreen}
        options={{
          tabBarLabel: 'My Kit',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="toolbox" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          tabBarLabel: 'Bookmarks',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bookmark" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}
