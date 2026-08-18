import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileScreen } from '../../src/screens/ProfileScreen';
import { useAuth } from '../../src/lib/auth-context';

export default function OwnProfileTab() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Log in to see your profile.</Text>
        <Link href="/login" style={styles.link}>
          Log in
        </Link>
      </View>
    );
  }

  return <ProfileScreen username={user.username} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  muted: { color: '#71717a' },
  link: { color: '#18181b', fontWeight: '600' },
});
