import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { UserSummary } from '@ripple/api-client';
import { Avatar } from './Avatar';
import { colors, radii, spacing } from '../theme';

export function UserListItem({ user }: { user: UserSummary }) {
  return (
    <Link href={`/${user.username}`} asChild>
      <Pressable style={styles.row}>
        <Avatar src={user.avatarUrl} alt={user.username} size={44} />
        <View style={styles.info}>
          <Text style={styles.name}>{user.displayName ?? user.username}</Text>
          <Text style={styles.username}>@{user.username}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.lg,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  username: { fontSize: 13, color: colors.muted, marginTop: 1 },
});
