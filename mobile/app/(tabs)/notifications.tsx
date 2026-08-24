import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { NotificationItem } from '../../src/components/NotificationItem';
import { rippleClient } from '../../src/api/client';

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const markedRef = useRef(false);

  const query = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) =>
      rippleClient.notifications.list({ page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });

  const markAllRead = useMutation({
    mutationFn: () => rippleClient.notifications.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  useEffect(() => {
    if (!markedRef.current) {
      markedRef.current = true;
      markAllRead.mutate();
    }
  }, [markAllRead]);

  const notifications = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <NotificationItem notification={item} />}
      ListEmptyComponent={
        !query.isLoading ? <Text style={styles.empty}>No notifications yet.</Text> : null
      }
      onEndReached={() => {
        if (query.hasNextPage) void query.fetchNextPage();
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  empty: { color: '#71717a' },
});
