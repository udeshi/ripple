import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { toUploadableFile } from '../../src/api/uploadableFile';
import { useAuth } from '../../src/lib/auth-context';
import { reportViaAlert } from '../../src/lib/report';
import { colors, radii, spacing } from '../../src/theme';

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState('');
  const [editImage, setEditImage] = useState<ImagePicker.ImagePickerAsset>();

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

  const updateMutation = useMutation({
    mutationFn: (input: { caption: string; image?: ImagePicker.ImagePickerAsset }) =>
      rippleClient.posts.update(id, {
        caption: input.caption,
        image: input.image ? toUploadableFile(input.image.uri) : undefined,
      }),
    onSuccess: () => {
      setEditing(false);
      void queryClient.invalidateQueries({ queryKey: ['post', id] });
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      if (user) {
        void queryClient.invalidateQueries({ queryKey: ['profile', user.username] });
        void queryClient.invalidateQueries({ queryKey: ['userPosts', user.username] });
      }
    },
  });

  async function pickEditImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      // iOS Photos assets are often HEIC, which browsers can't render — ask
      // for a broadly-compatible (JPEG) representation instead.
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });
    if (!result.canceled) setEditImage(result.assets[0]);
  }

  const deleteMutation = useMutation({
    mutationFn: () => rippleClient.posts.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      if (user) {
        void queryClient.invalidateQueries({ queryKey: ['profile', user.username] });
        void queryClient.invalidateQueries({ queryKey: ['userPosts', user.username] });
      }
      router.back();
    },
  });

  if (postQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (postQuery.isError || !postQuery.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Post not found.</Text>
      </View>
    );
  }

  const post = postQuery.data;
  const isOwner = user?.id === post.authorId;

  function confirmDelete() {
    Alert.alert('Delete this post?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  }

  return (
    <FlatList
      style={styles.list}
      data={commentsQuery.data?.items ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View>
          <View style={styles.headerRow}>
            <Link href={`/${post.author.username}`} asChild>
              <Pressable style={styles.header}>
                <View style={styles.avatarRing}>
                  <Avatar src={post.author.avatarUrl} alt={post.author.username} size={32} />
                </View>
                <Text style={styles.username}>
                  {post.author.displayName ?? post.author.username}
                </Text>
              </Pressable>
            </Link>
            {isOwner && !editing && (
              <View style={styles.ownerActions}>
                <Pressable
                  onPress={() => {
                    setCaption(post.caption ?? '');
                    setEditImage(undefined);
                    setEditing(true);
                  }}
                >
                  <Text style={styles.ownerAction}>Edit</Text>
                </Pressable>
                <Pressable onPress={confirmDelete}>
                  <Text style={styles.ownerAction}>Delete</Text>
                </Pressable>
              </View>
            )}
            {user && !isOwner && (
              <Pressable onPress={() => reportViaAlert('POST', post.id)}>
                <Text style={styles.ownerAction}>Report</Text>
              </Pressable>
            )}
          </View>
          {!editing && (
            <Image source={{ uri: post.imageUrl }} style={styles.image} />
          )}
          {editing ? (
            <View style={styles.editForm}>
              <Pressable onPress={() => void pickEditImage()} style={styles.imageEditWrapper}>
                <Image
                  source={{ uri: editImage?.uri ?? post.imageUrl }}
                  style={styles.image}
                />
                <View style={styles.imageEditBadge}>
                  <Ionicons name="camera" size={15} color={colors.foreground} />
                  <Text style={styles.imageEditBadgeText}>Change photo</Text>
                </View>
              </Pressable>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                multiline
                style={styles.editInput}
              />
              <View style={styles.editActions}>
                <Pressable
                  onPress={() =>
                    updateMutation.mutate({ caption, image: editImage })
                  }
                  disabled={updateMutation.isPending}
                  style={styles.commentSubmit}
                >
                  <Text style={styles.commentSubmitText}>Save</Text>
                </Pressable>
                <Pressable onPress={() => setEditing(false)}>
                  <Text style={styles.ownerAction}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            post.caption && <Text style={styles.caption}>{post.caption}</Text>
          )}
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
                placeholderTextColor={colors.muted}
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
  list: { backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  muted: { color: colors.muted },
  content: { padding: spacing.lg, flexGrow: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  avatarRing: { borderRadius: 999, borderWidth: 2, borderColor: colors.accent, padding: 1 },
  ownerActions: { flexDirection: 'row', gap: spacing.lg },
  ownerAction: { fontSize: 14, color: colors.muted },
  username: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  image: { width: '100%', aspectRatio: 4 / 3, marginTop: spacing.md, borderRadius: radii.lg },
  imageEditWrapper: { position: 'relative' },
  imageEditBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.pill,
  },
  imageEditBadgeText: { color: colors.foreground, fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 15, lineHeight: 21, marginTop: spacing.sm, color: colors.foreground },
  editForm: { marginTop: spacing.sm, gap: spacing.sm },
  editInput: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.foreground,
    borderRadius: radii.lg,
    padding: spacing.sm,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm, alignItems: 'center' },
  commentForm: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.foreground,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  commentSubmit: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  commentSubmitText: { color: '#071018', fontWeight: '700', fontSize: 14 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  comment: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  commentText: { flex: 1, fontSize: 14, color: colors.foreground },
  commentAuthor: { fontWeight: '600' },
});
