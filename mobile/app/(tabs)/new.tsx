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
import { useAuth } from '../../src/lib/auth-context';

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
        image: {
          uri: image.uri,
          name: image.fileName ?? 'photo.jpg',
          type: image.mimeType ?? 'image/jpeg',
        },
      });
    },
    onSuccess: (post) => {
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      setCaption('');
      setImage(null);
      router.push(`/posts/${post.id}`);
    },
    onError: (err) => {
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
          <Text style={styles.pickerText}>Choose an image</Text>
        )}
      </Pressable>
      <TextInput
        placeholder="Write a caption…"
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
        style={styles.submit}
      >
        <Text style={styles.submitText}>
          {mutation.isPending ? 'Posting…' : 'Post'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#71717a' },
  picker: {
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pickerText: { color: '#71717a' },
  preview: { width: '100%', height: '100%' },
  input: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: { color: '#e11d48', fontSize: 14 },
  submit: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitText: { color: 'white', fontWeight: '600' },
});
