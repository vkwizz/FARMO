import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DashboardScreen from './src/screens/DashboardScreen';
import CropHealthScreen from './src/screens/CropHealthScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import AdvisoryScreen from './src/screens/AdvisoryScreen';
import { COLORS, FONTS, RADIUS, SHADOW } from './src/theme';

import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ name, focused, color }) {
  return (
    <View style={{
      alignItems: 'center', justifyContent: 'center',
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: focused ? 'rgba(255,255,255,0.08)' : 'transparent',
    }}>
      <Ionicons name={name} size={focused ? 26 : 22} color={color} />
    </View>
  );
}

function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#0D4D31', // matched to dashboard gradient start
          borderTopWidth: 0,
          height: 74,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          elevation: 0,
          borderTopColor: 'transparent',
        },
      }}
    >
      <Tab.Screen name="Home" component={DashboardWrapper(navigation)}
        options={{ title: 'Dashboard', tabBarIcon: p => <TabIcon name={p.focused ? "home" : "home-outline"} {...p} /> }} />
      <Tab.Screen name="CropHealth" component={CropHealthScreen}
        options={{ title: 'Crop', tabBarIcon: p => <TabIcon name={p.focused ? "leaf" : "leaf-outline"} {...p} /> }} />
      <Tab.Screen name="Weather" component={WeatherScreen}
        options={{ title: 'Weather', tabBarIcon: p => <TabIcon name={p.focused ? "partly-sunny" : "partly-sunny-outline"} {...p} /> }} />
      <Tab.Screen name="Advisory" component={AdvisoryScreen}
        options={{ title: 'Advisory', tabBarIcon: p => <TabIcon name={p.focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} {...p} />, tabBarBadge: '1', tabBarBadgeStyle: { backgroundColor: COLORS.danger, top: 4 } }} />
    </Tab.Navigator>
  );
}

// Wrapper to pass navigation prop down to Dashboard agent cards
function DashboardWrapper(rootNav) {
  return function WrappedDashboard({ navigation }) {
    return <DashboardScreen navigation={navigation} />;
  };
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
