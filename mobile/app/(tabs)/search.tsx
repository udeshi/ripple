import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { UserListItem } from '../../src/components/UserListItem';
import { rippleClient } from '../../src/api/client';
import { colors, radii, spacing } from '../../src/theme';

export default function SearchScreen() {
  const [q, setQ] = useState('');

  const usersQuery = useQuery({
    queryKey: ['search', 'users', q],
    queryFn: () => rippleClient.search.users(q, { limit: 10 }),
    enabled: q.trim().length > 0,
  });
  const postsQuery = useQuery({
    queryKey: ['search', 'posts', q],
    queryFn: () => rippleClient.search.posts(q, { limit: 12 }),
    enabled: q.trim().length > 0,
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          placeholder="Search users or posts…"
          placeholderTextColor={colors.muted}
          value={q}
          onChangeText={setQ}
          style={styles.input}
          autoCapitalize="none"
        />
      </View>
      {q.trim().length > 0 && (
        <FlatList
          data={usersQuery.data?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <UserListItem user={item} />}
          ListHeaderComponent={<Text style={styles.sectionTitle}>People</Text>}
          ListFooterComponent={
            <>
              <Text style={styles.sectionTitle}>Posts</Text>
              <View style={styles.grid}>
                {postsQuery.data?.items.map((post) => (
                  <Link key={post.id} href={`/posts/${post.id}`} asChild>
                    <Pressable style={styles.gridItem}>
                      <Image
                        source={{ uri: post.imageUrl }}
                        style={styles.gridImage}
                      />
                    </Pressable>
                  </Link>
                ))}
              </View>
            </>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.foreground,
    paddingVertical: spacing.sm + 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  gridItem: { width: '32%', aspectRatio: 1, borderRadius: radii.sm, overflow: 'hidden' },
  gridImage: { width: '100%', height: '100%' },
});
