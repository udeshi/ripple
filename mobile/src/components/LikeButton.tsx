import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { rippleClient } from '../api/client';
import { useAuth } from '../lib/auth-context';
import { colors } from '../theme';

export function LikeButton({
  postId,
  liked,
  count,
}: {
  postId: string;
  liked: boolean;
  count: number;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => rippleClient.posts.toggleLike(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      void queryClient.invalidateQueries({ queryKey: ['post', postId] });
      void queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });

  return (
    <Pressable
      style={styles.row}
      disabled={mutation.isPending}
      onPress={() => {
        if (!user) {
          router.push('/login');
          return;
        }
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        mutation.mutate();
      }}
    >
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={18}
        color={liked ? colors.danger : colors.muted}
      />
      <Text style={[styles.count, liked && styles.countLiked]}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  count: { fontSize: 13, color: colors.muted },
  countLiked: { color: colors.danger, fontWeight: '600' },
});
