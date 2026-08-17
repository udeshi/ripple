import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { rippleClient } from '../api/client';

export function FollowButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      following
        ? rippleClient.follows.unfollow(username)
        : rippleClient.follows.follow(username),
    onSuccess: (result) => {
      setFollowing(result.following);
      void queryClient.invalidateQueries({ queryKey: ['profile', username] });
    },
  });

  return (
    <Pressable
      disabled={mutation.isPending}
      onPress={() => mutation.mutate()}
      style={following ? styles.following : styles.follow}
    >
      <Text style={following ? styles.followingText : styles.followText}>
        {following ? 'Following' : 'Follow'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  follow: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followText: { color: 'white', fontWeight: '600', fontSize: 14 },
  following: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followingText: { color: '#18181b', fontSize: 14 },
});
