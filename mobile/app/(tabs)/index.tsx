import { useInfiniteQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native';
import { PostCard } from '../../src/components/PostCard';
import { rippleClient } from '../../src/api/client';

export default function FeedScreen() {
  const query = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) =>
      rippleClient.posts.feed({ page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });

  const posts = query.data?.pages.flatMap((page) => page.items) ?? [];

  if (query.isLoading) {
    return <ActivityIndicator style={styles.center} />;
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard post={item} />}
      ListEmptyComponent={
        <Text style={styles.empty}>
          No posts yet. Be the first to share something.
        </Text>
      }
      onEndReached={() => {
        if (query.hasNextPage) void query.fetchNextPage();
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  empty: { textAlign: 'center', color: '#71717a', marginTop: 40 },
});
