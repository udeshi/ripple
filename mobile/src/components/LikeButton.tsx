import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { rippleClient } from '../api/client';
import { useAuth } from '../lib/auth-context';

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
      disabled={mutation.isPending}
      onPress={() => {
        if (!user) {
          router.push('/login');
          return;
        }
        mutation.mutate();
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: liked ? '#e11d48' : '#71717a',
          fontWeight: liked ? '600' : '400',
        }}
      >
        {liked ? '♥' : '♡'} {count}
      </Text>
    </Pressable>
  );
}
