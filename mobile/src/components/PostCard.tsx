import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Post } from '@ripple/api-client';
import { Avatar } from './Avatar';
import { LikeButton } from './LikeButton';

export function PostCard({ post }: { post: Post }) {
  return (
    <View style={styles.container}>
      <Link href={`/${post.author.username}`} asChild>
        <Pressable style={styles.header}>
          <Avatar src={post.author.avatarUrl} alt={post.author.username} size={32} />
          <Text style={styles.username}>
            {post.author.displayName ?? post.author.username}
          </Text>
        </Pressable>
      </Link>
      <Link href={`/posts/${post.id}`} asChild>
        <Pressable>
          <Image source={{ uri: post.imageUrl }} style={styles.image} />
        </Pressable>
      </Link>
      {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}
      <View style={styles.footer}>
        <LikeButton postId={post.id} liked={post.isLikedByMe} count={post.likesCount} />
        <Link href={`/posts/${post.id}`}>
          <Text style={styles.meta}>{post.commentsCount} comments</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e4e4e7',
    paddingVertical: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  username: { fontSize: 14, fontWeight: '600' },
  image: { width: '100%', aspectRatio: 1, marginTop: 8 },
  caption: { fontSize: 14, paddingHorizontal: 12, marginTop: 8 },
  footer: { flexDirection: 'row', gap: 16, paddingHorizontal: 12, marginTop: 8 },
  meta: { fontSize: 14, color: '#71717a' },
});
