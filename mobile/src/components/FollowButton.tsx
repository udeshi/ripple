import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { rippleClient } from '../api/client';
import { colors, radii, spacing } from '../theme';

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
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  followText: { color: '#071018', fontWeight: '700', fontSize: 14 },
  following: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  followingText: { color: colors.foreground, fontSize: 14, fontWeight: '600' },
});
