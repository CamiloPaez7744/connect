import { Tabs } from 'expo-router';
import { Platform, useWindowDimensions, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, F, BP, GLASS, SHADOW } from '../../src/tokens';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = width >= BP.lg;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: T.primary,
        tabBarInactiveTintColor: T.textMuted,
        tabBarStyle: {
          backgroundColor: GLASS.tabBar.backgroundColor,
          borderTopColor: GLASS.tabBar.borderTopColor,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          ...SHADOW.sm,
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
