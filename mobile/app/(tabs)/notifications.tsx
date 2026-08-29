import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { dedupeById } from '@ripple/api-client';
import { NotificationItem } from '../../src/components/NotificationItem';
import { rippleClient } from '../../src/api/client';
import { colors, spacing } from '../../src/theme';

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

  const notifications = dedupeById(
    query.data?.pages.flatMap((page) => page.items) ?? [],
  );

  return (
    <FlatList
      style={styles.list}
      data={notifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <NotificationItem notification={item} />}
      ListEmptyComponent={
        !query.isLoading ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={32} color={colors.muted} />
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        ) : null
      }
      onEndReached={() => {
        if (query.hasNextPage) void query.fetchNextPage();
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: { padding: spacing.lg, flexGrow: 1 },
  empty: { alignItems: 'center', gap: spacing.sm, marginTop: 60 },
  emptyText: { color: colors.muted, fontSize: 14 },
});
