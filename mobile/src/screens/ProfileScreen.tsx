import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { dedupeById } from '@ripple/api-client';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
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
import { useChat } from '../lib/chat-context';
import { reportViaAlert } from '../lib/report';
import { colors, gradientBanner, radii, shadow, spacing } from '../theme';

export function ProfileScreen({ username }: { username: string }) {
  const { user: currentUser } = useAuth();
  const { client: chatClient } = useChat();
  const router = useRouter();
  const [messaging, setMessaging] = useState(false);

  async function onMessage(otherId: string) {
    if (!chatClient || !currentUser) return;
    setMessaging(true);
    try {
      const { channelId } = await rippleClient.chat.createDirectChannel(otherId);
      router.push(`/chat/${channelId}`);
    } finally {
      setMessaging(false);
    }
  }

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
        <ActivityIndicator color={colors.accent} />
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
  const posts = dedupeById(
    postsQuery.data?.pages.flatMap((page) => page.items) ?? [],
  );
  const isOwnProfile = currentUser?.username === username;

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={3}
      style={styles.list}
      columnWrapperStyle={styles.gridRow}
      ListHeaderComponent={
        <View>
          <View style={styles.card}>
            <LinearGradient
              colors={gradientBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            />
            <View style={styles.headerRow}>
              {isOwnProfile ? (
                <AvatarUploader src={profile.avatarUrl} alt={profile.username} size={64} />
              ) : (
                <View style={styles.avatarRing}>
                  <Avatar src={profile.avatarUrl} alt={profile.username} size={64} />
                </View>
              )}
              <View style={styles.headerInfo}>
                <Text style={styles.name}>
                  {profile.displayName ?? profile.username}
                </Text>
                <Text style={styles.muted}>@{profile.username}</Text>
              </View>
            </View>
            {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
            {!isOwnProfile && currentUser && (
              <View style={styles.actionsRow}>
                <View style={styles.actionsRowGrow}>
                  <FollowButton
                    username={username}
                    initialFollowing={profile.isFollowedByMe}
                  />
                </View>
                {chatClient && (
                  <Pressable
                    style={styles.messageButton}
                    onPress={() => void onMessage(profile.id)}
                    disabled={messaging}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color={colors.foreground} />
                    <Text style={styles.messageButtonText}>Message</Text>
                  </Pressable>
                )}
                <Pressable
                  style={styles.reportButton}
                  onPress={() => reportViaAlert('USER', profile.id)}
                  hitSlop={8}
                >
                  <Ionicons name="flag-outline" size={18} color={colors.muted} />
                </Pressable>
              </View>
            )}
            <View style={styles.stats}>
              <View style={styles.statCell}>
                <Text style={styles.statNumber}>{profile.postsCount}</Text>
                <Text style={styles.statLabel}>posts</Text>
              </View>
              <Link href={`/${username}/followers`} asChild>
                <Pressable style={styles.statCell}>
                  <Text style={styles.statNumber}>{profile.followersCount}</Text>
                  <Text style={styles.statLabel}>followers</Text>
                </Pressable>
              </Link>
              <Link href={`/${username}/following`} asChild>
                <Pressable style={styles.statCell}>
                  <Text style={styles.statNumber}>{profile.followingCount}</Text>
                  <Text style={styles.statLabel}>following</Text>
                </Pressable>
              </Link>
            </View>
          </View>
          {posts.length > 0 && <Text style={styles.sectionTitle}>Ripple archive</Text>}
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
  list: { backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  muted: { color: colors.muted, fontSize: 14 },
  card: {
    margin: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radii.xxl,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 88,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: 36 },
  avatarRing: { borderRadius: 999, borderWidth: 2, borderColor: colors.accent, padding: 2 },
  headerInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  bio: { fontSize: 14, lineHeight: 20, marginTop: spacing.md, color: colors.foreground },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionsRowGrow: { flex: 1 },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  messageButtonText: { color: colors.foreground, fontWeight: '600', fontSize: 14 },
  reportButton: { padding: 4 },
  stats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 15, fontWeight: '700', color: colors.foreground },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  gridRow: { paddingHorizontal: spacing.lg, gap: 2 },
  gridItem: { flex: 1 / 3, aspectRatio: 1, margin: 1, borderRadius: radii.sm, overflow: 'hidden' },
  gridImage: { width: '100%', height: '100%' },
});
