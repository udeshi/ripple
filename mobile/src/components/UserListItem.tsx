import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { UserSummary } from '@ripple/api-client';
import { Avatar } from './Avatar';

export function UserListItem({ user }: { user: UserSummary }) {
  return (
    <Link href={`/${user.username}`} asChild>
      <Pressable style={styles.row}>
        <Avatar src={user.avatarUrl} alt={user.username} size={40} />
        <View>
          <Text style={styles.name}>{user.displayName ?? user.username}</Text>
          <Text style={styles.username}>@{user.username}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  name: { fontSize: 14, fontWeight: '600' },
  username: { fontSize: 14, color: '#71717a' },
});
