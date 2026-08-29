import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { rippleClient } from '../api/client';
import { toUploadableFile } from '../api/uploadableFile';
import { Avatar } from './Avatar';
import { colors } from '../theme';

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
      rippleClient.users.uploadAvatar(toUploadableFile(asset.uri)),
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
      // iOS Photos assets are often HEIC, which browsers can't render — ask
      // for a broadly-compatible (JPEG) representation instead.
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });
    if (!result.canceled) mutation.mutate(result.assets[0]);
  }

  return (
    <Pressable onPress={() => void pickImage()} disabled={mutation.isPending}>
      <View style={{ borderRadius: size / 2, borderWidth: 2, borderColor: colors.accent, padding: 2 }}>
        <Avatar src={src} alt={alt} size={size} />
      </View>
      {mutation.isPending ? (
        <ActivityIndicator style={styles.spinner} size="small" color={colors.foreground} />
      ) : (
        <View style={styles.badge}>
          <Ionicons name="camera" size={12} color={colors.background} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  spinner: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    borderRadius: 999,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
