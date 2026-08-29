import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import type { ColorValue } from 'react-native';
import { rippleClient } from '../../src/api/client';
import { useAuth } from '../../src/lib/auth-context';
import { colors } from '../../src/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(focused: IconName, unfocused: IconName) {
  return ({
    color,
    size,
    focused: isFocused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) => <Ionicons name={isFocused ? focused : unfocused} size={size} color={color} />;
}

export default function TabsLayout() {
  const { user } = useAuth();

  const unreadQuery = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => rippleClient.notifications.unreadCount(),
    enabled: !!user,
    refetchInterval: 30_000,
  });
  const unread = unreadQuery.data ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: { color: colors.foreground },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarBadgeStyle: { backgroundColor: colors.danger, color: colors.foreground },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Feed', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: 'Search', tabBarIcon: tabIcon('search', 'search-outline') }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: 'New post',
          tabBarIcon: tabIcon('add-circle', 'add-circle-outline'),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarIcon: tabIcon('heart', 'heart-outline'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tabs>
  );
}
