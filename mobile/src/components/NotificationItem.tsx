import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { Notification } from '@ripple/api-client';
import { Avatar } from './Avatar';
import { colors, radii, spacing } from '../theme';

const VERB: Record<Notification['type'], string> = {
  LIKE: 'liked your post',
  COMMENT: 'commented on your post',
  FOLLOW: 'followed you',
};

const ICON: Record<Notification['type'], string> = {
  LIKE: '♥',
  COMMENT: '💬',
  FOLLOW: '➕',
};

export function NotificationItem({ notification }: { notification: Notification }) {
  const href = notification.postId
    ? (`/posts/${notification.postId}` as const)
    : (`/${notification.actor.username}` as const);

  return (
    <Link href={href} asChild>
      <Pressable
        style={StyleSheet.flatten([styles.row, !notification.read && styles.unread])}
      >
        <Avatar src={notification.actor.avatarUrl} alt={notification.actor.username} size={40} />
        <Text style={styles.text}>
          <Text style={styles.name}>
            {notification.actor.displayName ?? notification.actor.username}
          </Text>{' '}
          {VERB[notification.type]}
        </Text>
        {!notification.read && <Text style={styles.dot}>{ICON[notification.type]}</Text>}
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
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.xs,
  },
  unread: { backgroundColor: colors.surface },
  text: { flex: 1, fontSize: 14, color: colors.foreground },
  name: { fontWeight: '600' },
  dot: { color: colors.accent, fontSize: 12 },
});
