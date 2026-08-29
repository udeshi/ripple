import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Post } from '@ripple/api-client';
import { Avatar } from './Avatar';
import { LikeButton } from './LikeButton';
import { colors, radii, shadow, spacing } from '../theme';

export function PostCard({ post }: { post: Post }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href={`/${post.author.username}`} asChild>
          <Pressable style={styles.headerLeft}>
            <View style={styles.avatarRing}>
              <Avatar src={post.author.avatarUrl} alt={post.author.username} size={36} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.username} numberOfLines={1}>
                {post.author.displayName ?? post.author.username}
              </Text>
              <Text style={styles.handle} numberOfLines={1}>
                @{post.author.username}
              </Text>
            </View>
          </Pressable>
        </Link>
      </View>
      <Link href={`/posts/${post.id}`} asChild>
        <Pressable>
          <Image source={{ uri: post.imageUrl }} style={styles.image} />
        </Pressable>
      </Link>
      <View style={styles.body}>
        {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}
        <View style={styles.footer}>
          <LikeButton postId={post.id} liked={post.isLikedByMe} count={post.likesCount} />
          <Link href={`/posts/${post.id}`} asChild>
            <Pressable style={styles.footerAction}>
              <Ionicons name="chatbubble-outline" size={16} color={colors.muted} />
              <Text style={styles.meta}>{post.commentsCount}</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  avatarRing: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: 1,
  },
  headerText: { flex: 1 },
  username: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  handle: { fontSize: 12, color: colors.muted, marginTop: 1 },
  image: { width: '100%', aspectRatio: 4 / 3 },
  body: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
  caption: { fontSize: 14, lineHeight: 20, color: colors.foreground },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.sm },
  footerAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { fontSize: 13, color: colors.muted },
});
