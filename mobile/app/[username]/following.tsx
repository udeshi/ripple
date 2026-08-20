import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text } from 'react-native';
import { UserListItem } from '../../src/components/UserListItem';
import { rippleClient } from '../../src/api/client';

export default function FollowingScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();

  const query = useInfiniteQuery({
    queryKey: ['following', username],
    queryFn: ({ pageParam }) =>
      rippleClient.follows.following(username, { page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });

  const users = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <UserListItem user={item} />}
      ListEmptyComponent={
        !query.isLoading ? (
          <Text style={styles.empty}>Not following anyone yet.</Text>
        ) : null
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
