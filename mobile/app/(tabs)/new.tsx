import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '@ripple/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { rippleClient } from '../../src/api/client';
import { toUploadableFile } from '../../src/api/uploadableFile';
import { useAuth } from '../../src/lib/auth-context';
import { colors, radii, spacing } from '../../src/theme';

export default function NewPostScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      if (!image) throw new Error('Choose an image first');
      return rippleClient.posts.create({
        caption: caption || undefined,
        image: toUploadableFile(image.uri),
      });
    },
    onSuccess: (post) => {
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      if (user) {
        void queryClient.invalidateQueries({ queryKey: ['profile', user.username] });
        void queryClient.invalidateQueries({ queryKey: ['userPosts', user.username] });
      }
      setCaption('');
      setImage(null);
      router.push(`/posts/${post.id}`);
    },
    onError: (err) => {
      if (!(err instanceof ApiError)) console.error('Post creation failed:', err);
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    },
  });

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library access is required to choose an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      // iOS Photos assets are often HEIC, which browsers can't render — ask
      // for a broadly-compatible (JPEG) representation instead.
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });
    if (!result.canceled) setImage(result.assets[0]);
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Log in to create a post.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => void pickImage()} style={styles.picker}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.preview} />
        ) : (
          <View style={styles.pickerEmpty}>
            <Ionicons name="image-outline" size={32} color={colors.muted} />
            <Text style={styles.pickerText}>Choose an image</Text>
          </View>
        )}
      </Pressable>
      <TextInput
        placeholder="Write a caption…"
        placeholderTextColor={colors.muted}
        value={caption}
        onChangeText={setCaption}
        style={styles.input}
        multiline
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable
        onPress={() => {
          setError(null);
          mutation.mutate();
        }}
        disabled={mutation.isPending || !image}
        style={[styles.submit, (mutation.isPending || !image) && styles.submitDisabled]}
      >
        <Text style={styles.submitText}>
          {mutation.isPending ? 'Posting…' : 'Post'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  muted: { color: colors.muted },
  picker: {
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pickerEmpty: { alignItems: 'center', gap: spacing.sm },
  pickerText: { color: colors.muted },
  preview: { width: '100%', height: '100%' },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    color: colors.foreground,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: { color: colors.danger, fontSize: 14 },
  submit: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#071018', fontWeight: '700' },
});
