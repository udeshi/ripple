import { useInfiniteQuery } from '@tanstack/react-query';
import { dedupeById } from '@ripple/api-client';
import { useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text } from 'react-native';
import { UserListItem } from '../../src/components/UserListItem';
import { rippleClient } from '../../src/api/client';
import { colors, spacing } from '../../src/theme';

export default function FollowersScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();

  const query = useInfiniteQuery({
    queryKey: ['followers', username],
    queryFn: ({ pageParam }) =>
      rippleClient.follows.followers(username, { page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });

  const users = dedupeById(query.data?.pages.flatMap((page) => page.items) ?? []);

  return (
    <FlatList
      style={styles.list}
      data={users}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <UserListItem user={item} />}
      ListEmptyComponent={
        !query.isLoading ? (
          <Text style={styles.empty}>No followers yet.</Text>
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
  content: { padding: spacing.md, flexGrow: 1 },
  empty: { color: colors.muted, marginTop: spacing.xl, textAlign: 'center' },
});
