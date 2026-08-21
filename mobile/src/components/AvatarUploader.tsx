import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { rippleClient } from '../api/client';
import { Avatar } from './Avatar';

export function AvatarUploader({
  src,
  alt,
  size = 64,
}: {
  src: string | null;
  alt: string;
  size?: number;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (asset: ImagePicker.ImagePickerAsset) =>
      rippleClient.users.uploadAvatar({
        uri: asset.uri,
        name: asset.fileName ?? 'avatar.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      void queryClient.invalidateQueries({ queryKey: ['profile', alt] });
    },
  });

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) mutation.mutate(result.assets[0]);
  }

  return (
    <Pressable onPress={() => void pickImage()} disabled={mutation.isPending}>
      <View>
        <Avatar src={src} alt={alt} size={size} />
        {mutation.isPending && (
          <ActivityIndicator style={styles.spinner} size="small" color="#fff" />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  spinner: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
