import { useQuery } from '@tanstack/react-query';
import { Tabs } from 'expo-router';
import { rippleClient } from '../../src/api/client';
import { useAuth } from '../../src/lib/auth-context';

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
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Feed' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="new" options={{ title: 'New post' }} />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarBadge: unread > 0 ? unread : undefined,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
