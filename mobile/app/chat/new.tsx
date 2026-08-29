import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { SearchUserResult } from '@ripple/api-client';
import { Avatar } from '../../src/components/Avatar';
import { rippleClient } from '../../src/api/client';
import { useAuth } from '../../src/lib/auth-context';
import { useChat } from '../../src/lib/chat-context';
import { colors, radii, spacing } from '../../src/theme';

export default function NewMessageScreen() {
  const { client } = useChat();
  const { user } = useAuth();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [startingId, setStartingId] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ['search', 'users', q],
    queryFn: () => rippleClient.search.users(q, { limit: 20 }),
    enabled: q.trim().length > 0,
  });

  async function startChat(otherUser: SearchUserResult) {
    if (!client || !user || startingId) return;
    setStartingId(otherUser.id);
    try {
      const { channelId } = await rippleClient.chat.createDirectChannel(otherUser.id);
      router.replace(`/chat/${channelId}`);
    } finally {
      setStartingId(null);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search people…"
        placeholderTextColor={colors.muted}
        value={q}
        onChangeText={setQ}
        style={styles.input}
        autoCapitalize="none"
        autoFocus
      />
      <FlatList
        data={usersQuery.data?.items.filter((u) => u.id !== user?.id) ?? []}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          q.trim().length > 0 && !usersQuery.isLoading ? (
            <Text style={styles.muted}>No one found.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            disabled={startingId !== null}
            onPress={() => void startChat(item)}
          >
            <Avatar src={item.avatarUrl} alt={item.username} size={40} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.displayName ?? item.username}</Text>
              <Text style={styles.muted}>@{item.username}</Text>
            </View>
            {startingId === item.id && <ActivityIndicator size="small" color={colors.accent} />}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.foreground,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  muted: { color: colors.muted, fontSize: 14, marginTop: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.foreground },
});
