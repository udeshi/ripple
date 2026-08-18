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
      <TextInput
        placeholder="Search users or posts…"
        value={q}
        onChangeText={setQ}
        style={styles.input}
        autoCapitalize="none"
      />
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
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
    marginTop: 16,
    marginBottom: 8,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  gridItem: { width: '32%', aspectRatio: 1 },
  gridImage: { width: '100%', height: '100%' },
});
