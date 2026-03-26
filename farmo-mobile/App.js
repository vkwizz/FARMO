import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/contexts/LanguageContext';
import DashboardScreen from './src/screens/DashboardScreen';
import CropHealthScreen from './src/screens/CropHealthScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import AdvisoryScreen from './src/screens/AdvisoryScreen';
import ChatScreen from './src/screens/ChatScreen';
import { COLORS, FONTS, RADIUS, SHADOW } from './src/theme';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ name, focused, color }) {
  return (
    <View style={{
      alignItems: 'center', justifyContent: 'center',
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: focused ? '#E8F5E9' : 'transparent',
    }}>
      <Ionicons name={name} size={focused ? 24 : 22} color={color} />
    </View>
  );
}

function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          height: 85,
          paddingTop: 10,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
      }}
    >
      <Tab.Screen name="Home" component={DashboardWrapper(navigation)}
        options={{ title: 'Dashboard', tabBarIcon: p => <TabIcon name={p.focused ? "home" : "home-outline"} {...p} /> }} />
      <Tab.Screen name="CropHealth" component={CropHealthScreen}
        options={{ title: 'Crop', tabBarIcon: p => <TabIcon name={p.focused ? "leaf" : "leaf-outline"} {...p} /> }} />
      <Tab.Screen name="Weather" component={WeatherScreen}
        options={{ title: 'Weather', tabBarIcon: p => <TabIcon name={p.focused ? "stats-chart" : "stats-chart-outline"} {...p} /> }} />
      <Tab.Screen name="Advisory" component={AdvisoryScreen}
        options={{ title: 'Advisory', tabBarIcon: p => <TabIcon name={p.focused ? "person" : "person-outline"} {...p} /> }} />
      <Tab.Screen name="Chat" component={ChatScreen}
        options={{ title: 'Chat', tabBarIcon: p => <TabIcon name={p.focused ? "chatbubble" : "chatbubble-outline"} {...p} /> }} />
    </Tab.Navigator>
  );
}

function DashboardWrapper(rootNav) {
  return function WrappedDashboard({ navigation }) {
    return <DashboardScreen navigation={navigation} />;
  };
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <NavigationContainer>
          <StatusBar style="light" translucent backgroundColor="transparent" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainTabs} />
          </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}