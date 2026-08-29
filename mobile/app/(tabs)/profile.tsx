import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileScreen } from '../../src/screens/ProfileScreen';
import { useAuth } from '../../src/lib/auth-context';
import { colors, radii, spacing } from '../../src/theme';

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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.background },
  muted: { color: colors.muted },
  link: {
    color: '#071018',
    fontWeight: '700',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
});
