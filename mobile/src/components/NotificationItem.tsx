import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { Notification } from '@ripple/api-client';
import { Avatar } from './Avatar';

const VERB: Record<Notification['type'], string> = {
  LIKE: 'liked your post',
  COMMENT: 'commented on your post',
  FOLLOW: 'followed you',
};

export function NotificationItem({ notification }: { notification: Notification }) {
  const href = notification.postId
    ? (`/posts/${notification.postId}` as const)
    : (`/${notification.actor.username}` as const);

  return (
    <Link href={href} asChild>
      <Pressable style={[styles.row, !notification.read && styles.unread]}>
        <Avatar src={notification.actor.avatarUrl} alt={notification.actor.username} size={40} />
        <Text style={styles.text}>
          <Text style={styles.name}>
            {notification.actor.displayName ?? notification.actor.username}
          </Text>{' '}
          {VERB[notification.type]}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  unread: { backgroundColor: '#f4f4f5' },
  text: { flex: 1, fontSize: 14 },
  name: { fontWeight: '600' },
});
