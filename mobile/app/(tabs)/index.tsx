import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { dedupeById } from '@ripple/api-client';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { PostCard } from '../../src/components/PostCard';
import { rippleClient } from '../../src/api/client';
import { colors, spacing } from '../../src/theme';

export default function FeedScreen() {
  const query = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) =>
      rippleClient.posts.feed({ page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });

  const posts = dedupeById(query.data?.pages.flatMap((page) => page.items) ?? []);

  if (query.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard post={item} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="images-outline" size={32} color={colors.muted} />
          <Text style={styles.emptyText}>
            No posts yet. Be the first to share something.
          </Text>
        </View>
      }
      onEndReached={() => {
        if (query.hasNextPage) void query.fetchNextPage();
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: { paddingTop: spacing.lg, flexGrow: 1 },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: spacing.sm, marginTop: 80, paddingHorizontal: spacing.xxl },
  emptyText: { textAlign: 'center', color: colors.muted, fontSize: 14 },
});
