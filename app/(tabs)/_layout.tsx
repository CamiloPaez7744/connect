import { Tabs } from 'expo-router';
import { Platform, useWindowDimensions, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, F, BP } from '../../src/tokens';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BP.lg;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: T.primary,
        tabBarInactiveTintColor: T.textMuted,
        tabBarStyle: {
          backgroundColor: T.bgAlt,
          borderTopColor: T.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: F.semibold,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Posiciones',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="positions"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: 'Juego',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="senses"
        options={{
          title: 'Sentidos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flower' : 'flower-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Más',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline'} size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
