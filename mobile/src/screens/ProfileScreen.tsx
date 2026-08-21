import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Avatar } from '../components/Avatar';
import { AvatarUploader } from '../components/AvatarUploader';
import { FollowButton } from '../components/FollowButton';
import { rippleClient } from '../api/client';
import { useAuth } from '../lib/auth-context';

export function ProfileScreen({ username }: { username: string }) {
  const { user: currentUser } = useAuth();

  const profileQuery = useQuery({
    queryKey: ['profile', username],
    queryFn: () => rippleClient.users.getProfile(username),
  });
  const postsQuery = useInfiniteQuery({
    queryKey: ['userPosts', username],
    queryFn: ({ pageParam }) =>
      rippleClient.posts.byAuthor(username, { page: pageParam, limit: 12 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });

  if (profileQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!profileQuery.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>User not found.</Text>
      </View>
    );
  }

  const profile = profileQuery.data;
  const posts = postsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const isOwnProfile = currentUser?.username === username;

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={3}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {isOwnProfile ? (
              <AvatarUploader src={profile.avatarUrl} alt={profile.username} size={64} />
            ) : (
              <Avatar src={profile.avatarUrl} alt={profile.username} size={64} />
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.name}>
                {profile.displayName ?? profile.username}
              </Text>
              <Text style={styles.muted}>@{profile.username}</Text>
            </View>
            {!isOwnProfile && currentUser && (
              <FollowButton
                username={username}
                initialFollowing={profile.isFollowedByMe}
              />
            )}
          </View>
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
          <View style={styles.stats}>
            <Text style={styles.statText}>
              <Text style={styles.statNumber}>{profile.postsCount}</Text> posts
            </Text>
            <Link href={`/${username}/followers`}>
              <Text style={styles.statText}>
                <Text style={styles.statNumber}>{profile.followersCount}</Text>{' '}
                followers
              </Text>
            </Link>
            <Link href={`/${username}/following`}>
              <Text style={styles.statText}>
                <Text style={styles.statNumber}>{profile.followingCount}</Text>{' '}
                following
              </Text>
            </Link>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <Link href={`/posts/${item.id}`} asChild>
          <Pressable style={styles.gridItem}>
            <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
          </Pressable>
        </Link>
      )}
      onEndReached={() => {
        if (postsQuery.hasNextPage) void postsQuery.fetchNextPage();
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#71717a', fontSize: 14 },
  header: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600' },
  bio: { fontSize: 14, marginTop: 12 },
  stats: { flexDirection: 'row', gap: 20, marginTop: 16 },
  statText: { fontSize: 14 },
  statNumber: { fontWeight: '700' },
  gridItem: { flex: 1 / 3, aspectRatio: 1, margin: 1 },
  gridImage: { width: '100%', height: '100%' },
});
