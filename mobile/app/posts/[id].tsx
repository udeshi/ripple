import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { LikeButton } from '../../src/components/LikeButton';
import { rippleClient } from '../../src/api/client';
import { useAuth } from '../../src/lib/auth-context';

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const postQuery = useQuery({
    queryKey: ['post', id],
    queryFn: () => rippleClient.posts.get(id),
  });
  const commentsQuery = useQuery({
    queryKey: ['comments', id],
    queryFn: () => rippleClient.comments.list(id, { limit: 50 }),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => rippleClient.comments.create(id, content),
    onSuccess: () => {
      setComment('');
      void queryClient.invalidateQueries({ queryKey: ['comments', id] });
      void queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  if (postQuery.isLoading) {
    return <ActivityIndicator style={styles.center} />;
  }
  if (postQuery.isError || !postQuery.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Post not found.</Text>
      </View>
    );
  }

  const post = postQuery.data;

  return (
    <FlatList
      data={commentsQuery.data?.items ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View>
          <Link href={`/${post.author.username}`} asChild>
            <Pressable style={styles.header}>
              <Avatar src={post.author.avatarUrl} alt={post.author.username} size={32} />
              <Text style={styles.username}>
                {post.author.displayName ?? post.author.username}
              </Text>
            </Pressable>
          </Link>
          <Image source={{ uri: post.imageUrl }} style={styles.image} />
          {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}
          <View style={styles.actions}>
            <LikeButton postId={post.id} liked={post.isLikedByMe} count={post.likesCount} />
            <Text style={styles.muted}>{post.commentsCount} comments</Text>
          </View>
          {user && (
            <View style={styles.commentForm}>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Add a comment…"
                style={styles.commentInput}
              />
              <Pressable
                onPress={() => {
                  if (comment.trim()) commentMutation.mutate(comment.trim());
                }}
                disabled={commentMutation.isPending}
                style={styles.commentSubmit}
              >
                <Text style={styles.commentSubmitText}>Post</Text>
              </Pressable>
            </View>
          )}
          <Text style={styles.sectionTitle}>Comments</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.comment}>
          <Avatar src={item.author.avatarUrl} alt={item.author.username} size={24} />
          <Text style={styles.commentText}>
            <Text style={styles.commentAuthor}>{item.author.username} </Text>
            {item.content}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#71717a' },
  content: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  username: { fontSize: 14, fontWeight: '600' },
  image: { width: '100%', aspectRatio: 1, marginTop: 12, borderRadius: 8 },
  caption: { fontSize: 14, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 8, alignItems: 'center' },
  commentForm: { flexDirection: 'row', gap: 8, marginTop: 16 },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentSubmit: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  commentSubmitText: { color: 'white', fontWeight: '600', fontSize: 14 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
    marginTop: 20,
    marginBottom: 8,
  },
  comment: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  commentText: { flex: 1, fontSize: 14 },
  commentAuthor: { fontWeight: '600' },
});
